// src/utils/pay.ts

import Taro from '@tarojs/taro'

export type PayProduct = 'vip_monthly' | 'ai_pack_10'

const PRODUCTS: Record<PayProduct, { name: string; price: number }> = {
  vip_monthly: { name: '会员月卡', price: 1990 },  // 单位：分
  ai_pack_10:  { name: 'AI次数包×10', price: 600 },
}

/**
 * 发起微信支付
 * 实际项目中需要后端生成 prepay_id，这里是骨架
 */
export async function requestPayment(product: PayProduct): Promise<void> {
  const prod = PRODUCTS[product]

  // TODO: 调用云函数生成支付参数
  // const payParams = await callFunction('createOrder', { product })

  // 模拟支付调用（实际替换为真实参数）
  Taro.showModal({
    title: `购买${prod.name}`,
    content: `价格：¥${(prod.price / 100).toFixed(2)}`,
    confirmText: '去支付',
    success: (res) => {
      if (res.confirm) {
        // 实际调用 Taro.requestPayment(payParams)
        Taro.showToast({ title: '支付成功', icon: 'success' })
      }
    },
  })
}
