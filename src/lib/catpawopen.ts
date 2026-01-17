/**
 * CatPawOpen Index.js 生成器
 * 根据配置的视频源动态生成 index.js 和 md5
 */

import crypto from 'crypto';

interface VideoSource {
  name: string;
  url: string;
  type?: string; // 'spider' | 'api' | 'custom'
  enabled?: boolean;
}

interface CatPawOpenConfig {
  sources: VideoSource[];
  version?: string;
  description?: string;
}

interface CatPawOpenIndexInfo {
  buffer: Buffer;
  md5: string;
  size: number;
  timestamp: number;
}

let cache: CatPawOpenIndexInfo | null = null;
const INDEX_CACHE_TTL = 60 * 60 * 1000; // 缓存1小时

/**
 * 生成 MD5 校验值
 */
function calculateMd5(buf: Buffer): string {
  return crypto.createHash('md5').update(buf).digest('hex');
}

/**
 * 生成 index.js 的 JavaScript 代码
 * 参考 TVSpider 的格式
 */
function generateIndexJsContent(config: CatPawOpenConfig): string {
  const timestamp = new Date().toISOString();
  const enabledSources = config.sources.filter((s) => s.enabled !== false);

  // 构建源配置对象
  const sourcesCode = enabledSources
    .map(
      (source) => `
    {
      name: '${source.name.replace(/'/g, "\\'")}',
      url: '${source.url.replace(/'/g, "\\'")}',
      type: '${source.type || 'api'}',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }`
    )
    .join(',');

  const indexJs = `
/**
 * CatPawOpen Index.js
 * 自动生成于 ${timestamp}
 * 版本: ${config.version || '1.0.0'}
 * 描述: ${config.description || 'Dynamic generated index for video sources'}
 */

(function() {
  'use strict';

  // 视频源配置
  const SOURCES = [${sourcesCode}
  ];

  // 版本信息
  const VERSION = '${config.version || '1.0.0'}';
  const GENERATED_AT = '${timestamp}';

  /**
   * 获取所有启用的源
   */
  function getSources() {
    return SOURCES;
  }

  /**
   * 通过名称获取特定源
   */
  function getSourceByName(name) {
    return SOURCES.find(s => s.name === name);
  }

  /**
   * 获取源列表
   */
  function getSourceList() {
    return SOURCES.map(s => ({
      name: s.name,
      type: s.type
    }));
  }

  /**
   * 获取版本信息
   */
  function getVersion() {
    return {
      version: VERSION,
      generatedAt: GENERATED_AT,
      sourceCount: SOURCES.length
    };
  }

  /**
   * 检查源的可用性
   */
  async function checkSourceHealth(sourceName) {
    const source = getSourceByName(sourceName);
    if (!source) {
      return { available: false, error: 'Source not found' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(source.url, {
        method: 'HEAD',
        headers: source.headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return {
        available: response.ok,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 导出接口
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getSources,
      getSourceByName,
      getSourceList,
      getVersion,
      checkSourceHealth,
      VERSION,
      GENERATED_AT
    };
  }

  // 全局作用域暴露
  if (typeof window !== 'undefined') {
    window.CatPawOpen = {
      getSources,
      getSourceByName,
      getSourceList,
      getVersion,
      checkSourceHealth,
      VERSION,
      GENERATED_AT
    };
  }
})();
`;

  return indexJs;
}

/**
 * 从环境或配置获取视频源
 */
function getVideoSources(): VideoSource[] {
  // 这里可以从多个来源读取配置：
  // 1. 环境变量
  // 2. 数据库
  // 3. 配置文件
  // 4. 请求参数

  // 默认配置示例
  const defaultSources: VideoSource[] = [
    {
      name: 'CatVodSpider',
      url: 'https://agit.ai/Yoursmile7/TVBox/raw/branch/master/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
    },
    {
      name: 'FongMi',
      url: 'https://raw.githubusercontent.com/FongMi/CatVodSpider/main/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
    },
  ];

  // 可以扩展为从数据库或配置服务获取
  return defaultSources;
}

/**
 * 生成 index.js 文件
 */
export async function generateIndexJs(
  forceRefresh = false
): Promise<CatPawOpenIndexInfo> {
  const now = Date.now();

  // 检查缓存
  if (!forceRefresh && cache && now - cache.timestamp < INDEX_CACHE_TTL) {
    return cache;
  }

  try {
    const sources = getVideoSources();

    const config: CatPawOpenConfig = {
      sources,
      version: '1.0.0',
      description: 'CatPawOpen dynamic index for video sources',
    };

    const content = generateIndexJsContent(config);
    const buffer = Buffer.from(content, 'utf-8');
    const md5 = calculateMd5(buffer);

    const info: CatPawOpenIndexInfo = {
      buffer,
      md5,
      size: buffer.length,
      timestamp: now,
    };

    cache = info;
    return info;
  } catch (error) {
    throw new Error(
      `Failed to generate index.js: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 生成 MD5 文件内容
 */
export async function generateIndexMd5(forceRefresh = false): Promise<string> {
  const info = await generateIndexJs(forceRefresh);
  return `${info.md5}`;
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  cache = null;
}
