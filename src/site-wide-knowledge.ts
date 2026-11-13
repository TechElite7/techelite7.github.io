/**
 * One typed index over the site's own data and embedded page content.
 * Intent chooses the record kind before any text ranking is attempted.
 */
import { siteRecords, siteSourceFiles, type SiteRecord, type SiteRecordKind } from './assistant-site-sources'
import { inferAssistantIntent, type SiteConversationState } from './assistant-intent'
import { normalizeAcademic } from './site-assistant-knowledge'
import type { SmartAnswer } from './smart-academic-search'

export type SiteAnswer = SmartAnswer
const norm = normalizeAcademic
const words = (value: string) => norm(value).split(' ').filter(word => word.length > 2)
const stop = new Set(words('عطني اعطني اعطيني اريد ابغي ابي كيف اتعلم ابدا وين ايش اش وش ما هو هي من هم عن هذا هذه على الموقع موقعكم عندكم دورات كورسات دورة كورس مسار مسارات تعلم التعلم خطة الخطة الدراسية تخصص تخصصات it cs و طيب بس فقط'))
const queryWords = (value: string) => words(value).filter(word => !stop.has(word) && !stop.has(word.replace(/^ال/, '')))
function rank(records: SiteRecord[], query: string): SiteRecord[] {
  const tokens = queryWords(query)
  if (!tokens.length) return records
  return records.map(record => {
    const title = norm(record.title + ' ' + (record.tags || []).join(' '))
    const body = norm(record.body)
    const score = tokens.reduce((sum, token) => sum + (title.includes(token) ? 4 : body.includes(token) ? 1 : 0), 0)
    return { record, score }
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score).map(row => row.record)
}
const byKind = (kind: SiteRecordKind) => siteRecords.filter(record => record.kind === kind)
const uniqueLinks = (records: SiteRecord[]) => [...new Map(records.flatMap(record => record.links || []).map(link => [link.url, link])).values()]
function answer(request: SiteConversationState, kind: SiteRecordKind, records: SiteRecord[], text: string, extra: Partial<SmartAnswer> = {}): SmartAnswer {
  return {
    text, academicState: null, siteState: request,
    retrieval: { kind, ids: records.map(record => record.id), sources: [...new Set(records.length ? records.map(record => record.source) : siteSourceFiles[kind] || [])], status: records.length ? 'found' : 'empty' },
    ...extra,
  }
}
export function answerSiteRequest(request: SiteConversationState): SmartAnswer {
  switch (request.intent) {
    case 'Identity': {
      const records = byKind('identity')
      return answer(request, 'identity', records, records.map(record => record.body).join('\n'))
    }
    case 'Services': {
      const records = byKind('section')
      const identity = byKind('identity')[0]
      return answer(request, 'section', records, `موقع ${identity?.title || ''}:\n${records.map(record => '• ' + record.title).join('\n')}\nللمقررات افتح الخطة، وللملازم والمحاضرات المسجلة افتح المكتبة.`, { destination: 'plan', button: 'فتح الخطة الدراسية' })
    }
    case 'Tracks': {
      const records = byKind('learning_track').filter(record => !request.major || request.major === 'ALL' || record.major === request.major)
      const selected = request.query ? rank(records, request.query) : records
      return answer(request, 'learning_track', selected, selected.length
        ? `${request.count ? 'عدد مجالات ومسارات التعلم المنشورة: ' + selected.length + '\n' : ''}مجالات ومسارات التعلم المنشورة${request.major && request.major !== 'ALL' ? ' لتخصص ' + request.major : ''}:\n${selected.map(record => `• ${record.major ? record.major + ' — ' : ''}${record.title}: ${record.body}`).join('\n')}\nهذه مجالات للتعلم؛ لا تعني مسارات جامعية رسمية أو قائمة مقررات.`
        : `لا توجد مسارات تعلم مسجلة بهذا الوصف${request.major ? ' لتخصص ' + request.major : ''} في الموقع حاليًا. يمكنك مراجعة مجالات IT وCS المنشورة.`,
        { destination: 'guide', button: 'فتح مسارات التعلم' })
    }
    case 'TrackPlanDifference': {
      const tracks = byKind('learning_track')
      const records = byKind('section').filter(record => record.id === 'section:guide' || record.id === 'section:plan')
      return answer(request, 'section', records, `مسارات التعلم مجالات ومصادر للتعلم والتطبيق، مثل ${tracks.slice(0, 2).map(record => record.title).join(' و')}. الخطة الدراسية تعرض المقررات الجامعية بأسمائها ورموزها وساعاتها حسب التخصص والمستوى والفصل. صفحة المسارات توضح أن مجالات التعلم ليست مسارات جامعية رسمية.`, { destination: 'guide', button: 'فتح مسارات التعلم' })
    }
    case 'Roadmap': {
      const records = rank(byKind('roadmap_stage'), request.query || '')
      return answer(request, 'roadmap_stage', records, records.length
        ? `مراحل Full Stack المسجلة في دليل الموقع:\n${records.map((record, index) => `${index + 1}. ${record.title}: ${record.body}`).join('\n')}`
        : 'لم أجد مرحلة بهذا الوصف في خارطة Full Stack المسجلة. افتح الدليل أو حدد المرحلة.',
        { destination: 'guide', button: 'فتح خارطة Full Stack', links: uniqueLinks(records).slice(0, 8) })
    }
    case 'LearningCourses': {
      const records = rank(byKind('learning_course'), request.query || '')
      return answer(request, 'learning_course', records, records.length
        ? `الدورات المدرجة في الموقع:\n${records.map(record => `• ${record.title}: ${record.body}`).join('\n')}`
        : 'لم أجد دورة بهذا الوصف ضمن دليل الموقع.',
        { destination: 'guide', button: 'فتح الدورات', links: uniqueLinks(records) })
    }
    case 'Library': {
      const records = byKind('section').filter(record => record.id === 'section:library')
      return answer(request, 'section', records, 'المكتبة تجمع الملازم والمحاضرات والمصادر المسجلة حسب التخصص والمستوى والفصل والمقرر. افتح المكتبة، أو اكتب اسم المادة للبحث عن ملفاتها. لا يقرأ المساعد محتوى PDF.', { destination: 'library', button: 'فتح المكتبة' })
    }
    case 'Bot': {
      const records = byKind('bot')
      return answer(request, 'bot', records, records.map(record => record.body).join('\n'), { links: uniqueLinks(records) })
    }
    case 'Projects': {
      const records = byKind('graduation_project')
      return answer(request, 'graduation_project', records, records.length
        ? `مشاريع التخرج المنشورة:\n${records.map(record => `${record.title}: ${record.body}`).join('\n')}`
        : 'لا توجد مشاريع تخرج منشورة في بيانات الموقع حاليًا.', { links: uniqueLinks(records) })
    }
    case 'Members': {
      const records = byKind('member').filter(record => !request.query || record.tags?.includes(request.query))
      return answer(request, 'member', records, request.count
        ? `عدد الأسماء المنشورة في القسم المطلوب: ${records.length}. هذا عدد السجلات في الموقع، وقد تتكرر أسماء؛ ليس بالضرورة عدد أفراد الدفعة.`
        : records.length ? `الأسماء المسجلة في صفحة دفعتنا:\n${records.map(record => `• ${record.title}${record.body ? ': ' + record.body : ''}`).join('\n')}` : 'لا توجد أسماء مسجلة في القسم المطلوب حاليًا.')
    }
    case 'Major': {
      const records = byKind('major').filter(record => !request.major || request.major === 'ALL' || record.major === request.major)
      return answer(request, 'major', records, records.length ? records.map(record => `${record.title}: ${record.body}`).join('\n\n') : 'لا توجد معلومات لهذا التخصص في بيانات الموقع.', { destination: request.major === 'CS' ? 'cs' : 'about', button: 'فتح صفحة التخصص' })
    }
    case 'Laptop': {
      const records = byKind('laptop_tier')
      return answer(request, 'laptop_tier', records, `توصيات اللابتوب المنشورة في دليل الموقع، وليست شروطًا إلزامية:\n${records.map(record => `${record.title}: ${record.body}`).join('\n')}`, { destination: 'guide', button: 'فتح دليل الأجهزة' })
    }
    case 'Logo': {
      const records = byKind('logo')
      return answer(request, 'logo', records, records.map(record => record.body).join('\n'))
    }
  }
}
/** Compatibility lookup; the main router also supplies conversation state. */
export function findWholeSiteAnswer(question: string): SiteAnswer | null {
  const request = inferAssistantIntent(question)
  return request ? answerSiteRequest(request) : null
}
/** Remote reasoning receives dynamic source excerpts (including members & Telegram links) across the current question and recent history. */
export function buildWholeSiteContext(question: string, historyText = ''): string {
  const combined = `${question} ${historyText}`.trim()
  const request = inferAssistantIntent(question)
  const local = request ? answerSiteRequest(request) : null
  const qNorm = norm(combined)

  const snippets: string[] = []
  const identity = byKind('identity')[0]?.body
  if (identity) snippets.push(identity)
  if (local?.text) snippets.push(local.text)

  // Dynamically include members whenever the conversation mentions batch/students/team.
  if (/طلاب|طالب|اسماء|اسامي|دفعه|دفعتنا|اعضاء|مندوب|مطور|مبرمج|زملاء|شباب/.test(qNorm)) {
    const members = byKind('member')
    if (members.length) {
      snippets.push(`أسماء الدفعة المسجلة (${members.length} سجلًا):\n` + members.map(m => `• ${m.title}${m.body ? ` (${m.body})` : ''}`).join('\n'))
    }
  }

  // Dynamically include Telegram course resources when lectures/materials/links are discussed.
  const resourceRecords = rank(byKind('course_resource'), combined).slice(0, 4)
  for (const r of resourceRecords) {
    const linksText = (r.links || []).slice(0, 6).map(l => `${l.title}: ${l.url}`).join(' | ')
    snippets.push(`[${r.source}] ${r.title}: ${r.body}${linksText ? ` — الروابط: ${linksText}` : ''}`)
  }

  // Include general site records (tracks, majors, roadmap, courses, projects, bot).
  const generalRecords = rank(siteRecords.filter(record => !['identity', 'section', 'member', 'course_resource'].includes(record.kind)), combined).slice(0, 5)
  for (const record of generalRecords) {
    const linksText = (record.links || []).slice(0, 3).map(l => `${l.title}: ${l.url}`).join(' | ')
    snippets.push(`[${record.source}] ${record.title}: ${record.body}${linksText ? ` (${linksText})` : ''}`)
  }

  return snippets.filter(Boolean).join('\n').slice(0, 4500)
}
