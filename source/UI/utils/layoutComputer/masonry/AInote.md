# 这个区段由开发者编写,未经允许禁止AI修改

# 修改记录

## 2025-05-01

- **依赖迁移**: 将 `layout.js` 对 `static/rbush.js` 的直接依赖，修改为引用 `src/toolBox/base/useGeometry/forSpatialIndex/forRbush.js` 中的封装（包括辅助函数）。 