// src/store/resumeStore.ts
import { create } from 'zustand'
import type { Resume, ResumeData } from '../types/resume'

interface ResumeStore {
  // 简历列表
  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void

  // 当前编辑的简历
  current: Resume | null
  setCurrent: (resume: Resume | null) => void

  // 更新当前简历的某个字段
  updateCurrentData: (data: Partial<ResumeData>) => void

  // 选中的模板
  selectedTemplateId: string
  setSelectedTemplateId: (id: string) => void

  // AI润色状态
  polishingId: string | null  // 正在润色的 item id
  setPolishingId: (id: string | null) => void
}

const DEFAULT_RESUME_DATA: ResumeData = {
  basic: {
    name: '',
    phone: '',
    email: '',
    intention: '',
    summary: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  setResumes: (resumes) => set({ resumes }),

  current: null,
  setCurrent: (resume) => set({ current: resume }),

  updateCurrentData: (data) =>
    set((state) => {
      if (!state.current) return state
      return {
        current: {
          ...state.current,
          data: { ...state.current.data, ...data },
          updatedAt: Date.now(),
        },
      }
    }),

  selectedTemplateId: 'bauhaus-01',
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  polishingId: null,
  setPolishingId: (id) => set({ polishingId: id }),
}))
