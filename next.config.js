/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */

const nextConfig = {
  // 根据环境自动选择输出模式：Vercel自动处理，Docker使用standalone
  // 本地开发时不使用 standalone 避免 Windows 符号链接权限问题
  ...(process.env.VERCEL || process.env.DOCKER_BUILD
    ? { output: 'standalone' }
    : {}),

  reactStrictMode: false,

  // 禁用中间件警告 - 使用 middleware.ts 处理请求转写和认证
  // Next.js 16 仍完全支持 middleware.ts，仅有弃用提示
  // 参考: https://nextjs.org/docs/messages/middleware-to-proxy
  skipMiddlewareUrlNormalization: true,

  // Next.js 16 使用 Turbopack，配置 SVG 加载
  turbopack: {
    root: __dirname,
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Uncoment to add domain whitelist
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
