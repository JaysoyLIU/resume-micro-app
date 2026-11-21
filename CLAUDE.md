# CLAUDE.md — AI简历助手小程序

> 这是 Claude Code 的上下文文件，放在项目根目录。每次启动 Claude Code 时自动读取。

---

## 项目简介

**产品**：AI简历生成器微信小程序  
**目标用户**：应届大学生、校招求职者  
**核心价值**：帮用户把干瘪的经历描述变成有数据感的简历亮点句，并提供好看的模板和 PDF 导出  
**开发者**：独立开发，vibe coding 风格，用 Cursor 辅助

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Taro 4 + React + TypeScript |
| 样式 | Taro 内置样式 + CSS Modules |
| 状态管理 | Zustand（轻量，适合小程序） |
| 后端/数据库 | 微信云开发（云函数 + 云数据库 + 云存储） |
| AI 接口 | DeepSeek API（通过云函数调用，不暴露 key） |
| PDF 导出 | 云函数 + Puppeteer |
| 支付 | 微信小程序支付 |

---

## 目录结构

```
project/
├── CLAUDE.md                  ← 你正在读的这个文件
├── src/
│   ├── app.ts                 ← 小程序入口
│   ├── app.config.ts          ← 页面路由配置
│   ├── pages/
│   │   ├── home/              ← 首页：简历列表 + 新建入口
│   │   ├── template/          ← 模板选择页
│   │   ├── editor/            ← 简历编辑页（核心页面）
│   │   ├── preview/           ← 预览 + 导出页
│   │   └── profile/           ← 个人中心 + 会员页
│   ├── components/
│   │   ├── ResumeCard/        ← 简历列表卡片
│   │   ├── TemplateCard/      ← 模板卡片
│   │   ├── AiPolishModal/     ← AI润色弹窗
│   │   └── PayModal/          ← 付费引导弹窗
│   ├── store/
│   │   ├── resumeStore.ts     ← 简历数据状态
│   │   └── userStore.ts       ← 用户/会员状态
│   ├── utils/
│   │   ├── ai.ts              ← DeepSeek API 封装
│   │   ├── cloud.ts           ← 云开发工具函数
│   │   └── pay.ts             ← 支付工具函数
│   └── types/
│       └── resume.ts          ← 简历数据类型定义
├── cloudfunctions/
│   ├── aiPolish/              ← AI润色云函数
│   │   └── index.js
│   └── exportPdf/             ← PDF导出云函数
│       └── index.js
└── package.json
```

---

## 核心数据结构

```typescript
// src/types/resume.ts

interface Resume {
  _id: string
  userId: string
  title: string           // 简历标题，如"字节-产品岗"
  templateId: string      // 使用的模板 ID
  updatedAt: number       // 时间戳
  data: ResumeData
}

interface ResumeData {
  basic: {
    name: string
    phone: string
    email: string
    intention: string     // 求职意向
    summary: string       // 个人简介
  }
  education: EducationItem[]
  experience: ExperienceItem[]  // 实习/工作经历
  projects: ProjectItem[]
  skills: string[]
}

interface ExperienceItem {
  id: string
  company: string
  role: string
  startDate: string       // "2024.06"
  endDate: string         // "2024.09" 或 "至今"
  description: string     // 用户原始描述
  polished: string        // AI润色后的版本（可选）
}
```

---

## 云函数说明

### aiPolish（AI润色）

```javascript
// 入参
{ text: string, type: 'experience' | 'project' | 'summary' }

// 出参
{ result: string, tokensUsed: number }

// 注意
// - DeepSeek API key 存在云函数环境变量，不要硬编码
// - 每次调用前检查用户剩余次数
// - 失败时返回 { error: 'LIMIT_EXCEEDED' | 'API_ERROR' | 'TIMEOUT' }
```

### exportPdf（PDF导出）

```javascript
// 入参
{ resumeId: string, templateId: string }

// 出参
{ fileUrl: string }  // 云存储临时链接，有效期 2 小时

// 注意
// - 用 Puppeteer 渲染 HTML 模板后截图转 PDF
// - 仅会员用户可调用，云函数内部验证
// - 超时时间设为 60s（Puppeteer 启动慢）
```

---

## 编码规范

- 语言：全部用 **TypeScript**，不允许 `any`
- 组件：函数式组件 + Hooks，不用 Class 组件
- 样式：CSS Modules，文件名 `index.module.scss`
- 命名：组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE
- 每个文件头部注释标明路径，如 `// src/pages/home/index.tsx`
- 云函数调用统一走 `src/utils/cloud.ts` 封装，不要在页面里直接调用 `wx.cloud`

---

## 付费逻辑

```
免费用户：
  - AI润色：每天 3 次（按自然日重置）
  - 模板：2 套基础模板
  - 导出：长图无限，PDF ❌

会员用户（¥19.9/月）：
  - AI润色：无限次
  - 模板：全部解锁
  - 导出：PDF ✅

AI次数包（¥6/10次）：
  - 不开会员的低门槛入口
```

用户状态存在云数据库 `users` 集合，字段：`vipExpireAt`（时间戳）、`aiQuotaToday`、`aiQuotaExtra`

---

## 微信审核注意事项

- 不要出现"AI生成"字样，改用"智能优化"
- 不要出现"一键生成简历"，改用"快速制作简历"
- 付费功能必须有对应的服务说明页
- 小程序支付需要企业主体，个人号先用虚拟商品绕过测试

---

## 当前任务

> ⚠️ 每次开始新功能前，更新这里

**当前阶段**：第 1 周 — 项目搭建

**正在做**：初始化 Taro 项目，搭建基本页面路由和首页框架

**下一步**：实现简历编辑页的数据填写和本地保存

**已完成**：无

---

## 常用命令

```bash
# 启动开发
npm run dev:weapp

# 构建生产
npm run build:weapp

# 在微信开发者工具打开
# 项目目录选 dist/

# 安装依赖
npm install
```
