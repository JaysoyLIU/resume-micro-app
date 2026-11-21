// src/utils/ai.ts
// DeepSeek API 封装（通过云函数调用，不在前端直接暴露 key）

import { aiPolish as cloudAiPolish } from './cloud'
import type { AiPolishType } from '../types/resume'

/**
 * 对简历文本进行 AI 润色
 * @returns 润色后的文本
 * @throws 当超出配额时抛出 'LIMIT_EXCEEDED'，API 错误抛出 'API_ERROR'
 */
export async function polishText(
  text: string,
  type: AiPolishType
): Promise<string> {
  if (!text.trim()) throw new Error('TEXT_EMPTY')

  const result = await cloudAiPolish(text, type)
  return result.result
}

/** 构建 AI 润色的系统提示词（在云函数中使用，前端仅供参考） */
export function buildPrompt(type: AiPolishType): string {
  const prompts: Record<AiPolishType, string> = {
    experience:
      '你是一位资深的求职顾问，专门帮助候选人优化简历中的工作经历描述。' +
      '请将用户提供的原始经历描述改写为：' +
      '1. 以动词开头（负责、主导、优化、设计、实现等）' +
      '2. 包含具体数据（提升X%、减少Xms、覆盖X用户等）' +
      '3. 突出个人贡献而非团队贡献' +
      '4. 不超过3句话，每句话一个要点' +
      '5. 输出纯文本，不加任何格式符号',

    project:
      '你是简历优化专家，请将项目经历改写为：' +
      '1. 先描述项目背景和你的角色' +
      '2. 再描述核心技术实现' +
      '3. 最后给出量化的项目成果' +
      '4. 控制在2-3句话以内，输出纯文本',

    summary:
      '请将以下个人简介改写得更加专业、简洁和有吸引力。' +
      '突出求职者的核心竞争力和职业价值，100字以内，输出纯文本。',
  }
  return prompts[type]
}
