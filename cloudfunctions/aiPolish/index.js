// cloudfunctions/aiPolish/index.js
// 通过 DeepSeek API 对简历文本进行智能优化
// API key 存放在云函数环境变量 DEEPSEEK_API_KEY，不要硬编码

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const PROMPTS = {
  experience:
    '你是资深求职顾问，请将以下工作经历描述改写为：\n' +
    '1. 以动词开头（负责、主导、优化、实现等）\n' +
    '2. 包含具体数据（提升X%、缩短Xms、覆盖X用户）\n' +
    '3. 突出个人贡献\n' +
    '4. 不超过3句话\n' +
    '直接输出改写结果，不要解释。',

  project:
    '请将以下项目经历改写为包含：背景与角色、技术实现、量化成果的简历描述。' +
    '控制在2-3句话，直接输出结果。',

  summary:
    '请将以下个人简介改写得专业、简洁且有吸引力，突出核心竞争力，100字以内，直接输出结果。',
}

// 检查用户配额
async function checkAndDeductQuota(db, openid, isVip) {
  if (isVip) return true

  const userRes = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const user = userRes.data[0]
  if (!user) return false

  // 优先使用付费次数包
  if (user.aiQuotaExtra > 0) {
    await db.collection('users').doc(user._id).update({
      data: { aiQuotaExtra: db.command.inc(-1) }
    })
    return true
  }

  // 使用每日免费次数
  if (user.aiQuotaToday > 0) {
    await db.collection('users').doc(user._id).update({
      data: { aiQuotaToday: db.command.inc(-1) }
    })
    return true
  }

  return false
}

exports.main = async (event, context) => {
  const { text, type } = event
  const { OPENID } = cloud.getWXContext()

  if (!text || !type || !PROMPTS[type]) {
    return { error: 'INVALID_PARAMS' }
  }

  const db = cloud.database()
  const apiKey = process.env.DEEPSEEK_API_KEY

  // 验证用户及配额
  const userRes = await db.collection('users').where({ _openid: OPENID }).limit(1).get()
  const user = userRes.data[0]
  const isVip = user && user.vipExpireAt > Date.now()

  const hasQuota = await checkAndDeductQuota(db, OPENID, isVip)
  if (!hasQuota) {
    return { error: 'LIMIT_EXCEEDED' }
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: PROMPTS[type] },
          { role: 'user', content: text },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || ''

    return {
      result,
      tokensUsed: data.usage?.total_tokens || 0,
    }
  } catch (err) {
    console.error('DeepSeek API error:', err)
    return { error: 'API_ERROR' }
  }
}
