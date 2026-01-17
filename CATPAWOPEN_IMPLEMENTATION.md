# CatPawOpen API 实现总结

## 🎉 功能完成

已成功实现 **CatPawOpen API** 功能，支持通过 API 端点动态生成 `index.js` 和 `index.js.md5` 文件。

## 📁 创建的文件

### 1. 核心库文件
- **[src/lib/catpawopen.ts](src/lib/catpawopen.ts)** 
  - 核心生成逻辑
  - MD5 计算函数
  - 缓存管理
  - 视频源配置管理

### 2. API 路由
- **[src/app/api/catvodopen/route.ts](src/app/api/catvodopen/route.ts)**
  - `GET /api/catvodopen/index.js` - 获取动态生成的 JavaScript 文件
  - `GET /api/catvodopen/index.js.md5` - 获取 MD5 校验值
  - `GET /api/catvodopen` - 获取 API 信息和端点列表
  - 支持 HEAD 和 OPTIONS 请求
  - 完整的 CORS 支持

### 3. 配置示例
- **[src/lib/catpawopen-config.example.ts](src/lib/catpawopen-config.example.ts)**
  - 10 个实用的配置示例
  - 源配置接口定义
  - 多种选择源的方式（环境变量、地理位置、环境类型等）
  - 源验证和过滤工具函数

### 4. 文档
- **[docs/CatPawOpen_API.md](docs/CatPawOpen_API.md)**
  - 完整的 API 使用文档
  - 端点说明和示例
  - 缓存策略说明
  - 开发和测试指南

### 5. 测试脚本
- **[scripts/test-catpawopen.js](scripts/test-catpawopen.js)**
  - 验证文件创建
  - 测试生成逻辑
  - 端点验证

## 🚀 快速开始

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试 API

**获取 index.js**:
```bash
curl http://localhost:3000/api/catvodopen/index.js
```

**获取 MD5**:
```bash
curl http://localhost:3000/api/catvodopen/index.js.md5
```

**获取 API 信息**:
```bash
curl http://localhost:3000/api/catvodopen
```

**强制刷新缓存**:
```bash
curl http://localhost:3000/api/catvodopen/index.js?refresh=1
```

## 🎯 主要功能

✅ **动态生成** - 无需预生成文件，按需生成
✅ **智能缓存** - 自动缓存 1 小时，支持强制刷新
✅ **MD5 校验** - 自动计算和提供 MD5 值
✅ **CORS 支持** - 完整的跨域资源共享支持
✅ **灵活配置** - 支持从多个来源加载源配置
✅ **源管理** - 支持启用/禁用、优先级、自定义头等
✅ **错误处理** - 完善的错误处理和日志
✅ **性能优化** - 缓存、并发支持、连接复用

## 📋 生成的 index.js 内容

生成的 JavaScript 文件包含以下导出：

```typescript
// 获取所有源
getSources(): Array<{name, url, type, headers}>

// 通过名称获取源
getSourceByName(name): VideoSource | undefined

// 获取源列表
getSourceList(): Array<{name, type}>

// 获取版本信息
getVersion(): {version, generatedAt, sourceCount}

// 检查源健康状态
checkSourceHealth(sourceName): Promise<{available, statusCode?, error?, timestamp}>
```

## 🔧 自定义配置

### 方式 1: 修改源配置

编辑 [src/lib/catpawopen.ts](src/lib/catpawopen.ts) 中的 `getVideoSources()` 函数：

```typescript
function getVideoSources(): VideoSource[] {
  return [
    {
      name: 'MySource',
      url: 'https://example.com/source.jar',
      type: 'spider',
      enabled: true,
    },
    // ... 更多源
  ];
}
```

### 方式 2: 使用环境变量

设置 `VIDEO_SOURCES` 环境变量为 JSON 字符串。

### 方式 3: 从数据库加载

修改 `getVideoSources()` 从数据库查询源配置。

### 方式 4: 从配置文件加载

使用 `require()` 或 `import` 加载配置文件。

## 📊 API 响应示例

### 1. 成功获取 index.js

```
HTTP/1.1 200 OK
Content-Type: application/javascript; charset=utf-8
Content-Length: 2345
Cache-Control: public, max-age=3600
X-Content-MD5: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
X-Generated-At: 2026-01-17T10:30:00.000Z

// 返回 JavaScript 代码
(function() {
  const SOURCES = [
    { name: 'Source1', url: 'https://...', type: 'spider' },
    // ...
  ];
  // ...
})();
```

### 2. 获取 MD5

```
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 32

a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3. API 信息

```json
{
  "message": "CatPawOpen API",
  "version": "1.0.0",
  "endpoints": {
    "indexJs": "/api/catvodopen/index.js",
    "indexMd5": "/api/catvodopen/index.js.md5"
  }
}
```

## 🔄 缓存策略

- **缓存时长**: 1 小时
- **刷新参数**: `?refresh=1` 强制重新生成
- **缓存键**: 基于源配置

## 🛠️ 技术细节

### 架构

```
API Request
    ↓
Route Handler (route.ts)
    ↓
Path Analysis
    ↓
├─→ /index.js → generateIndexJs()
├─→ /index.js.md5 → generateIndexMd5()
└─→ / → API Info

    ↓
Cache Check
    ↓
Cache Valid? → Return Cached
    ↓
Cache Invalid/Force Refresh
    ↓
Generate New
    ↓
Update Cache
    ↓
Return Response
```

### 性能优化

1. **内存缓存** - 避免重复生成
2. **TTL 策略** - 自动过期旧数据
3. **MD5 计算优化** - 流式处理大文件
4. **CORS 预检缓存** - 浏览器级别缓存
5. **连接复用** - 减少 TCP 连接开销

## 🧪 测试

### 单元测试

运行测试脚本验证功能：

```bash
node scripts/test-catpawopen.js
```

### 集成测试

使用 curl 或 Postman 测试 API：

```bash
# 基础测试
curl http://localhost:3000/api/catvodopen

# index.js 测试
curl -v http://localhost:3000/api/catvodopen/index.js

# MD5 测试
curl -v http://localhost:3000/api/catvodopen/index.js.md5

# 强制刷新
curl http://localhost:3000/api/catvodopen/index.js?refresh=1

# HEAD 请求
curl -I http://localhost:3000/api/catvodopen/index.js

# OPTIONS CORS 预检
curl -X OPTIONS http://localhost:3000/api/catvodopen/index.js -v
```

## 📝 使用场景

### 1. 动态源更新

更新数据库中的源配置，无需重新部署应用。

### 2. A/B 测试

为不同的用户组提供不同的源列表。

### 3. 地理位置优化

根据用户位置提供最优的源。

### 4. 故障转移

自动检测源的可用性，移除不可用的源。

### 5. CI/CD 集成

在构建流程中生成和验证配置文件。

## 🐛 故障排除

### Q: API 返回 500 错误

**A**: 检查源配置是否正确。运行测试脚本验证。

### Q: 生成的文件太大

**A**: 检查源列表数量。可以使用 `enabledOnly` 过滤器。

### Q: MD5 值不一致

**A**: 确保源列表在缓存期间没有变化。使用 `?refresh=1` 强制刷新。

### Q: CORS 请求失败

**A**: API 已配置允许所有源的 CORS。检查客户端请求头。

## 🔗 相关资源

- [TVSpider 参考](https://github.com/jadehh/TVSpider/tree/main/nodejs)
- [Issue #2: catpawopen api](https://github.com/Decohererk/DecoTV/issues/2)
- [完整 API 文档](docs/CatPawOpen_API.md)
- [配置示例](src/lib/catpawopen-config.example.ts)

## 📌 下一步改进

- [ ] 数据库源配置存储
- [ ] 源健康检查定时任务
- [ ] 多租户支持
- [ ] 源版本控制
- [ ] 源更新日志
- [ ] 更复杂的源路由策略
- [ ] GraphQL API 支持

## 📄 许可证

此代码继承项目的原有许可证。

---

**实现日期**: 2026-01-17
**版本**: 1.0.0
**状态**: ✅ 完成
