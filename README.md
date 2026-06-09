# LinkVault | 极简网页链接收藏夹

LinkVault 是一款极简大方的网址收藏与管理工具。采用现代 Web 界面设计，包含毛玻璃（Glassmorphism）卡片效果、精美微动画与深浅色模式切换。应用数据安全地保存在浏览器本地，省去了后端数据库搭建的复杂性，并提供了便捷的一键导出备份与导入功能。

## ✨ 特色功能

1. **一键粘贴并添加**：调用浏览器 Clipboard API。当您复制任何网址后，只需在页面点击一个按钮，应用即可自动读取并解析该链接，自动解析出域名并归档。
2. **磨砂玻璃拟态设计**：极简、现代的设计语言，适配任何尺寸屏幕（响应式布局）。
3. **强大的分类与搜索**：内置多种预设分类（工作/学习、科技/开发、工具/效率、娱乐/休闲），支持星标（收藏）和关键字联想搜索。
4. **前端本地化存储**：无后台、无复杂配置，数据自动持久化到 `localStorage` 中。
5. **轻松备份与恢复**：支持一键导出数据为 `.json` 文件，并能随时通过该文件导入恢复。

---

## 🛠️ 本地开发运行

本项目基于 **Node.js** 的 **Vite + React** 框架构建。

### 1. 准备工作
确保本地已安装 Node.js 和 npm。

### 2. 安装依赖
在项目根目录下执行：
```bash
npm install
```

### 3. 启动本地开发服务
启动热更新开发服务器：
```bash
npm run dev
```
启动后在浏览器中打开命令行中输出的地址即可（通常为 `http://localhost:5173/`）。

### 4. 项目打包编译
要发布到服务器时，生成纯静态资产文件：
```bash
npm run build
```
编译生成的文件会存放在根目录的 `dist/` 文件夹中。这些是完全自包含的静态 HTML、CSS 和 JS 文件。

---

## 🚀 部署发布指南

### 一、 部署到 GitHub Pages (最推荐的免费静态托管)

GitHub 提供免费的静态网页托管服务。你可以配置一个 GitHub Actions 自动构建或使用 `gh-pages` 工具部署。

#### 方法 A：使用 `gh-pages` 包（最简单）

1. **配置 `vite.config.js`**：
   如果你部署到 `https://<用户名>.github.io/<项目名>/` 下，请修改项目根目录的 `vite.config.js` 文件，增加 `base` 路径：
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   // https://vite.dev/config/
   export default defineConfig({
     plugins: [react()],
     base: './', // 设为相对路径，这样项目在任何子目录下都可以正常运行
   })
   ```

2. **安装 gh-pages 工具**：
   ```bash
   npm install gh-pages --save-dev
   ```

3. **配置部署脚本**：
   在 `package.json` 的 `"scripts"` 部分添加下面两个脚本：
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. **执行部署**：
   在终端执行：
   ```bash
   npm run deploy
   ```
   工具会自动把打包好的 `dist/` 目录推送到你 GitHub 仓库的 `gh-pages` 分支，并在几分钟内在线发布。

---

### 二、 部署到 Hostinger (共享虚拟主机)

Hostinger 的共享主机托管非常适合静态网页。

#### 1. 打包项目
在本地根目录下运行打包命令：
```bash
npm run build
```
这会在根目录下生成 `dist` 文件夹。

#### 2. 上传到 Hostinger
1. 登录到你的 **Hostinger hPanel**。
2. 导航到 **File Manager (文件管理器)**。
3. 进入你网站的域名根目录目录（通常是 `public_html`）。
4. 将本地 `dist/` 文件夹内的**所有内容**（包括 `index.html`、`assets/` 文件夹等）上传到 `public_html` 目录中。
   - *提示*：为了加快上传速度，你可以先在本地将 `dist` 目录下的内容压缩成一个 `.zip` 文件，上传到 Hostinger 之后再在 File Manager 中直接在线解压。
5. 访问你的域名，即可看到收藏夹网页正常工作。

---

## 📄 许可声明

本项目基于 MIT 协议开源。
