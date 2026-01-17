/**
 * CatPawOpen API 路由
 * 动态生成 index.js 和 index.js.md5
 *
 * 使用方式：
 * - GET /api/catvodopen/index.js - 获取 index.js
 * - GET /api/catvodopen/index.js.md5 - 获取 MD5 校验值
 * - GET /api/catvodopen/info - 获取版本信息
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateIndexJs, generateIndexMd5 } from '@/lib/catpawopen';

export const runtime = 'nodejs';

/**
 * 处理 index.js 请求
 */
async function handleIndexJs(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === '1';

    const info = await generateIndexJs(forceRefresh);

    const headers = new Headers({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Content-Length': info.size.toString(),
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'X-Content-MD5': info.md5,
      'X-Generated-At': new Date(info.timestamp).toISOString(),
    });

    return new NextResponse(new Uint8Array(info.buffer), { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate index.js',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 处理 MD5 请求
 */
async function handleMd5(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === '1';

    const md5 = await generateIndexMd5(forceRefresh);

    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    });

    return new NextResponse(md5, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate MD5',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 主路由处理器
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { pathname } = new URL(req.url);

  // 路由分发
  if (pathname.endsWith('/index.js.md5')) {
    return handleMd5(req);
  }

  if (pathname.endsWith('/index.js')) {
    return handleIndexJs(req);
  }

  // 默认返回信息
  return NextResponse.json(
    {
      message: 'CatPawOpen API',
      version: '1.0.0',
      endpoints: {
        indexJs: '/api/catvodopen/index.js',
        indexMd5: '/api/catvodopen/index.js.md5',
      },
      usage: {
        indexJs: 'GET /api/catvodopen/index.js - 获取动态生成的 index.js',
        indexMd5: 'GET /api/catvodopen/index.js.md5 - 获取 MD5 校验值',
        refresh: '添加 ?refresh=1 参数强制刷新缓存',
      },
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      },
    }
  );
}

/**
 * HEAD 请求支持
 */
export async function HEAD(req: NextRequest): Promise<NextResponse> {
  const { pathname } = new URL(req.url);

  try {
    if (pathname.endsWith('/index.js')) {
      const info = await generateIndexJs();
      return new NextResponse(null, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Content-Length': info.size.toString(),
          'X-Content-MD5': info.md5,
        },
      });
    }

    if (pathname.endsWith('/index.js.md5')) {
      const md5 = await generateIndexMd5();
      return new NextResponse(null, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Length': md5.length.toString(),
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

/**
 * CORS 预检支持
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
      'Access-Control-Max-Age': '86400',
    },
  });
}
