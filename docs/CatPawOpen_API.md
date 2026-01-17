# CatPawOpen API 功能说明

## 概述

CatPawOpen API 是一个动态生成 `index.js` 和 `index.js.md5` 文件的 API 端点。当外部客户端请求这些文件时，API 会根据配置的视频源实时生成这些文件。

## 功能特性

✅ **动态生成**: 无需预生成文件，通过 API 端点实时生成
✅ **智能缓存**: 自动缓存生成的文件（1小时），支持强制刷新
✅ **MD5 校验**: 自动计算并提供 MD5 校验值
✅ **CORS 支持**: 完整的跨域资源共享支持
✅ **源配置灵活**: 支持从多个来源（环境变量、数据库、配置文件）加载源配置

## API 端点

### 1. 获取 index.js

**请求**:
```bash
GET /api/catvodopen/index.js
```

**响应**:
- Content-Type: `application/javascript; charset=utf-8`
- Body: 完整的 JavaScript 代码

**查询参数**:
- `refresh=1`: 强制刷新缓存，重新生成文件

**示例**:
```bash
# 获取缓存的 index.js
curl http://localhost:3000/api/catvodopen/index.js

# 强制刷新
curl http://localhost:3000/api/catvodopen/index.js?refresh=1
```

### 2. 获取 MD5 校验值

**请求**:
```bash
GET /api/catvodopen/index.js.md5
```

**响应**:
- Content-Type: `text/plain; charset=utf-8`
- Body: MD5 校验值（32 个十六进制字符）

**示例**:
```bash
curl http://localhost:3000/api/catvodopen/index.js.md5
# 输出: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3. 获取 API 信息

**请求**:
```bash
GET /api/catvodopen
```

**响应**:
```json
{
  "message": "CatPawOpen API",
  "version": "1.0.0",
  "endpoints": {
    "indexJs": "/api/catvodopen/index.js",
    "indexMd5": "/api/catvodopen/index.js.md5"
  },
  "usage": {
    "indexJs": "GET /api/catvodopen/index.js - 获取动态生成的 index.js",
    "indexMd5": "GET /api/catvodopen/index.js.md5 - 获取 MD5 校验值",
    "refresh": "添加 ?refresh=1 参数强制刷新缓存"
  }
}
```

### 4. HEAD 请求

支持 HEAD 请求用于检查文件可用性和获取头部信息：

```bash
curl -I http://localhost:3000/api/catvodopen/index.js
```

### 5. CORS 预检

支持 OPTIONS 请求用于 CORS 预检：

```bash
curl -X OPTIONS http://localhost:3000/api/catvodopen/index.js
```

## 生成的 index.js 格式

生成的 `index.js` 是一个 JavaScript 模块，包含以下导出：

```javascript
// 获取所有启用的源
getSources() -> Array<{name, url, type, headers}>

// 通过名称获取特定源
getSourceByName(name) -> {name, url, type, headers} | undefined

// 获取源列表
getSourceList() -> Array<{name, type}>

// 获取版本信息
getVersion() -> {version, generatedAt, sourceCount}

// 检查源的可用性（异步）
checkSourceHealth(sourceName) -> Promise<{available, statusCode?, error?, timestamp}>
```

## 视频源配置

源配置位于 [src/lib/catpawopen.ts](src/lib/catpawopen.ts) 中的 `getVideoSources()` 函数。

### 默认配置示例

```typescript
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
```

### 扩展配置来源

`getVideoSources()` 函数可以扩展为从以下来源获取配置：

1. **环境变量**:
```typescript
const sourcesFromEnv = JSON.parse(process.env.VIDEO_SOURCES || '[]');
```

2. **数据库**:
```typescript
const sourcesFromDb = await db.sources.findAll();
```

3. **配置文件**:
```typescript
const sourcesFromFile = require('../config/sources.json');
```

4. **请求参数** (在 API 路由中):
```typescript
const sources = req.nextUrl.searchParams.get('sources');
```

## 使用场景

### 1. 动态更新视频源

无需重新部署，直接更新数据库中的源配置，API 会自动生成新的 `index.js`。

### 2. 源健康检查

使用 `checkSourceHealth()` 方法检查源的可用性，自动移除不可用的源。

### 3. 多租户支持

可以根据用户或请求参数生成不同的源列表。

### 4. CI/CD 集成

在构建流程中，可以通过调用此 API 生成配置文件：

```bash
# 生成 index.js
curl -o index.js http://localhost:3000/api/catvodopen/index.js

# 生成并验证 MD5
curl -o index.js.md5 http://localhost:3000/api/catvodopen/index.js.md5
```

## 缓存策略

- **缓存时长**: 1 小时 (3600 秒)
- **强制刷新**: 添加 `?refresh=1` 参数
- **缓存键**: 基于源配置的内容

## 错误处理

### 常见错误

**500 - Failed to generate index.js**
- 原因：源配置读取失败或生成过程出错
- 解决：检查视频源配置是否正确

**404 - Not Found**
- 原因：访问了无效的端点路径
- 解决：检查 API 端点是否正确

## 响应头

| 头部 | 说明 |
|------|------|
| `Content-Type` | 文件 MIME 类型 |
| `Content-Length` | 文件大小（字节） |
| `Cache-Control` | 缓存策略 |
| `X-Content-MD5` | 内容 MD5 校验值 |
| `X-Generated-At` | 生成时间戳 |
| `Access-Control-Allow-Origin` | CORS 允许源 |

## 开发和测试

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 测试 index.js 生成
curl http://localhost:3000/api/catvodopen/index.js

# 测试 MD5 生成
curl http://localhost:3000/api/catvodopen/index.js.md5

# 测试信息端点
curl http://localhost:3000/api/catvodopen
```

### 使用 curl 进行完整测试

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/catvodopen"

echo "1. 获取 API 信息..."
curl -s "$BASE_URL" | jq .

echo -e "\n2. 获取 index.js..."
curl -s "$BASE_URL/index.js" | head -20

echo -e "\n3. 获取 MD5..."
curl -s "$BASE_URL/index.js.md5"

echo -e "\n4. 测试 HEAD 请求..."
curl -I "$BASE_URL/index.js"

echo -e "\n5. 强制刷新..."
curl -s "$BASE_URL/index.js?refresh=1" | head -10
```

## 文件位置

- **库文件**: [src/lib/catpawopen.ts](src/lib/catpawopen.ts)
- **API 路由**: [src/app/api/catvodopen/route.ts](src/app/api/catvodopen/route.ts)
- **测试脚本**: [scripts/test-catpawopen.js](scripts/test-catpawopen.js)

## 相关文档

- TVSpider 参考: https://github.com/jadehh/TVSpider/tree/main/nodejs
- Issue: #2 catpawopen api

## 版本历史

### v1.0.0 (2026-01-17)
- ✅ 初始实现
- ✅ 动态生成 index.js
- ✅ MD5 校验值支持
- ✅ 缓存管理
- ✅ CORS 支持
- ✅ 源配置管理
