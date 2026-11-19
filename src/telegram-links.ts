/** روابط تيليجرام: لا نعرض أي رابط حتى تُدخل اسم المستخدم الحقيقي للبوت. */
export function getBotUrl(rawUsername: string): string | null {
  const username = String(rawUsername || '').trim().replace(/^@/, '')
  // اسم المستخدم في Telegram يجب أن ينتهي بـ bot وأن يكون بطول 5–32 حرفًا.
  if (username.length < 5 || username.length > 32 || !/^[A-Za-z][A-Za-z0-9_]*bot$/i.test(username)) return null
  return `https://t.me/${username}`
}

export function getCourseBotUrl(rawUsername: string, courseId: string): string | null {
  const base = getBotUrl(rawUsername)
  if (!base || !/^[A-Za-z0-9_-]+$/.test(courseId)) return null
  const payload = `course_${courseId}`
  if (payload.length > 64) return null
  return `${base}?start=${encodeURIComponent(payload)}`
}

/** رابط يفتح البوت ويطلب ملف PDF محددًا من أرشيف المواد. */
export function getMaterialBotUrl(rawUsername: string, courseId: string, messageId: number): string | null {
  const base = getBotUrl(rawUsername)
  if (!base || !/^hu-(?:it-\d{2}|cs-\d{3})$/.test(courseId)) return null
  if (!Number.isSafeInteger(messageId) || messageId <= 0) return null
  const payload = `m_${courseId}_${messageId}`
  if (payload.length > 64) return null
  return `${base}?start=${encodeURIComponent(payload)}`
}

/** رابط يفتح البوت ويرسل جميع ملفات الأرشيف للمادة أو لقسم محدد دفعة واحدة. */
export function getCourseAllMaterialsBotUrl(rawUsername: string, courseId: string, tabKey?: string): string | null {
  const base = getBotUrl(rawUsername)
  if (!base || !/^hu-(?:it-\d{2}|cs-\d{3})$/.test(courseId)) return null
  if (tabKey && !/^[hanxulvpt]$/.test(tabKey)) return null
  const payload = tabKey ? `all_${courseId}_${tabKey}` : `all_${courseId}`
  if (payload.length > 64) return null
  return `${base}?start=${encodeURIComponent(payload)}`
}
