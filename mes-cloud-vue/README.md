# 云端 MES 管理平台 DEMO

一个可独立运行的 Vue3 + Vite 演示项目，用于 GitHub Pages、EdgeOne Pages 或其他静态站点平台部署。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/` 目录。

## GitHub Pages / EdgeOne Pages

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：建议 20 或更高

`vite.config.js` 已设置 `base: './'`，适合部署到 GitHub Pages 的子路径，也适合 EdgeOne Pages 静态部署。

## 演示覆盖范围

菜单覆盖：首页、组织权限、主数据、工艺管理、BOM 管理、图纸管理、计划排产、工单管理、质量管理、追溯中心、设备管理、标签中心、异常 Andon、报表分析、配置中心、集成中心、云边运维、实施管理、系统设置。
