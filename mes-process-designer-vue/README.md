# 线束 MES 工序流程设计器

独立运行的 Vue 3 + Vite 静态项目，用于线束制造工艺路线的拖拽配置、节点参数维护、流程校验和 JSON 导出。

## 功能

- 从工序库拖拽添加节点
- 在流程画布内拖拽调整工序顺序
- 配置工序编码、名称、工作中心、工位、节拍与质量规则
- 内置基础端子线和双绞线束模板
- 校验工艺编码、工序编码、工位及标准工时
- 查看工艺路线与完整 JSON 配置
- 将草稿保存到浏览器并再次读取
- 导出 JSON 文件
- 响应式布局

## 本地运行

要求 Node.js 20.19+ 或 22.12+，推荐 Node.js 22。

```bash
npm install
npm run dev
```

浏览器访问终端输出的本地地址。

## 生产构建

```bash
npm ci
npm run build
```

静态产物位于 `dist/`。项目使用相对资源路径，可部署到域名根目录或任意子目录。

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。

1. 将本项目全部文件提交到 GitHub 仓库的 `main` 分支。
2. 打开仓库 `Settings → Pages`。
3. 在 `Build and deployment` 的 `Source` 中选择 `GitHub Actions`。
4. 重新推送一次代码，或进入 `Actions` 手动运行 `Deploy GitHub Pages`。
5. 部署成功后通过 `https://<用户名>.github.io/<仓库名>/` 访问。

## 部署到 EdgeOne Pages

1. 将项目提交到 GitHub、GitLab 或 Gitee。
2. 在 EdgeOne Pages 创建项目并导入该仓库。
3. 框架预设选择 `Vue` 或 `Vite`。
4. 安装命令：`npm ci`
5. 构建命令：`npm run build`
6. 输出目录：`dist`
7. Node.js 版本：`22`

该项目为纯前端静态页面，不需要 Worker、Node.js 服务、数据库或环境变量。

## 项目结构

```text
.
├── .github/workflows/deploy-pages.yml
├── src/
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 数据说明

草稿存储在浏览器 `localStorage` 中，键名为：

```text
harness-mes-process-draft
```

清理浏览器站点数据会删除本地草稿。导出的 JSON 文件不受影响。
