/** Public Tech Elite curricula and resource search for the academic assistant.
 * This module does NOT read PDF contents or any private Telegram messages.
 */
import { courses, siteConfig, type Course } from './data'
import { csAllCourses } from './cs-plan-data'
import { getAllCourseResources } from './telegram-materials'
import { cohortMembers } from './cohort-members-data'

export type AcademicAnswer = { text: string; destination?: 'plan' | 'library'; button?: string; links?: { title: string; url: string }[] }
const allCourses: { course: Course; major: 'IT' | 'CS' }[] = [
  ...courses.map(course => ({ course, major: 'IT' as const })),
  ...csAllCourses.map(course => ({ course, major: 'CS' as const })),
]
export const normalizeAcademic = (value: string): string => value.toLocaleLowerCase('ar')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
/** The identity below follows the public "دفعتنا" section of Tech Elite.
 * No AI inference is needed to state these verified website facts.
 */
export function findSiteAnswer(question: string): AcademicAnswer | null {
  const q = normalizeAcademic(question)
  const site = /(?:tech\s*elite|تيك\s*اليت|تك\s*اليت|تيك\s*ايليت|دفعتنا|دفعتكم|دفعتك|الدفعه|الدفعة|دفعه|دفعت|موقعكم|موقعنا|الموقع|موقع\s*الدفعة|موقع\s*الدفعه|هويتنا|الدفعة السابعة|الدفعة السابعه)/.test(q)
  if (!site) return null
  const request = /(?:عرف|تعريف|نبذه|حدثني|احكي|تكلم|قول|عطني|اعطني|اعطيني|عرفني|اش\s*هي|ايش|وش|من\s*انتم|ما\s*هي|ما\s*هو|معلومات|فكره|هدف|لماذا|ليش|خاص|يتكلم|فيه|يحتوي|يسوي|تقدم|يقدم)/.test(q)
  const wantsPeople = /(?:مندوب|مطور|المطورين|الفريق|المسؤول|من\s*طور)/.test(q)
  if (wantsPeople) {
    if (/مندوب|ممثل/.test(q)) {
      const names = cohortMembers.representatives.map(person => person.name).filter(Boolean)
      return { text: names.length ? `مندوب الدفعة المسجل في الموقع: ${names.join('، ')}.` : 'لم تُسجل أسماء المندوبين في صفحة الدفعة بعد.' }
    }
    if (/مطور|الفريق|من\s*طور/.test(q)) {
      const names = cohortMembers.developers.map(person => person.name).filter(Boolean)
      return { text: names.length ? `الأسماء المدرجة ضمن مطوري موقع Tech Elite: ${names.join('، ')}.` : 'لا توجد أسماء مطورين مسجلة حاليًا في بيانات الموقع.' }
    }
  }
  if (!request) return null
  const isSite = /(?:الموقع|موقعكم|موقع الدفعة|موقع الدفعه|يحتوي|فيه|يسوي|تقدم|يقدم)/.test(q)
  return {
    text: isSite
      ? `موقع ${siteConfig.batchName} هو مرجع طلابي أعدته دفعتنا في ${siteConfig.facultyName} ب${siteConfig.universityName}. يجمع تعريفًا بتخصصي IT وCS، الخطط الدراسية، المكتبة وروابط المحاضرات، دليل Full Stack، وصفحة الدفعة، ومساعدًا أكاديميًا للأسئلة التقنية. نحن الدفعة السابعة من تخصص تقنية المعلومات. يمكنك أن تسألني عن أي قسم أو مقرر محدد.`
      : `نحن ${siteConfig.batchName}، الدفعة السابعة في تخصص تقنية المعلومات، ${siteConfig.facultyName} ب${siteConfig.universityName}. جمعنا شغف التقنية، وأنشأنا موقعًا يساعد الطلاب في الوصول إلى الخطط والمقررات والملازم والمصادر التقنية. ستجد تعريف الدفعة في قسم «دفعتنا».`,
  }
}

/** A short, sourced introduction, passed to AI even when the user asks in dialect. */
export function siteIdentityContext(): string {
  return `حقائق صفحة «دفعتنا»: الاسم: ${siteConfig.batchName}. الدفعة السابعة في تخصص تقنية المعلومات، ${siteConfig.facultyName}، ${siteConfig.universityName}. هدف الموقع مرجع طلابي للمقررات والخطط والملازم والمصادر التقنية، وفيه IT وCS ودليل Full Stack. صفحات الموقع: #about و#cs و#plan و#library و#guide و#batch. لا تخترع تفاصيل إضافية عن الدفعة.`
}

const tokens = (value: string): string[] => normalizeAcademic(value).split(' ').filter(word => word.length >= 3)
const termWord = (semester: number) => semester === 1 ? 'الأول' : 'الثاني'
const publicUrl = (value: string) => /^https:\/\//i.test(value) && !/^https:\/\/t\.me\/c\//i.test(value)
const yearWords: Record<string, number> = { الاول: 1, اول: 1, الثاني: 2, ثاني: 2, الثالث: 3, ثالث: 3, الرابع: 4, رابع: 4 }
const userMajor = (q: string): 'IT' | 'CS' | null => {
  if (/\bcs\b|علوم الحاسوب/.test(q)) return 'CS'
  if (/\bit\b|تقنيه المعلومات/.test(q)) return 'IT'
  return null
}
function planSearch(question: string): AcademicAnswer | null {
  const q = normalizeAcademic(question)
  if (!/(مواد|مقررات|خطه|مستوي|سنه|فصل)/.test(q)) return null
  const yearMatch = q.match(/(?:مستوي|المستوي|سنه|السنه)\s+(الاول|اول|الثاني|ثاني|الثالث|ثالث|الرابع|رابع)/)
  if (!yearMatch) return null
  const year = yearWords[yearMatch[1]]
  const major = userMajor(q)
  if (!major) return { text: `يمكنني عرض مواد المستوى ${year} من الخطة، لكن اختر التخصص أولًا: IT أم CS؟`, destination: 'plan', button: 'افتح الخطة الدراسية' }
  const termMatch = q.match(/(?:الفصل|فصل|الترم)\s+(الاول|اول|الثاني|ثاني)/)
  const term = termMatch ? yearWords[termMatch[1]] : null
  const selected = allCourses.filter(entry => entry.major === major && entry.course.year === year && (!term || entry.course.semester === term))
  if (!selected.length) return { text: 'لم أعثر على مقررات مطابقة في الخطة المخزنة. راجع صفحة الخطة الدراسية.', destination: 'plan', button: 'افتح الخطة' }
  const rows = selected.slice(0, 24).map(({ course }) => `• ${course.name} (${course.code})، الفصل ${termWord(course.semester)}`)
  return {
    text: `مواد المستوى ${year} في ${major}${term ? `، الفصل ${termWord(term)}` : ''} بحسب خطة الموقع:\n${rows.join('\n')}${selected.length > 24 ? '\nويوجد مقررات أخرى في صفحة الخطة.' : ''}\n\nللملازم انتقل إلى المكتبة.`,
    destination: 'plan', button: 'عرض الخطة',
  }
}
function exactCourse(question: string): { course: Course; major: 'IT' | 'CS' } | null {
  const q = normalizeAcademic(question)
  const matched = allCourses.filter(({ course }) => {
    const name = normalizeAcademic(course.name)
    const code = normalizeAcademic(course.code)
    return (name.length >= 6 && q.includes(name)) || (code.length >= 4 && q.includes(code))
  })
  if (!matched.length) return null
  const requestedMajor = userMajor(q)
  return matched.find(entry => entry.major === requestedMajor) || matched[0]
}
function resourceOverview(course: Course): { text: string; links: { title: string; url: string }[] } {
  const entries = getAllCourseResources(course)
  const names = entries.slice(0, 7).map(resource => `• ${resource.title} (${resource.kind})`)
  const links = entries.filter(resource => publicUrl(resource.url)).slice(0, 4)
    .map(resource => ({ title: resource.title, url: resource.url }))
  return {
    text: names.length ? `\nالمصادر المدرجة بالموقع:\n${names.join('\n')}` : '\nلا توجد مصادر مدرجة لهذه المادة حاليًا.',
    links,
  }
}
export function findAcademicAnswer(question: string): AcademicAnswer | null {
  const exact = exactCourse(question)
  if (exact) {
    const { course, major } = exact
    const resources = resourceOverview(course)
    return {
      text: `${course.name} (${course.code}) مادة في ${major}، المستوى ${course.year}، الفصل ${termWord(course.semester)}، الساعات ${course.creditHours}.\n${course.description}${resources.text}\n\nمصدر المعلومات: خطة ومكتبة Tech Elite. ملفات PDF نفسها غير مقروءة داخل الشات.`,
      destination: 'library', button: 'افتح المكتبة', links: resources.links,
    }
  }
  return planSearch(question)
}
const aliases: [RegExp, string][] = [
  [/\bsql\b|\bnosql\b|database|قواعد البيانات/, 'قواعد البيانات'],
  [/web|react|front.?end|back.?end|full.?stack|تطوير الويب/, 'الويب'],
  [/algorithm|خوارزميه|خوارزميات/, 'الخوارزميات'],
  [/network|شبكات|tcp|ip/, 'الشبكات'],
  [/security|cyber|امن|حمايه/, 'الأمن'],
  [/\bai\b|ذكاء اصطناعي|تعلم الاله/, 'الذكاء الاصطناعي'],
]
/** Keep context tiny to protect the daily free AI quota. Never describe it as PDF knowledge. */
export function buildAcademicContext(question: string): string {
  const q = normalizeAcademic(question)
  const queryWords = tokens(question).filter(token => !['اشرح','تشرح','ماده','مواد','ماهي','ماهو','كيف','الفرق','بين','بالله','موقع'].includes(token))
  const topics = aliases.filter(([pattern]) => pattern.test(q)).map(([, term]) => normalizeAcademic(term))
  const ranked = allCourses.map(entry => {
    const title = normalizeAcademic(entry.course.name)
    const description = normalizeAcademic(entry.course.description)
    const match = queryWords.reduce((score, word) => score + (title.includes(word) ? 4 : description.includes(word) ? 1 : 0), 0)
    const topicMatch = topics.reduce((score, word) => score + (title.includes(word) ? 5 : description.includes(word) ? 2 : 0), 0)
    return { ...entry, score: match + topicMatch }
  }).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 4)
  if (!ranked.length) return siteIdentityContext()
  const courseContext = ranked.map(({ course, major }) => {
    const resources = getAllCourseResources(course).slice(0, 3).map(resource => `${resource.title} [${resource.kind}]`).join('، ')
    return `[${major}] ${course.name} (${course.code})؛ المستوى ${course.year}، الفصل ${termWord(course.semester)}؛ ${course.description.slice(0, 200)}${resources ? `؛ المصادر المسجلة: ${resources}` : ''}`
  }).join('\n')
  return `${siteIdentityContext()}\nمقتطفات المقررات المرتبطة بالسؤال:\n${courseContext}`.slice(0, 2200)
}

/** Resource lookup is deterministic: no invented files, and no reading private PDFs. */
export type LectureResponse = AcademicAnswer & { courseId?: string; followups?: string[] }

const resourceWords = /(?:محاضر|محاضره|محاضرات|ملزم|ملزمه|ملازم|مذكر|سلايد|سلايدات|شرائح|ملف|ملفات|pdf|ملخص|نموذج|نماذج|اختبار|امتحان|تنزيل|تحميل|الرابط|رابط|ارسلها|ابعثها|هاتها|نزلها|اريدها|ابغاها|اعطينيها)/
const arabicOrdinals: Record<string, number> = {
  الاول: 1, الاولي: 1, اول: 1, الثاني: 2, الثانيه: 2, ثالث: 3, الثالث: 3, الثالثه: 3,
  الرابع: 4, الرابعه: 4, الخامس: 5, الخامسه: 5, السادس: 6, السادسه: 6,
  السابع: 7, السابعه: 7, الثامن: 8, الثامنه: 8, التاسع: 9, التاسعه: 9,
  العاشر: 10, العاشره: 10,
}
function lectureNumber(text: string): number | null {
  const q = normalizeAcademic(text)
  const numeric = q.match(/(?:محاضره|محاضرات|ملزمه|ملزمه|ملف|سلايد|رقم|pdf)\s*(?:ال)?\s*(\d{1,2})\b/)
  if (numeric) return Number(numeric[1])
  const word = q.match(/(?:(?:محاضره|ملزمه|ملف|سلايد|المحاضره|الملزمه)\s+(?:رقم\s+)?)?(الاول|الاولي|اول|الثاني|الثانيه|ثالث|الثالث|الثالثه|الرابع|الرابعه|الخامس|الخامسه|السادس|السادسه|السابع|السابعه|الثامن|الثامنه|التاسع|التاسعه|العاشر|العاشره)/)
  return word ? arabicOrdinals[word[1]] : null
}
function resourceOrder(title: string): number | null {
  const q = normalizeAcademic(title)
  const number = q.match(/\b(\d{1,2})\b/)
  if (number) return Number(number[1])
  for (const [word, num] of Object.entries(arabicOrdinals)) if (q.split(' ').includes(word)) return num
  return null
}
export function identifyAcademicCourse(question: string): { course: Course; major: 'IT' | 'CS' } | null {
  const exact = exactCourse(question)
  if (exact) return exact
  const q = normalizeAcademic(question)
  const words = tokens(question).filter(w => !['محاضره','المحاضره','محاضرات','الملزمه','ملزمه','ماده','الاول','الثاني','الثالث','الرابع','الخامس','هات','ارسل','ارسلها','ملف','مواد','ملخص','اختبار','ملازم','عطني','ابغي','ابغى','ابي','اعطني','اعطيني','سلايد','المذكره','مذكره','رابط'].includes(w))
  if (!words.length) return null
  const wantedMajor = userMajor(q)
  const candidates = allCourses.map(entry => {
    const name = normalizeAcademic(entry.course.name)
    const nameWords = tokens(name)
    const hit = words.filter(word => nameWords.some(part => part.includes(word) || word.includes(part))).length
    const score = hit * 3 + (name.includes(q) ? 5 : 0) + (wantedMajor === entry.major ? 1 : 0)
    return { entry, score, hit, total: nameWords.length }
  }).filter(item => item.hit >= 2 || (item.hit === 1 && words.length === 1 && (item.total === 1 || words[0].length >= 5)))
    .sort((a,b) => b.score - a.score)
  if (!candidates.length) return null
  // A single partial word can refer to several different subjects; ask rather than guess.
  if (candidates.length > 1 && candidates[0].score === candidates[1].score && candidates[0].entry.course.id !== candidates[1].entry.course.id) return null
  return candidates[0].entry
}
/** Resolve a new subject mention before the previous chat context. Never let a stale
 * subject silently override the subject explicitly requested in this message.
 * Unqualified curriculum names such as «اللغة العربية» match multiple levels.
 */
function explicitCourseCandidates(question: string): { course: Course; major: 'IT' | 'CS' }[] {
  const q = normalizeAcademic(question)
    .replace(/(^|\s)للغه(?=\s|$)/g, '$1اللغه')
    .replace(/(^|\s)لغه(?=\s|$)/g, '$1اللغه')
    .replace(/(^|\s)عربيه(?=\s|$)/g, '$1العربيه')
  const major = userMajor(q)
  const items = major ? allCourses.filter(item => item.major === major) : allCourses
  const exact = items.filter(({ course }) => {
    const name = normalizeAcademic(course.name)
    const code = normalizeAcademic(course.code)
    return (name.length >= 5 && q.includes(name)) || (code.length >= 4 && q.includes(code))
  })
  if (exact.length) {
    // Prefer the longest explicitly mentioned course name over a shorter prefix.
    const longest = Math.max(...exact.map(({course}) => normalizeAcademic(course.name).length))
    return exact.filter(({course}) => normalizeAcademic(course.name).length === longest)
  }
  const stemMatches = items.filter(({ course }) => {
    const name = normalizeAcademic(course.name)
    const stem = name.replace(/\s+(?:[12]|الاول|الثاني)$/g, '')
    return stem.length >= 8 && stem.split(' ').length >= 2 && q.includes(stem)
  })
  if (stemMatches.length) return stemMatches
  // Short common colloquial names, only when the named subject is unambiguous.
  if (/(?:^|\s)(?:عربي|العربي)(?:\s|$)/.test(q)) {
    return items.filter(({ course }) => normalizeAcademic(course.name).startsWith('اللغه العربيه'))
  }
  return []
}

const genericResourceWords = new Set([
  'عطني', 'اعطني', 'اعطيني', 'ابي', 'ابغا', 'ابغي', 'اريد', 'ارسل', 'ارسلها', 'هات', 'هاتلي', 'جيب', 'لي', 'لو', 'سمحت',
  'ملازم', 'ملزمه', 'الملزمه', 'محاضره', 'المحاضره', 'محاضرات', 'المحاضرات', 'ملف', 'الملف', 'ملفات', 'الملفات',
  'سلايد', 'سلايدات', 'مذكره', 'المذكره', 'pdf', 'ملخص', 'الملخص', 'نموذج', 'نماذج', 'اختبار', 'الاختبار',
  'عملي', 'العملي', 'نظري', 'النظري', 'رابط', 'الرابط', 'تحميل', 'تنزيل', 'ماده', 'الماده', 'رقم',
  'اول', 'الاول', 'الاولي', 'ثاني', 'الثاني', 'الثانيه', 'ثالث', 'الثالث', 'الثالثه', 'رابع', 'الرابع', 'الرابعه',
  'خامس', 'الخامس', 'الخامسه', 'سادس', 'السادس', 'السادسه', 'الي', 'اللي', 'بعده', 'بعدها', 'المتوفره', 'متاحه',
  'جميع', 'كل', 'ابغيها', 'ابيها', 'اريدها', 'ارسلي', 'عندك', 'في', 'من', 'عن', 'حق', 'ممكن', 'تكفي',
])
/** Words left after removing generic lecture requests: a probable NEW subject. */
function hasNamedSubject(question: string): boolean {
  return normalizeAcademic(question).split(' ').some(word => {
    if (genericResourceWords.has(word) || /^(?:\d{1,2}|it|cs)$/.test(word)) return false
    if (/^(?:لل|ال)(?:محاضره|ملزمه|ملازم|ملف|ملخص)$/.test(word)) return false
    return word.length >= 4
  })
}
function disambiguateCourses(matches: { course: Course; major: 'IT' | 'CS' }[]): LectureResponse | null {
  const choices = [...new Map(matches.map(item => [`${item.major}:${item.course.id}`, item])).values()]
  if (choices.length <= 1) return null
  const labels = [...new Set(choices.map(({ course }) => course.name))]
  const majors = [...new Set(choices.map(({ major }) => major))]
  const options = choices.slice(0, 6).map(({ course, major }) => `ملازم ${course.name} ${major}`)
  return {
    text: labels.length > 1
      ? `لقيت أكثر من مقرر بهذا الاسم: ${labels.join('، ')}. أي واحد تقصد؟${majors.length > 1 ? ' وحدد IT أو CS أيضًا.' : ''}`
      : `وجدت مقرر «${labels[0]}» في أكثر من تخصص. تقصد IT أم CS؟`,
    followups: options,
    destination: 'library', button: 'فتح المكتبة',
  }
}

export function findLectureAnswer(question: string, previousCourseId?: string): LectureResponse | null {
  const q = normalizeAcademic(question)
  if (!resourceWords.test(q) && !(previousCourseId && /^(الاول|الاولي|الثاني|الثانيه|الثالث|الرابع|الرابعه|الخامس|الخامسه|اللي بعده|اللي بعدها|بعدها|الثانيه|الي بعدها)/.test(q))) return null
  // Explicitly named subjects always override chat history, even when the new
  // subject has no indexed lectures. A generic "المحاضرة الثانية" may reuse context.
  const explicit = explicitCourseCandidates(question)
  const ambiguous = disambiguateCourses(explicit)
  if (ambiguous) return ambiguous
  const mentioned = explicit[0] || identifyAcademicCourse(question)
  const freshSubjectUnresolved = !mentioned && hasNamedSubject(question)
  const matched = mentioned || (!freshSubjectUnresolved ? allCourses.find(item => item.course.id === previousCourseId) : undefined) || null
  if (!matched && freshSubjectUnresolved) {
    return {
      text: 'ما لقيت مادة مطابقة للاسم الذي كتبته في فهرس Tech Elite. اكتب اسم المقرر كما يظهر في الخطة مع التخصص IT أو CS، وما باختار مادة قديمة من المحادثة بدلًا عنه.',
      destination: 'library', button: 'تصفح المكتبة',
    }
  }
  if (!matched) {
    return {
      text: 'أكيد، أساعدك في الوصول للمحاضرة. اكتب اسم المادة مع رقم المحاضرة، ويفضل التخصص أيضًا إذا كانت مشتركة بين IT وCS. مثال: «المحاضرة الأولى تنظيم ومعمارية الحاسب IT».',
      followups: ['المحاضرة الأولى تنظيم ومعمارية الحاسب IT', 'افتح المكتبة'],
      destination: 'library', button: 'تصفح المكتبة',
    }
  }
  const { course } = matched
  const entries = getAllCourseResources(course)
  const requestedNumber = lectureNumber(question)
  const isExam = /اختبار|امتحان|نموذج/.test(q)
  const isSummary = /ملخص/.test(q)
  const isPractical = /عملي|تطبيق/.test(q)
  const isTheory = /نظري/.test(q)
  const academic = entries.filter(resource => {
    const kind = normalizeAcademic(resource.kind)
    const title = normalizeAcademic(resource.title)
    if (isExam) return /اختبار|نموذج|امتحان/.test(kind + ' ' + title)
    if (isSummary) return /ملخص/.test(kind + ' ' + title)
    if (isPractical) return /عملي|تطبيق/.test(kind + ' ' + title)
    if (isTheory) return /نظري|ملزمه pdf/.test(kind + ' ' + title)
    return /ملزمه|محاضره|مذكره|ملخص|اختبار|نموذج|تطبيق عملي|سلايد/.test(kind + ' ' + title)
  })
  const matchedNumber = requestedNumber === null ? academic : academic.filter(resource => resourceOrder(resource.title) === requestedNumber)
  const available = matchedNumber.filter(resource => /^https:\/\//i.test(resource.url))
  const privateArchive = (url: string) => /^https:\/\/t\.me\/c\/\d+\/\d+(?:\?|$)/.test(url)
  const links = available.slice(0, 6).map(resource => ({
    title: `${privateArchive(resource.url) ? 'فتح في الأرشيف: ' : 'فتح الملف: '}${resource.title}`,
    url: resource.url,
  }))
  // Telegram deep-link follows the archive integration already installed in Tech Elite:
  // /start m_<courseId>_<messageId>; this is NOT a file_<course>_<index> payload.
  const chatBot = String(siteConfig.telegramBotUsername || '').replace(/^@/, '')
  const botAvailable = /^[a-z][a-z0-9_]{4,31}bot$/i.test(chatBot)
  const archiveMessage = (value: string): number | null => {
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:' || url.hostname !== 't.me') return null
      const found = /^\/c\/4300869581\/(\d+)\/?$/.exec(url.pathname)
      return found && Number.isSafeInteger(Number(found[1])) && Number(found[1]) > 0 ? Number(found[1]) : null
    } catch { return null }
  }
  if (botAvailable) {
    for (const resource of available.slice(0, 6)) {
      const id = archiveMessage(resource.url)
      if (id === null) continue
      // Prefer bot delivery for private archive files; do not offer a broken private-channel URL as primary.
      const ix = links.findIndex(link => link.url === resource.url)
      if (ix >= 0) links.splice(ix, 1)
      links.push({
        title: `📩 استلام ${resource.title} عبر بوت الدفعة`,
        url: `https://t.me/${chatBot}?start=m_${course.id}_${id}`,
      })
    }
  }
  if (!academic.length) return {
    courseId: course.id, text: `عرفت المادة: «${course.name}». لكن لم أجد ملازم أو محاضرات لها في فهرس الموقع حاليًا، ولا أريد إرسال رابط غير موجود. يمكنك مراجعة المكتبة أو طلب شرح لموضوع من المادة.`,
    destination: 'library', button: 'فتح المكتبة', followups: [`اشرح لي موضوعًا من ${course.name}`],
  }
  if (!available.length) return {
    courseId: course.id, text: `وجدت المادة «${course.name}»، لكن ${requestedNumber ? `المحاضرة رقم ${requestedNumber}` : 'النوع المطلوب'} غير مسجل في مصادرها الحالية. الموجود بالمكتبة: ${academic.slice(0, 4).map(r => r.title).join('، ')}.\nهل تريد محاضرة أخرى؟`,
    destination: 'library', button: 'عرض جميع المصادر', followups: [`ملازم ${course.name}`, 'افتح المكتبة'],
  }
  return {
    courseId: course.id,
    text: `لقيت لك ${available.length === 1 ? 'الملف المطلوب' : `${available.length} ملفات متاحة`} في «${course.name}»${requestedNumber ? `، المحاضرة ${requestedNumber}` : ''}.\n${available.slice(0, 6).map((r,i) => `${i+1}. ${r.title}`).join('\n')}\n\nاضغط الرابط أدناه لفتح الملف${available.some(r=>privateArchive(r.url)) ? '؛ يمكنك استلام ملفات قناة الأرشيف الخاصة عبر بوت الدفعة إذا كان تكامل الأرشيف مثبتًا ومنشورًا.' : '.'}\nهل تحتاج شرحًا لجزء من المحاضرة أيضًا؟`,
    links,
    destination: 'library', button: 'عرض مكتبة المادة',
    followups: [`اشرح لي فكرة من ${course.name}`, `ملازم ${course.name}`],
  }
}
