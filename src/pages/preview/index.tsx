// src/pages/preview/index.tsx
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import { useUserStore } from '../../store/userStore'
import { exportPdf } from '../../utils/cloud'
import { requestPayment } from '../../utils/pay'
import styles from './index.module.scss'

export default function Preview() {
  const { current } = useResumeStore()
  const { isVip } = useUserStore()
  const [exporting, setExporting] = useState(false)

  const data = current?.data

  const handleExport = async () => {
    if (!isVip()) {
      Taro.showModal({
        title: 'PDF 导出 — 会员专属',
        content: '开通会员，无限次导出 PDF 简历',
        confirmText: '¥19.9/月 开通',
        confirmColor: '#D02020',
        success: (res) => {
          if (res.confirm) requestPayment('vip_monthly')
        },
      })
      return
    }
    if (!current || exporting) return
    setExporting(true)
    try {
      const url = await exportPdf(current._id, current.templateId)
      Taro.showModal({
        title: '导出成功',
        content: 'PDF 已生成，有效期 2 小时',
        confirmText: '下载',
        success: (res) => {
          if (res.confirm) {
            Taro.downloadFile({
              url,
              success: (dl) => Taro.openDocument({ filePath: dl.tempFilePath }),
            })
          }
        },
      })
    } catch {
      Taro.showToast({ title: '导出失败', icon: 'error' })
    } finally {
      setExporting(false)
    }
  }

  if (!data) {
    return (
      <View className={styles.loading}>
        <Text className={styles.loading__text}>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.page}>

      {/* ── Bauhaus Resume Preview ── */}
      <ScrollView className={styles.scroll} scrollY>

        {/* Resume Header */}
        <View className={styles.resume}>
          <View className={styles.resume__header}>
            {/* Geometric decoration */}
            <View className={styles.resume__deco_circle} />
            <View className={styles.resume__deco_square} />

            <View className={styles.resume__header_content}>
              <Text className={styles.resume__name}>
                {data.basic.name || '你的名字'}
              </Text>
              <Text className={styles.resume__intention}>
                {data.basic.intention || '求职意向'}
              </Text>
              <View className={styles.resume__contact}>
                {data.basic.phone && (
                  <Text className={styles.resume__contact_item}>{data.basic.phone}</Text>
                )}
                {data.basic.email && (
                  <Text className={styles.resume__contact_item}>{data.basic.email}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Summary */}
          {data.basic.summary ? (
            <View className={styles.resume__section}>
              <View className={styles.resume__section_header}>
                <View className={styles.resume__section_bar} style={{ backgroundColor: '#D02020' }} />
                <Text className={styles.resume__section_title}>个人简介</Text>
              </View>
              <Text className={styles.resume__body}>{data.basic.summary}</Text>
            </View>
          ) : null}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View className={styles.resume__section}>
              <View className={styles.resume__section_header}>
                <View className={styles.resume__section_bar} style={{ backgroundColor: '#1040C0' }} />
                <Text className={styles.resume__section_title}>工作经历</Text>
              </View>
              {data.experience.map((exp) => (
                <View key={exp.id} className={styles.resume__item}>
                  <View className={styles.resume__item_header}>
                    <Text className={styles.resume__item_company}>{exp.company}</Text>
                    <Text className={styles.resume__item_period}>
                      {exp.startDate} — {exp.endDate}
                    </Text>
                  </View>
                  <Text className={styles.resume__item_role}>{exp.role}</Text>
                  <Text className={styles.resume__body}>
                    {exp.polished || exp.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View className={styles.resume__section}>
              <View className={styles.resume__section_header}>
                <View className={styles.resume__section_bar} style={{ backgroundColor: '#F0C020' }} />
                <Text className={styles.resume__section_title}>教育经历</Text>
              </View>
              {data.education.map((edu) => (
                <View key={edu.id} className={styles.resume__item}>
                  <View className={styles.resume__item_header}>
                    <Text className={styles.resume__item_company}>{edu.school}</Text>
                    <Text className={styles.resume__item_period}>
                      {edu.startDate} — {edu.endDate}
                    </Text>
                  </View>
                  <Text className={styles.resume__item_role}>{edu.major} · {edu.degree}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <View className={styles.resume__section}>
              <View className={styles.resume__section_header}>
                <View className={styles.resume__section_bar} style={{ backgroundColor: '#D02020' }} />
                <Text className={styles.resume__section_title}>专业技能</Text>
              </View>
              <View className={styles.resume__skills}>
                {data.skills.map((skill, i) => (
                  <View
                    key={i}
                    className={styles.resume__skill_tag}
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
        </View>

        <View className={styles.safe} />
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View className={styles.action_bar}>
        <View
          className={styles.action_bar__btn_secondary}
          onClick={() => Taro.navigateBack()}
        >
          <Text>← 继续编辑</Text>
        </View>
        <View className={styles.action_bar__btn_primary} onClick={handleExport}>
          <Text>{exporting ? '生成中...' : '导出 PDF'}</Text>
          {!isVip() && <View className={styles.action_bar__lock}><Text>VIP</Text></View>}
        </View>
      </View>

    </View>
  )
}
