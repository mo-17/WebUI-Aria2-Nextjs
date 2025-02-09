# WebUI-Aria2-Nextjs

这是一个基于 Next.js 开发的现代化 Aria2 Web 用户界面，提供了直观、美观且功能强大的下载管理体验。

## 🌟 特性

- 💡 现代化的用户界面设计
- 🚀 基于 Next.js 15 和 React 19 构建
- 🎨 使用 Tailwind CSS 实现响应式设计
- 🔄 实时更新下载状态 (Socket.IO)
- 📊 下载数据可视化 (Recharts)
- 🌍 国际化支持 (next-intl)
- 🎯 拖拽排序功能 (dnd-kit)
- 📱 移动端友好

## 🛠️ 技术栈

- **框架**: Next.js 15.1.6
- **UI**: React 19, Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **实时通信**: Socket.IO
- **类型检查**: TypeScript
- **代码规范**: ESLint

## ⚙️ Aria2 服务器配置

### 快速启动方式

如果你想快速启动 Aria2 而不需要配置文件，可以直接使用以下命令：

```bash
# 基础启动命令
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --rpc-listen-port=6800

# 添加 RPC 密钥的启动命令（推荐）
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --rpc-listen-port=6800 --rpc-secret=YOUR_SECRET_TOKEN

# 后台运行版本
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --rpc-listen-port=6800 --rpc-secret=YOUR_SECRET_TOKEN -D
```

### 完整配置方式

1. 安装 Aria2（根据你的系统选择对应的命令）：

   ```bash
   # macOS
   brew install aria2

   # Ubuntu/Debian
   sudo apt install aria2

   # CentOS/RHEL
   sudo yum install aria2
   ```

2. 创建配置文件目录和配置文件：

   ```bash
   mkdir -p ~/.aria2
   touch ~/.aria2/aria2.conf
   ```

3. 配置文件内容（~/.aria2/aria2.conf）：

   ```conf
   # 基本配置
   dir=${HOME}/Downloads
   input-file=${HOME}/.aria2/aria2.session
   save-session=${HOME}/.aria2/aria2.session
   save-session-interval=60

   # RPC 配置
   enable-rpc=true
   rpc-allow-origin-all=true
   rpc-listen-all=true
   rpc-listen-port=6800
   rpc-secret=your_secret_token

   # 下载配置
   max-concurrent-downloads=5
   continue=true
   max-connection-per-server=16
   min-split-size=10M
   split=16
   max-overall-download-limit=0
   max-download-limit=0

   # BT 配置
   enable-dht=true
   bt-enable-lpd=true
   enable-peer-exchange=true
   bt-tracker=<你的 tracker 列表>
   ```

4. 启动 Aria2 服务器：

   ```bash
   # 前台运行（调试用）
   aria2c --conf-path=${HOME}/.aria2/aria2.conf

   # 后台运行（推荐）
   aria2c --conf-path=${HOME}/.aria2/aria2.conf -D
   ```

5. 验证服务器状态：

   ```bash
   curl http://localhost:6800/jsonrpc
   ```

注意：
- 请将配置文件中的 `your_secret_token` 替换为你自己的密钥
- 确保 6800 端口未被其他程序占用
- 如需自动启动，可配置系统服务或启动项

## 🚀 快速开始

1. 确保你已安装 Node.js (推荐使用最新的 LTS 版本)

2. 克隆项目并安装依赖：
   ```bash
   git clone [your-repository-url]
   cd webui-aria2-nextjs
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 📦 构建部署

构建生产版本：
```bash
npm run build
npm run start
```

## 🤝 贡献指南

欢迎提交 Pull Request 和 Issue！在提交之前，请确保：

1. 代码通过 ESLint 检查
2. 新功能包含适当的测试
3. 遵循现有的代码风格

## 📝 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件
