// src/pages/template/index.tsx
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import { useUserStore } from '../../store/userStore'
import { createResume } from '../../utils/cloud'
import type { Template } from '../../types/resume'
import styles from './index.module.scss'

const TEMPLATES: Template[] = [
  {
    id: 'bauhaus-01',
    name: 'Bauhaus Classic',
    preview: '',
    isPremium: false,
    accent: '#D02020',
  },
  {
    id: 'bauhaus-02',
    name: 'Bauhaus Blue',
    preview: '',
    isPremium: false,
    accent: '#1040C0',
  },
  {
    id: 'bauhaus-gold',
    name: 'Bauhaus Gold',
    preview: '',
    isPremium: true,
    accent: '#F0C020',
  },
  {
    id: 'minimal-01',
    name: 'Minimal',
    preview: '',
    isPremium: true,
    accent: '#121212',
  },
]

const ACCENT_SHAPES = ['○', '□', '△', '◇']

export default function TemplatePage() {
  const { selectedTemplateId, setSelectedTemplateId } = useResumeStore()
  const { isVip } = useUserStore()
  const [creating, setCreating] = useState(false)

  const handleSelect = (tpl: Template) => {
    if (tpl.isPremium && !isVip()) {
      Taro.showModal({
        title: '会员专属模板',
        content: '开通会员解锁全部模板，享受无限 AI 润色',
        confirmText: '去开通',
        confirmColor: '#D02020',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/profile/index' })
          }
        },
      })
      return
    }
    setSelectedTemplateId(tpl.id)
  }

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    try {
      const id = await createResume({
        userId: '',
        title: '新建简历',
        templateId: selectedTemplateId,
        updatedAt: Date.now(),
        data: {
          basic: { name: '', phone: '', email: '', intention: '', summary: '' },
          education: [],
          experience: [],
          projects: [],
          skills: [],
        },
      })
      Taro.redirectTo({ url: `/pages/editor/index?id=${id}` })
    } catch {
      Taro.showToast({ title: '创建失败', icon: 'error' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <View className={styles.page}>

      {/* ── Header ── */}
      <View className={styles.header}>
        <View className={styles.header__deco} />
        <Text className={styles.header__label}>STEP 01</Text>
        <Text className={styles.header__title}>选择{'\n'}模板</Text>
      </View>

      {/* ── Template grid ── */}
      <ScrollView className={styles.scroll} scrollY>
        <View className={styles.grid}>
          {TEMPLATES.map((tpl, i) => {
            const isSelected = selectedTemplateId === tpl.id
            const locked = tpl.isPremium && !isVip()
            return (
              <View
                key={tpl.id}
                className={`${styles.tpl_card} ${isSelected ? styles['tpl_card--selected'] : ''}`}
                onClick={() => handleSelect(tpl)}
              >
                {/* Preview area */}
                <View
                  className={styles.tpl_card__preview}
                  style={{ borderColor: isSelected ? tpl.accent : '#121212' }}
                >
                  {/* Bauhaus miniature composition */}
                  <View className={styles.preview_bg} style={{ backgroundColor: tpl.accent + '15' }}>
                    <View className={styles.preview_bar} style={{ backgroundColor: tpl.accent }} />
                    <View className={styles.preview_lines}>
                      {[0.6, 0.4, 0.7, 0.5, 0.45].map((w, j) => (
                        <View key={j} className={styles.preview_line} style={{ width: `${w * 100}%` }} />
                      ))}
                    </View>
                    <Text className={styles.preview_shape}>{ACCENT_SHAPES[i % 4]}</Text>
                  </View>

                  {locked && (
                    <View className={styles.tpl_card__lock}>
                      <Text className={styles.tpl_card__lock_icon}>VIP</Text>
                    </View>
                  )}

                  {isSelected && (
                    <View
                      className={styles.tpl_card__check}
                      style={{ backgroundColor: tpl.accent }}
                    >
                      <Text className={styles.tpl_card__check_mark}>✓</Text>
                    </View>
                  )}
                </View>

                <View className={styles.tpl_card__info}>
                  <Text className={styles.tpl_card__name}>{tpl.name}</Text>
                  {tpl.isPremium && (
                    <View className={styles.tpl_card__badge}>
                      <Text>VIP</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        <View className={styles.safe} />
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View className={styles.bottom}>
        <View
          className={styles.cta_btn}
          onClick={handleCreate}
        >
          <Text className={styles.cta_btn__text}>
            {creating ? '创建中...' : '使用此模板 →'}
          </Text>
        </View>
      </View>

    </View>
  )
}
