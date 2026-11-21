// src/utils/cloud.ts
// 所有云开发调用统一走这里，不在页面直接调用 wx.cloud

import Taro from '@tarojs/taro'
import type { Resume, AiPolishType, AiPolishResult, UserInfo } from '../types/resume'

/** 调用云函数的泛型封装 */
async function callFunction<T>(name: string, data: Record<string, unknown>): Promise<T> {
  const res = await Taro.cloud.callFunction({ name, data })
  const result = res.result as { error?: string } & T
  if (result.error) throw new Error(result.error)
  return result
}

// ─────────────────────────────────────────
// 简历 CRUD
// ─────────────────────────────────────────

export async function fetchResumes(): Promise<Resume[]> {
  const db = Taro.cloud.database()
  const res = await db.collection('resumes')
    .orderBy('updatedAt', 'desc')
    .limit(20)
    .get()
  return res.data as Resume[]
}

export async function createResume(resume: Omit<Resume, '_id'>): Promise<string> {
  const db = Taro.cloud.database()
  const res = await db.collection('resumes').add({ data: resume })
  return res._id as string
}

export async function updateResume(id: string, data: Partial<Resume>): Promise<void> {
  const db = Taro.cloud.database()
  await db.collection('resumes').doc(id).update({ data })
}

export async function deleteResume(id: string): Promise<void> {
  const db = Taro.cloud.database()
  await db.collection('resumes').doc(id).remove()
}

// ─────────────────────────────────────────
// AI 润色
// ─────────────────────────────────────────

export async function aiPolish(
  text: string,
  type: AiPolishType
): Promise<AiPolishResult> {
  return callFunction<AiPolishResult>('aiPolish', { text, type })
}

// ─────────────────────────────────────────
// PDF 导出
// ─────────────────────────────────────────

export async function exportPdf(
  resumeId: string,
  templateId: string
): Promise<string> {
  const res = await callFunction<{ fileUrl: string }>('exportPdf', { resumeId, templateId })
  return res.fileUrl
}

// ─────────────────────────────────────────
// 用户信息
// ─────────────────────────────────────────

export async function fetchUserInfo(): Promise<UserInfo> {
  const db = Taro.cloud.database()
  const res = await db.collection('users').limit(1).get()
  return res.data[0] as UserInfo
}
