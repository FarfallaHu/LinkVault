# LinkVault | Minimalist Bookmarks Manager

LinkVault is an elegant, clean, and modern bookmark collector and manager. Designed with a focus on premium aesthetics, it features a glassmorphism interface, smooth micro-animations, responsive layout, and automatic theme synchronization (light/dark mode). Your bookmark data is securely stored locally inside the browser's `localStorage`, requiring no complex database backend. It also offers cloud synchronization via GitHub API and local import/export file options.

## ✨ Core Features

1. **One-Click Paste & Add**: Integrates with the browser Clipboard API. Copy any URL, click the paste button, and LinkVault will capture, parse, and save it instantly.
2. **Glassmorphism Design**: Minimalist and state-of-the-art UI guidelines, fully responsive and styled beautifully for mobile, tablet, and desktop screens.
3. **Advanced Filtering & Search**: Includes keyword search matching and instant filtering for favorited (starred) bookmarks.
4. **Local and Offline First**: Fully client-side storage leveraging `localStorage` for rapid response and offline capability.
5. **Secure Backups**: Export your entire collection into a `.json` backup file, and restore it anytime with the file import utility.
6. **Admin Authorization**: Hide write actions, settings, and cloud synchronization buttons behind a secure client-side admin password.

---

## 🛠️ Local Development

This project is built using the **Vite + React** framework on **Node.js**.

### 1. Prerequisites
Ensure you have Node.js and npm installed on your machine.

### 2. Install Dependencies
Run the following command in the project root directory:
```bash
npm install
```

### 3. Start Development Server
Launch the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open the output URL in your browser (usually `http://localhost:5173/`).

### 4. Build for Production
Compile optimized static files for production hosting:
```bash
npm run build
```
The compiled assets will be saved inside the `dist/` directory, containing self-contained, clean HTML, CSS, and JS files.

---

## 🚀 Deployment Guide

### I. Deploy to GitHub Pages (Recommended Free Static Hosting)

GitHub Pages provides free static website hosting. You can easily publish using the `gh-pages` package.

#### Steps:

1. **Configure `vite.config.js`**:
   Verify that `base` is configured to relative paths (`./`) so assets resolve correctly in subdirectories:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: './', 
   })
   ```

2. **Deploy script**:
   Make sure you have `gh-pages` installed and added to your `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy**:
   Execute the deploy command in your terminal:
   ```bash
   npm run deploy
   ```
   This compiles the project and pushes the output `dist/` directory to the `gh-pages` branch of your GitHub repository.

---

### II. Deploy to Hostinger (Shared Hosting)

Hostinger's shared web hosting is ideal for deploying the compiled static build.

#### 1. Compile the build
Run the build script in your terminal:
```bash
npm run build
```
This generates the optimized `dist` folder.

#### 2. Upload to Hostinger
1. Log in to your **Hostinger hPanel**.
2. Navigate to **File Manager**.
3. Enter your website's root directory (usually `public_html`).
4. Upload all files and folders from inside the local `dist/` folder directly to the host directory.
   - *Tip*: You can compress the contents of `dist` into a `.zip` file, upload it, and use the online File Manager extraction tool to unpack it.
5. Visit your domain to verify the application is live and running.

---

## 📄 License

This project is open-source under the MIT License.
