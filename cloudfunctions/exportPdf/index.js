// cloudfunctions/exportPdf/index.js
// 使用 Puppeteer 将简历渲染为 PDF 并上传至云存储
// 注意：超时需设为 60s（Puppeteer 启动慢）

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { resumeId, templateId } = event
  const { OPENID } = cloud.getWXContext()

  if (!resumeId || !templateId) {
    return { error: 'INVALID_PARAMS' }
  }

  const db = cloud.database()

  // 仅会员可导出 PDF
  const userRes = await db.collection('users').where({ _openid: OPENID }).limit(1).get()
  const user = userRes.data[0]
  if (!user || user.vipExpireAt <= Date.now()) {
    return { error: 'VIP_REQUIRED' }
  }

  // 获取简历数据
  const resumeRes = await db.collection('resumes').doc(resumeId).get()
  const resume = resumeRes.data

  if (!resume || resume.userId !== OPENID) {
    return { error: 'NOT_FOUND' }
  }

  try {
    // TODO: 使用 Puppeteer 渲染 HTML 模板
    // const puppeteer = require('puppeteer')
    // const browser = await puppeteer.launch({ ... })
    // const page = await browser.newPage()
    // await page.setContent(renderTemplate(resume, templateId))
    // const pdf = await page.pdf({ format: 'A4' })
    // await browser.close()

    // 上传至云存储
    const fileName = `resumes/${OPENID}/${resumeId}_${Date.now()}.pdf`
    // const uploadRes = await cloud.uploadFile({
    //   cloudPath: fileName,
    //   fileContent: pdf,
    // })

    // 获取临时链接（2小时有效）
    // const urlRes = await cloud.getTempFileURL({
    //   fileList: [uploadRes.fileID],
    // })

    // return { fileUrl: urlRes.fileList[0].tempFileURL }

    // Placeholder 返回（开发阶段）
    return {
      fileUrl: `https://placeholder.example.com/${fileName}`,
    }
  } catch (err) {
    console.error('PDF export error:', err)
    return { error: 'EXPORT_FAILED' }
  }
}
