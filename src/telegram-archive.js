// مصدر واحد لإعداد قناة الأرشيف، يستخدمه الموقع والبوت.
export const ARCHIVE_CHANNEL_NUMBER = '4300869581'
export const ARCHIVE_CHAT_ID = '-100' + ARCHIVE_CHANNEL_NUMBER

/** يرجع رقم الرسالة من رابط القناة الخاصة المعتمدة فقط. */
export function archiveMessageId(url) {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' || u.hostname !== 't.me') return null
    const found = /^\/c\/(\d+)\/(\d+)\/?$/.exec(u.pathname)
    if (!found || found[1] !== ARCHIVE_CHANNEL_NUMBER) return null
    const id = Number(found[2])
    return Number.isSafeInteger(id) && id > 0 ? id : null
  } catch { return null }
}
