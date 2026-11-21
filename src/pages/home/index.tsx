// src/pages/home/index.tsx
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import type CustomTabBar from '../../custom-tab-bar/index'
import { useResumeStore } from '../../store/resumeStore'
import { fetchResumes, deleteResume } from '../../utils/cloud'
import type { Resume } from '../../types/resume'
import styles from './index.module.scss'

// ─────────────────────────────────────────
// Resume Card
// ─────────────────────────────────────────
function ResumeCard({
  resume,
  accentIndex,
  onEdit,
  onDelete,
}: {
  resume: Resume
  accentIndex: number
  onEdit: () => void
  onDelete: () => void
}) {
  const accents = ['#D02020', '#1040C0', '#F0C020']
  const symbols = ['□', '○', '△']
  const accent = accents[accentIndex % 3]
  const symbol = symbols[accentIndex % 3]
  const date = new Date(resume.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <View className={styles.card}>
      {/* Accent side bar */}
      <View className={styles.card__bar} style={{ backgroundColor: accent }} />

      <View className={styles.card__body}>
        {/* Corner decoration */}
        <View className={styles.card__deco} style={{ backgroundColor: accent }} />

        <Text className={styles.card__title}>{resume.title || '未命名简历'}</Text>
        <Text className={styles.card__meta}>
          {resume.data.basic.intention || '求职意向未填'} · 更新于 {date}
        </Text>

        <View className={styles.card__actions}>
          <View
            className={`${styles.btn} ${styles['btn--primary']}`}
            style={{ borderColor: accent, backgroundColor: accent }}
            onClick={onEdit}
          >
            <Text>编辑</Text>
          </View>
          <View
            className={`${styles.btn} ${styles['btn--outline']}`}
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/preview/index?id=${resume._id}`,
              })
            }
          >
            <Text>预览</Text>
          </View>
          <View
            className={`${styles.btn} ${styles['btn--ghost']}`}
            onClick={onDelete}
          >
            <Text>删除</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// ─────────────────────────────────────────
// Home Page
// ─────────────────────────────────────────
export default function Home() {
  const { resumes, setResumes, setCurrent } = useResumeStore()
  const [loading, setLoading] = useState(false)

  const loadResumes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchResumes()
      setResumes(data)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }, [setResumes])

  useDidShow(() => {
    // Sync tabBar selection
    const tabbar = Taro.getTabBar<CustomTabBar>(Taro.getCurrentInstance()?.page)
    tabbar?.setSelected(0)
    // Reload on every show (handles back-from-editor)
    loadResumes()
  })

  const handleEdit = (resume: Resume) => {
    setCurrent(resume)
    Taro.navigateTo({ url: `/pages/editor/index?id=${resume._id}` })
  }

  const handleDelete = (resume: Resume) => {
    Taro.showModal({
      title: '删除简历',
      content: `确认删除「${resume.title || '未命名简历'}」？`,
      confirmColor: '#D02020',
      success: async (res) => {
        if (!res.confirm) return
        await deleteResume(resume._id)
        setResumes(resumes.filter((r) => r._id !== resume._id))
      },
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>

      {/* ── Top Nav ── */}
      <View className={styles.nav}>
        <View className={styles.nav__logo}>
          <View className={styles['logo-circle']} />
          <View className={styles['logo-square']} />
          <View className={styles['logo-tri']} />
        </View>
        <Text className={styles.nav__title}>AI 简历</Text>
        <View className={styles.nav__badge}>
          <Text className={styles.nav__badge_text}>BETA</Text>
        </View>
      </View>

      {/* ── Header band ── */}
      <View className={styles.header}>
        <View className={styles.header__left}>
          <Text className={styles.header__label}>MY RESUMES</Text>
          <Text className={styles.header__display}>我的{'\n'}简历</Text>
        </View>
        <View className={styles.header__right}>
          <Text className={styles.header__count}>
            {resumes.length.toString().padStart(2, '0')}
          </Text>
          <Text className={styles.header__count_label}>份</Text>
        </View>
      </View>

      {/* ── New Resume CTA ── */}
      <View
        className={styles.new_btn}
        onClick={() => Taro.navigateTo({ url: '/pages/template/index' })}
      >
        <View className={styles.new_btn__icon}>
          <Text className={styles.new_btn__plus}>+</Text>
        </View>
        <View>
          <Text className={styles.new_btn__title}>新建简历</Text>
          <Text className={styles.new_btn__sub}>选择模板，开始制作</Text>
        </View>
        <Text className={styles.new_btn__arrow}>→</Text>
      </View>

      {/* ── Resume list ── */}
      {loading ? (
        <View className={styles.empty}>
          <Text className={styles.empty__text}>加载中...</Text>
        </View>
      ) : resumes.length === 0 ? (
        <View className={styles.empty}>
          <View className={styles.empty__shape} />
          <Text className={styles.empty__title}>还没有简历</Text>
          <Text className={styles.empty__sub}>点击上方新建你的第一份简历</Text>
        </View>
      ) : (
        <View className={styles.list}>
          {resumes.map((resume, i) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              accentIndex={i}
              onEdit={() => handleEdit(resume)}
              onDelete={() => handleDelete(resume)}
            />
          ))}
        </View>
      )}

      <View className={styles.safe} />
    </ScrollView>
  )
}
