# CatPawOpen API 快速参考

## 🎯 概述

动态生成 `index.js` 和 `index.js.md5` 的 API 端点。

## 📍 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/catvodopen/index.js` | GET | 获取动态生成的 JavaScript 文件 |
| `/api/catvodopen/index.js.md5` | GET | 获取 MD5 校验值 |
| `/api/catvodopen` | GET | 获取 API 信息 |

## 💡 使用示例

### 1. 基础请求

```bash
# 获取 index.js
curl http://localhost:3000/api/catvodopen/index.js

# 获取 MD5
curl http://localhost:3000/api/catvodopen/index.js.md5

# 获取 API 信息
curl http://localhost:3000/api/catvodopen
```

### 2. 强制刷新

```bash
curl http://localhost:3000/api/catvodopen/index.js?refresh=1
```

### 3. JavaScript 中使用

```javascript
// 获取 index.js
fetch('/api/catvodopen/index.js')
  .then(res => res.text())
  .then(code => eval(code));

// 获取 MD5
fetch('/api/catvodopen/index.js.md5')
  .then(res => res.text())
  .then(md5 => console.log('MD5:', md5));

// 获取 API 信息
fetch('/api/catvodopen')
  .then(res => res.json())
  .then(info => console.log(info));
```

## 🔧 配置

编辑 `src/lib/catpawopen.ts` 中的 `getVideoSources()`:

```typescript
function getVideoSources(): VideoSource[] {
  return [
    {
      name: 'SourceName',
      url: 'https://example.com/source.jar',
      type: 'spider',
      enabled: true,
    },
  ];
}
```

## 📊 响应格式

### index.js

```javascript
(function() {
  const SOURCES = [{...}];
  
  function getSources() { return SOURCES; }
  function getSourceByName(name) { ... }
  function getSourceList() { ... }
  function getVersion() { ... }
  function checkSourceHealth(name) { ... }
  
  module.exports = {...};
})();
```

### index.js.md5

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### API Info

```json
{
  "message": "CatPawOpen API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

## 🔄 缓存

- **缓存时间**: 1 小时
- **强制刷新**: `?refresh=1`

## 📁 文件位置

- 库: `src/lib/catpawopen.ts`
- API: `src/app/api/catvodopen/route.ts`
- 配置示例: `src/lib/catpawopen-config.example.ts`
- 文档: `docs/CatPawOpen_API.md`

## 🚀 启动

```bash
npm run dev
```

访问 `http://localhost:3000/api/catvodopen`

## ❓ 常见问题

**Q: 如何自定义源?**
A: 编辑 `getVideoSources()` 函数或使用 `VIDEO_SOURCES` 环境变量。

**Q: 如何强制更新?**
A: 添加 `?refresh=1` 参数。

**Q: 支持哪些源类型?**
A: `spider`, `api`, `custom`

**Q: 生成的文件大小?**
A: 通常 2-5 KB，取决于源数量。

## 📚 文档

- 完整文档: [docs/CatPawOpen_API.md](docs/CatPawOpen_API.md)
- 实现总结: [CATPAWOPEN_IMPLEMENTATION.md](CATPAWOPEN_IMPLEMENTATION.md)
- 配置示例: [src/lib/catpawopen-config.example.ts](src/lib/catpawopen-config.example.ts)

---

**版本**: 1.0.0 | **状态**: ✅ 完成
