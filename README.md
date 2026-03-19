# 基于 Cloudflare Pages 的短网址生成工具

本项目是一个基于 Cloudflare Pages Functions 驱动的“无文件”短链接服务。它结合了 Cloudflare KV 存储，提供简单、快速且易于部署的短链接解决方案。

## 🚀 部署指南

### 1. 准备 KV 存储
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** -> **KV**。
3. 点击 **Create namespace**，名称可以命名为 `shorturl-kv`。

### 2. 部署到 Cloudflare Pages
1. 将本项目 Fork 到你的 GitHub 仓库。
2. 在 Cloudflare 控制台，进入 **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git**。
3. 选择你的仓库，点击 **Begin setup**。
4. **Build settings** 配置：
   - **Framework preset**: `None`
   - **Build command**: (保持为空)
   - **Build output directory**: `public`
5. 点击 **Save and Deploy**。

### 3. 配置环境变量和 KV 绑定
部署完成后，进入项目的 **Settings** -> **Functions**：

1. **KV namespace bindings**:
   - 点击 **Add binding**。
   - **Variable name** 必须填写：`DWZ_KV`。
   - **KV namespace** 选择你刚才创建的那个（如 `shorturl-kv`）。
2. **Environment variables**:
   - 点击 **Add variable**，配置以下变量：
     - `ADMIN_PASS`: 管理后台登录密码（默认使用 `admin123456`）。
     - `ADMIN_PATH`: 管理后台路径（默认使用 `admin`）。
     - `ANALYTICS_CODE`: (可选) 统计代码。
     - `UMAMI_HOST` / `UMAMI_WEBSITE_ID`: (可选) Umami 统计配置。

### 4. 重新部署
配置完成后，在 **Deployments** 页面点击 **Retry deployment**（或推送一个新提交）以使配置生效。

## ✨ 项目特色

- **零静态文件**: 整个前端直接由 Functions 提供服务，无需构建过程。
- **动态路由**: 使用 Cloudflare Pages Functions 实现通用路由器。
- **全球加速**: 基于 Cloudflare 的全球边缘网络，确保极低的跳转延迟。
- **简单管理**: 提供内置的 Web 管理界面，支持创建、删除和统计短链接。

## 🛠️ API 接口

- `POST /api/create` - 创建新的短链接。
- `GET /api/links` - 获取所有短链接列表。
- `DELETE /api/delete` - 删除指定的短链接。

## ⚖️ 开源协议
MIT License
