/**
 * CatPawOpen 源配置示例
 * 这是一个示例文件，展示如何定义视频源配置
 *
 * 使用方式：
 * 1. 复制此文件到你需要的位置
 * 2. 修改源配置
 * 3. 在 getVideoSources() 中引用此配置
 */

/**
 * 视频源接口定义
 */
export interface VideoSource {
  name: string; // 源名称，应该是唯一的
  url: string; // 源地址（JAR 或 API 端点）
  type?: 'spider' | 'api' | 'custom'; // 源类型，默认为 'api'
  enabled?: boolean; // 是否启用，默认为 true
  description?: string; // 描述信息
  headers?: Record<string, string>; // 自定义请求头
  timeout?: number; // 请求超时时间（毫秒）
  priority?: number; // 优先级，数字越大优先级越高
}

/**
 * 示例 1: 基础源配置
 */
export const BASIC_SOURCES: VideoSource[] = [
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

/**
 * 示例 2: 完整源配置（包含所有可选字段）
 */
export const FULL_SOURCES: VideoSource[] = [
  {
    name: 'CatVodSpider - 国内',
    url: 'https://agit.ai/Yoursmile7/TVBox/raw/branch/master/jar/custom_spider.jar',
    type: 'spider',
    enabled: true,
    description: '国内优化的 CatVodSpider 源',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Encoding': 'gzip, deflate',
    },
    timeout: 5000,
    priority: 10,
  },
  {
    name: 'FongMi - GitHub',
    url: 'https://raw.githubusercontent.com/FongMi/CatVodSpider/main/jar/custom_spider.jar',
    type: 'spider',
    enabled: true,
    description: 'FongMi 官方源',
    headers: {
      'User-Agent': 'curl/7.68.0',
    },
    timeout: 5000,
    priority: 8,
  },
  {
    name: 'DecoTV API',
    url: 'https://api.decotv.local/sources',
    type: 'api',
    enabled: true,
    description: '本地 DecoTV API 源',
    headers: {
      'Authorization': 'Bearer token_here',
      'Content-Type': 'application/json',
    },
    timeout: 3000,
    priority: 5,
  },
];

/**
 * 示例 3: 多区域源配置
 */
export const REGIONAL_SOURCES = {
  // 中国大陆
  cn: [
    {
      name: 'CatVodSpider - Gitee',
      url: 'https://gitee.com/Yoursmile7/TVBox/raw/master/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
      priority: 10,
    },
    {
      name: 'CatVodSpider - 加速',
      url: 'https://ghproxy.net/https://raw.githubusercontent.com/FongMi/CatVodSpider/main/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
      priority: 8,
    },
  ],
  // 国际
  international: [
    {
      name: 'FongMi - Raw GitHub',
      url: 'https://raw.githubusercontent.com/FongMi/CatVodSpider/main/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
      priority: 10,
    },
    {
      name: 'FongMi - Mirror',
      url: 'https://raw.gitmirror.com/FongMi/CatVodSpider/main/jar/custom_spider.jar',
      type: 'spider',
      enabled: true,
      priority: 8,
    },
  ],
  // 备用
  backup: [
    {
      name: 'Backup Spider 1',
      url: 'https://mirror-site-1.com/spider.jar',
      type: 'spider',
      enabled: true,
      priority: 5,
    },
    {
      name: 'Backup Spider 2',
      url: 'https://mirror-site-2.com/spider.jar',
      type: 'spider',
      enabled: false, // 默认禁用
      priority: 3,
    },
  ],
};

/**
 * 示例 4: 从环境变量加载源配置
 */
export function getSourcesFromEnv(): VideoSource[] {
  const sourcesJson = process.env.VIDEO_SOURCES || '[]';
  try {
    return JSON.parse(sourcesJson);
  } catch (error) {
    console.error('Failed to parse VIDEO_SOURCES from environment:', error);
    return BASIC_SOURCES;
  }
}

/**
 * 示例 5: 根据条件选择源配置
 */
export function getSourcesByEnvironment(): VideoSource[] {
  const env = process.env.NODE_ENV || 'production';

  if (env === 'development') {
    // 开发环境使用所有源进行测试
    return FULL_SOURCES;
  }

  if (env === 'staging') {
    // 测试环境使用完整源
    return FULL_SOURCES.filter((s) => s.enabled !== false);
  }

  // 生产环境使用基础源
  return BASIC_SOURCES;
}

/**
 * 示例 6: 根据地理位置选择源配置
 */
export function getSourcesByLocation(location: 'cn' | 'international' = 'cn'): VideoSource[] {
  const allSources = [
    ...REGIONAL_SOURCES.cn,
    ...REGIONAL_SOURCES.international,
  ];

  if (location === 'cn') {
    // 国内优先
    return allSources.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } else {
    // 国际优先（反向排序）
    return allSources
      .reverse()
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
}

/**
 * 示例 7: 过滤和转换源配置
 */
export function filterSources(
  sources: VideoSource[],
  options?: {
    enabledOnly?: boolean; // 仅返回已启用的源
    typeFilter?: string[]; // 按类型过滤
    sortByPriority?: boolean; // 按优先级排序
  }
): VideoSource[] {
  let filtered = [...sources];

  // 过滤已启用的源
  if (options?.enabledOnly) {
    filtered = filtered.filter((s) => s.enabled !== false);
  }

  // 按类型过滤
  if (options?.typeFilter && options.typeFilter.length > 0) {
    filtered = filtered.filter((s) => options.typeFilter!.includes(s.type || 'api'));
  }

  // 按优先级排序
  if (options?.sortByPriority) {
    filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  return filtered;
}

/**
 * 示例 8: 验证源配置
 */
export function validateSources(sources: VideoSource[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  sources.forEach((source, index) => {
    if (!source.name) {
      errors.push(`[${index}] Missing required field: name`);
    }
    if (!source.url) {
      errors.push(`[${index}] Missing required field: url`);
    }
    if (!source.url.startsWith('http://') && !source.url.startsWith('https://')) {
      errors.push(`[${index}] Invalid URL format: ${source.url}`);
    }
    if (source.type && !['spider', 'api', 'custom'].includes(source.type)) {
      errors.push(`[${index}] Invalid type: ${source.type}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 示例 9: 合并源配置
 */
export function mergeSources(...sourceArrays: VideoSource[][]): VideoSource[] {
  const merged = new Map<string, VideoSource>();

  for (const sources of sourceArrays) {
    for (const source of sources) {
      // 按名称去重，后面的覆盖前面的
      merged.set(source.name, source);
    }
  }

  return Array.from(merged.values());
}

/**
 * 示例 10: 导出为 JSON
 */
export function exportAsJson(sources: VideoSource[]): string {
  return JSON.stringify(sources, null, 2);
}

/**
 * 示例使用方式
 */
export async function exampleUsage() {
  console.log('=== CatPawOpen 源配置示例 ===\n');

  // 使用基础配置
  console.log('1. 基础配置:');
  console.log(BASIC_SOURCES);

  // 使用环境变量配置
  console.log('\n2. 环境变量配置:');
  console.log(getSourcesFromEnv());

  // 按环境选择配置
  console.log('\n3. 按环境选择配置:');
  console.log(getSourcesByEnvironment());

  // 按地理位置选择配置
  console.log('\n4. 按地理位置选择配置:');
  console.log(getSourcesByLocation('cn'));

  // 过滤源
  console.log('\n5. 过滤源 (仅启用的 spider 类型):');
  const filtered = filterSources(FULL_SOURCES, {
    enabledOnly: true,
    typeFilter: ['spider'],
    sortByPriority: true,
  });
  console.log(filtered);

  // 验证源
  console.log('\n6. 验证源:');
  const validation = validateSources(BASIC_SOURCES);
  console.log(`Valid: ${validation.valid}`);
  if (validation.errors.length > 0) {
    console.log('Errors:', validation.errors);
  }

  // 合并源
  console.log('\n7. 合并源:');
  const merged = mergeSources(BASIC_SOURCES, FULL_SOURCES);
  console.log(`Merged count: ${merged.length}`);

  // 导出为 JSON
  console.log('\n8. 导出为 JSON:');
  console.log(exportAsJson(BASIC_SOURCES.slice(0, 1)));
}
