// src/types/resume.ts

export interface EducationItem {
  id: string
  school: string
  major: string
  degree: string    // 学士 | 硕士 | 博士
  startDate: string // "2020.09"
  endDate: string   // "2024.06"
  gpa?: string
  awards?: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  startDate: string  // "2024.06"
  endDate: string    // "2024.09" 或 "至今"
  description: string  // 用户原始描述
  polished: string     // AI润色后的版本（空串表示未润色）
}

export interface ProjectItem {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  tech: string       // 技术栈，逗号分隔
  description: string
  polished: string
}

export interface ResumeData {
  basic: {
    name: string
    phone: string
    email: string
    intention: string  // 求职意向
    summary: string    // 个人简介
  }
  education: EducationItem[]
  experience: ExperienceItem[]
  projects: ProjectItem[]
  skills: string[]
}

export interface Resume {
  _id: string
  userId: string
  title: string       // 简历标题，如"字节-产品岗"
  templateId: string  // 使用的模板 ID
  updatedAt: number   // 时间戳
  data: ResumeData
}

export interface Template {
  id: string
  name: string
  preview: string    // 预览图 URL
  isPremium: boolean
  accent: string     // 主色
}

// AI相关
export type AiPolishType = 'experience' | 'project' | 'summary'

export interface AiPolishResult {
  result: string
  tokensUsed: number
}

// 用户
export interface UserInfo {
  openid: string
  nickname: string
  avatarUrl: string
  vipExpireAt: number   // 0 表示非会员
  aiQuotaToday: number  // 今日免费次数剩余
  aiQuotaExtra: number  // 付费次数包剩余
}
