# 个人作品集

基于 React、Vite 和 [Canvas UI](https://canvasui.dev/) 的中文运营作品集，展示小红书、抖音与社区运营案例，部署到 GitHub Pages。

## 本地开发

```bash
npm ci
npm run dev
```

生产构建：`npm run build`。构建产物在 `dist/`。

## 替换个人资料

编辑 [`src/content.ts`](src/content.ts) 中的姓名、简介、工作经历、案例、教育信息和联系方式。当前资料均为演示内容。邮箱、简历和案例链接留空时，页面不会显示对应链接。更新页面标题和分享文案时，也请编辑 `index.html`。

## 发布

仓库 Pages 设置选择 **Build and deployment → Source → GitHub Actions**。推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布网站：<https://1243sd.github.io/my-profile/>。

Canvas UI 组件源码位于 `components/canvasui/`。特效会在区域进入视口后加载，并响应系统“减少动态效果”设置。
