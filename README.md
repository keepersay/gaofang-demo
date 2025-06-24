# 网元管理平台

## 项目简介

"网元管理平台" 是一个内部 SRE 工具，旨在提供一个统一的界面来管理逻辑集群组、用户、资源、网元和日志。本平台基于现代前端技术栈构建，以提供高效、直观的操作体验。

## 主要功能

- **逻辑集群组管理**: 提供对逻辑集群组的创建、编辑、删除和查询功能。
- **用户管理**: 包含用户列表的展示、搜索、过滤、排序、分页，以及用户的创建、编辑、禁用/启用和删除功能。近期已修复过滤功能，并优化了表格头部的过滤图标和样式。
- **登录日志管理**: 提供用户登录日志的查询、过滤和展示功能，支持时间范围查询和登录状态过滤。
- **操作日志管理**: 提供系统操作日志的查询、过滤和详情展示功能，支持时间范围、模块和操作类型过滤，并可查看操作详情。
- **灵活的导航结构**: 支持多级导航菜单，方便用户在不同模块间切换，包括总览、逻辑集群组、资源管理、日志管理和用户管理等。
- **通用表格过滤优化**: 实现了跨模块的表格头部过滤通用解决方案，确保过滤功能的健壮性和一致性。
- **可扩展的模块设计**: 采用组件化开发，便于未来功能扩展。

## 技术栈

- **前端框架**: Vue 3
- **UI 组件库**: Element Plus
- **构建工具**: Vite
- **路由管理**: Vue Router
- **语言**: JavaScript / TypeScript (根据实际项目文件决定)

## 安装与运行

### 1. 克隆仓库

```bash
git clone git@github.com:keepersay/gaofang-demo.git
cd gaofang-demo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行项目

```bash
npm run dev
```

项目将在 `http://localhost:5173/` 启动。

## 项目结构

```
.
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 静态资源，如图片、图标
│   │   ├── ClusterGroupModal.vue
│   │   ├── ClusterGroupQuotaDrawer.vue
│   │   ├── ClusterGroupTable.vue
│   │   ├── UserManagement/ # 用户管理相关组件
│   │   │   ├── UserModal.vue
│   │   │   └── UserTable.vue
│   │   ├── LogManagement/  # 日志管理相关页面和组件 (新增)
│   │   │   ├── LoginLog.vue
│   │   │   └── OperationLog.vue
│   │   └── Layout.vue      # 整体布局组件
│   ├── router/
│   │   └── index.js        # 路由配置
│   ├── views/              # 页面级组件
│   │   ├── ClusterGroup.vue
│   │   ├── Overview.vue
│   │   ├── Placeholder.vue # 占位页面
│   │   ├── ResourceManagement.vue
│   │   └── UserManagement.vue
│   ├── App.vue             # 应用根组件
│   └── main.js             # 应用入口文件
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖和脚本
├── vite.config.js          # Vite 配置
├── shims-vue.d.ts          # Vue 声明文件
└── README.md               # 项目说明 (当前文件)
```

## 贡献

我们欢迎并鼓励对本项目的贡献。如果您有任何改进建议或发现 Bug，请随时提交 Pull Request 或 Issue。

## 许可证

MIT License 
