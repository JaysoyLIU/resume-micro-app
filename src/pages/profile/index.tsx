// src/pages/profile/index.tsx
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import type CustomTabBar from '../../custom-tab-bar/index'
import { useUserStore } from '../../store/userStore'
import { requestPayment } from '../../utils/pay'
import styles from './index.module.scss'

const FEATURES = [
  { symbol: '○', text: 'AI 智能优化，无限次', premium: true },
  { symbol: '□', text: '全部简历模板解锁', premium: true },
  { symbol: '△', text: 'PDF 导出', premium: true },
  { symbol: '◇', text: '长图导出', premium: false },
  { symbol: '○', text: '每日 3 次免费 AI', premium: false },
  { symbol: '□', text: '2 套基础模板', premium: false },
]

export default function Profile() {
  const { user, isVip, remainingFreeQuota } = useUserStore()
  const vip = isVip()

  useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(Taro.getCurrentInstance()?.page)
    tabbar?.setSelected(1)
  })

  return (
    <ScrollView className={styles.page} scrollY>

      {/* ── User hero ── */}
      <View className={styles.user_hero}>
        <View className={styles.user_hero__deco} />
        <View className={styles.user_hero__content}>
          <View className={styles.avatar}>
            <Text className={styles.avatar__text}>
              {user?.nickname?.[0] || '我'}
            </Text>
          </View>
          <View className={styles.user_info}>
            <Text className={styles.user_info__name}>
              {user?.nickname || '未登录用户'}
            </Text>
            <View className={styles.user_info__badge_row}>
              {vip ? (
                <View className={`${styles.badge} ${styles['badge--vip']}`}>
                  <Text>VIP 会员</Text>
                </View>
              ) : (
                <View className={`${styles.badge} ${styles['badge--free']}`}>
                  <Text>免费用户</Text>
                </View>
              )}
              <Text className={styles.user_info__quota}>
                今日剩余：{remainingFreeQuota()} 次
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── VIP Card ── */}
      {!vip && (
        <View className={styles.vip_card}>
          <View className={styles.vip_card__left}>
            <Text className={styles.vip_card__label}>UPGRADE</Text>
            <Text className={styles.vip_card__title}>开通会员</Text>
            <Text className={styles.vip_card__price}>
              <Text className={styles.vip_card__currency}>¥</Text>19.9
              <Text className={styles.vip_card__unit}>/月</Text>
            </Text>
          </View>
          <View className={styles.vip_card__right}>
            <View className={styles.vip_card__geo_circle} />
            <View className={styles.vip_card__geo_square} />
            <View
              className={styles.vip_card__btn}
              onClick={() => requestPayment('vip_monthly')}
            >
              <Text>立即开通</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── AI Pack ── */}
      <View className={styles.section}>
        <View className={styles.section__header}>
          <View className={styles.section__line} />
          <Text className={styles.section__title}>AI 次数包</Text>
        </View>
        <View
          className={styles.pack_card}
          onClick={() => requestPayment('ai_pack_10')}
        >
          <View className={styles.pack_card__left}>
            <Text className={styles.pack_card__symbol}>✦</Text>
            <View>
              <Text className={styles.pack_card__name}>AI 优化 × 10 次</Text>
              <Text className={styles.pack_card__desc}>按需购买，永不过期</Text>
            </View>
          </View>
          <View className={styles.pack_card__right}>
            <Text className={styles.pack_card__price}>¥6</Text>
            <Text className={styles.pack_card__arrow}>→</Text>
          </View>
        </View>
      </View>

      {/* ── Feature comparison ── */}
      <View className={styles.section}>
        <View className={styles.section__header}>
          <View className={styles.section__line} />
          <Text className={styles.section__title}>功能对比</Text>
        </View>
        <View className={styles.feature_table}>
          <View className={styles.feature_table__header}>
            <Text className={styles.feature_table__col_left}>功能</Text>
            <Text className={styles.feature_table__col}>免费</Text>
            <Text className={styles.feature_table__col}>会员</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={i} className={styles.feature_row}>
              <View className={styles.feature_row__name}>
                <Text className={styles.feature_row__symbol}>{f.symbol}</Text>
                <Text className={styles.feature_row__text}>{f.text}</Text>
              </View>
              <Text className={styles.feature_row__free}>{f.premium ? '—' : '✓'}</Text>
              <Text className={styles.feature_row__vip}>✓</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Footer ── */}
      <View className={styles.footer}>
        <View className={styles.footer__shapes}>
          <View className={styles.footer__circle} />
          <View className={styles.footer__square} />
          <View className={styles.footer__tri} />
        </View>
        <Text className={styles.footer__text}>© 2024 AI 简历 · Bauhaus Edition</Text>
        <Text className={styles.footer__legal}>隐私政策 · 服务条款</Text>
      </View>

      <View className={styles.safe} />
    </ScrollView>
  )
}
