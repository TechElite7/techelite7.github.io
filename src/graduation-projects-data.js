/**
 * مشاريع تخرج دفعة Tech Elite السابعة.
 * هذا الملف المشترك يقرأه الموقع والبوت. لا تعدل نفس المشروع في مكانين.
 *
 * عند تجهيز مشروع جديد، أزل التعليق عن المثال وأضف بياناته الحقيقية.
 * messageId هو رقم رسالة الملف في قناة تيليجرام، وليس رقم الملف أو رقم المشروع.
 * لا تنشر مستندات أو أسماء فرق قبل موافقة أصحابها.
 *
 * @typedef {{title:string, messageId:number}} ProjectDocument
 * @typedef {{id:string, title:string, team:string[], summary:string, documents:ProjectDocument[]}} GraduationProject
 * @type {GraduationProject[]}
 */
export const graduationProjects = [
  // {
  //   id: 'project-01',
  //   title: 'اسم مشروع التخرج',
  //   team: ['الطالب الأول', 'الطالب الثاني'],
  //   summary: 'نبذة قصيرة عن فكرة المشروع وفائدته.',
  //   documents: [
  //     { title: 'تقرير مشروع التخرج PDF', messageId: 125 },
  //     { title: 'العرض التقديمي', messageId: 126 },
  //   ],
  // },
]

export function getGraduationProject(id) {
  return graduationProjects.find(project => project.id === id)
}

/** الملفات التي توجد لها معرفات رسائل صالحة في القناة. */
export function publishedProjectDocuments(project) {
  return (project?.documents || []).filter(doc =>
    typeof doc.title === 'string' && doc.title.trim().length > 0 &&
    Number.isSafeInteger(doc.messageId) && doc.messageId > 0
  )
}

/** ينقل الزائر إلى صفحة المشروع مباشرة داخل البوت. */
export function graduationProjectBotUrl(botUsername, projectId) {
  const username = String(botUsername || '').replace(/^@/, '').trim()
  if (!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username)) return null
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(String(projectId || ''))) return null
  return `https://t.me/${username}?start=gp_${projectId}`
}
