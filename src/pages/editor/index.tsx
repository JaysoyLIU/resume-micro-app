// src/pages/editor/index.tsx
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import { useState } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import { useUserStore } from '../../store/userStore'
import { updateResume } from '../../utils/cloud'
import { polishText } from '../../utils/ai'
import type { ExperienceItem, ResumeData } from '../../types/resume'
import styles from './index.module.scss'

type Section = 'basic' | 'education' | 'experience' | 'projects' | 'skills'

const SECTIONS: { key: Section; label: string; symbol: string; color: string }[] = [
  { key: 'basic',      label: '基本信息', symbol: '○', color: '#1040C0' },
  { key: 'education',  label: '教育经历', symbol: '□', color: '#D02020' },
  { key: 'experience', label: '工作经历', symbol: '△', color: '#F0C020' },
  { key: 'projects',   label: '项目经历', symbol: '◇', color: '#D02020' },
  { key: 'skills',     label: '技能',     symbol: '○', color: '#1040C0' },
]

export default function Editor() {
  const { current, updateCurrentData, polishingId, setPolishingId } = useResumeStore()
  const { hasQuota } = useUserStore()
  const [activeSection, setActiveSection] = useState<Section>('basic')
  const [saving, setSaving] = useState(false)

  const data = current?.data

  const save = async () => {
    if (!current || saving) return
    setSaving(true)
    try {
      await updateResume(current._id, { data: current.data, updatedAt: Date.now() })
      Taro.showToast({ title: '已保存', icon: 'success' })
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handlePolish = async (item: ExperienceItem) => {
    if (!hasQuota()) {
      Taro.showModal({
        title: '智能优化次数不足',
        content: '开通会员或购买次数包，解锁无限 AI 润色',
        confirmText: '去开通',
        confirmColor: '#D02020',
      })
      return
    }
    setPolishingId(item.id)
    try {
      const polished = await polishText(item.description, 'experience')
      const newList = data!.experience.map((e) =>
        e.id === item.id ? { ...e, polished } : e
      )
      updateCurrentData({ experience: newList })
    } catch {
      Taro.showToast({ title: '优化失败，请重试', icon: 'error' })
    } finally {
      setPolishingId(null)
    }
  }

  const updateBasic = (field: keyof ResumeData['basic'], value: string) => {
    if (!data) return
    updateCurrentData({ basic: { ...data.basic, [field]: value } })
  }

  if (!current) {
    return (
      <View className={styles.loading}>
        <Text className={styles.loading__text}>加载简历...</Text>
      </View>
    )
  }

  return (
    <View className={styles.page}>

      {/* ── Section tabs (vertical left rail) ── */}
      <View className={styles.rail}>
        {SECTIONS.map((s) => (
          <View
            key={s.key}
            className={`${styles.rail__item} ${activeSection === s.key ? styles['rail__item--active'] : ''}`}
            style={activeSection === s.key ? { backgroundColor: s.color } : {}}
            onClick={() => setActiveSection(s.key)}
          >
            <Text className={styles.rail__symbol}>{s.symbol}</Text>
            <Text className={styles.rail__label}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Main content area ── */}
      <View className={styles.main}>

        {/* Section header */}
        <View className={styles.section_header}>
          <Text className={styles.section_header__title}>
            {SECTIONS.find((s) => s.key === activeSection)?.label}
          </Text>
          <View className={styles.save_btn} onClick={save}>
            <Text>{saving ? '...' : '保存'}</Text>
          </View>
        </View>

        <ScrollView className={styles.scroll} scrollY>

          {/* Basic Info */}
          {activeSection === 'basic' && (
            <View className={styles.form}>
              {(
                [
                  { field: 'name' as const,      label: '姓名',     placeholder: '你的名字' },
                  { field: 'phone' as const,     label: '手机',     placeholder: '138 0000 0000' },
                  { field: 'email' as const,     label: '邮箱',     placeholder: 'hello@example.com' },
                  { field: 'intention' as const, label: '求职意向', placeholder: '产品经理 / 前端工程师' },
                ] as const
              ).map(({ field, label, placeholder }) => (
                <View key={field} className={styles.form__field}>
                  <Text className={styles.form__label}>{label}</Text>
                  <Input
                    className={styles.form__input}
                    value={data?.basic[field] || ''}
                    placeholder={placeholder}
                    onInput={(e) => updateBasic(field, e.detail.value)}
                  />
                </View>
              ))}
              <View className={styles.form__field}>
                <View className={styles.form__label_row}>
                  <Text className={styles.form__label}>个人简介</Text>
                  <View
                    className={styles.ai_badge}
                    onClick={async () => {
                      if (!data?.basic.summary) return
                      const polished = await polishText(data.basic.summary, 'summary')
                      updateCurrentData({ basic: { ...data.basic, summary: polished } })
                    }}
                  >
                    <Text>AI 优化</Text>
                  </View>
                </View>
                <Textarea
                  className={styles.form__textarea}
                  value={data?.basic.summary || ''}
                  placeholder='简述你的核心优势和求职目标...'
                  onInput={(e) => updateBasic('summary', e.detail.value)}
                  autoHeight
                />
              </View>
            </View>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <View className={styles.exp_list}>
              {data?.experience.length === 0 && (
                <View className={styles.empty_tip}>
                  <Text className={styles.empty_tip__text}>还没有工作经历，点击下方添加</Text>
                </View>
              )}
              {data?.experience.map((exp) => (
                <View key={exp.id} className={styles.exp_item}>
                  <View className={styles.exp_item__header}>
                    <Text className={styles.exp_item__company}>{exp.company || '公司名称'}</Text>
                    <Text className={styles.exp_item__role}>{exp.role || '职位'}</Text>
                  </View>
                  <View className={styles.exp_item__body}>
                    <Text className={styles.exp_item__desc_label}>原始描述</Text>
                    <Textarea
                      className={styles.form__textarea}
                      value={exp.description}
                      placeholder='描述你在这段经历中做了什么...'
                      onInput={(e) => {
                        const newList = data.experience.map((item) =>
                          item.id === exp.id
                            ? { ...item, description: e.detail.value }
                            : item
                        )
                        updateCurrentData({ experience: newList })
                      }}
                      autoHeight
                    />
                    <View
                      className={styles.polish_btn}
                      onClick={() => handlePolish(exp)}
                    >
                      <Text className={styles.polish_btn__text}>
                        {polishingId === exp.id ? '智能优化中...' : '✦ 智能优化'}
                      </Text>
                    </View>
                    {exp.polished ? (
                      <View className={styles.polished}>
                        <Text className={styles.polished__label}>优化结果</Text>
                        <Text className={styles.polished__text}>{exp.polished}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
              {/* Add button */}
              <View
                className={styles.add_btn}
                onClick={() => {
                  const newItem: ExperienceItem = {
                    id: Date.now().toString(),
                    company: '',
                    role: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    polished: '',
                  }
                  updateCurrentData({
                    experience: [...(data?.experience || []), newItem],
                  })
                }}
              >
                <Text className={styles.add_btn__text}>+ 添加工作经历</Text>
              </View>
            </View>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <View className={styles.form}>
              <View className={styles.form__field}>
                <Text className={styles.form__label}>技能标签（逗号分隔）</Text>
                <Textarea
                  className={styles.form__textarea}
                  value={data?.skills.join(', ') || ''}
                  placeholder='React, TypeScript, Node.js, Figma...'
                  onInput={(e) =>
                    updateCurrentData({
                      skills: e.detail.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  autoHeight
                />
              </View>
              <View className={styles.skills_preview}>
                {data?.skills.map((skill, i) => (
                  <View
                    key={i}
                    className={styles.skill_tag}
                    style={{ borderColor: ['#D02020', '#1040C0', '#F0C020'][i % 3] }}
                  >
                    <Text style={{ color: ['#D02020', '#1040C0', '#F0C020'][i % 3] }}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education / Projects: similar pattern, abbreviated for now */}
          {(activeSection === 'education' || activeSection === 'projects') && (
            <View className={styles.form}>
              <View className={styles.empty_tip}>
                <Text className={styles.empty_tip__text}>
                  {activeSection === 'education' ? '教育经历' : '项目经历'}编辑区
                </Text>
              </View>
              <View
                className={styles.add_btn}
                onClick={() =>
                  Taro.showToast({ title: '功能开发中', icon: 'none' })
                }
              >
                <Text className={styles.add_btn__text}>
                  + 添加{activeSection === 'education' ? '教育经历' : '项目经历'}
                </Text>
              </View>
            </View>
          )}

          <View className={styles.safe} />
        </ScrollView>
      </View>

      {/* ── Preview shortcut ── */}
      <View
        className={styles.preview_fab}
        onClick={() =>
          Taro.navigateTo({ url: `/pages/preview/index?id=${current._id}` })
        }
      >
        <Text className={styles.preview_fab__text}>预览</Text>
      </View>

    </View>
  )
}
