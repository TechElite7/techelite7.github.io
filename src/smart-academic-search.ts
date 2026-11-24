/**
 * Tech Elite site-aware academic routing. All factual course/resource results come
 * from the current site data, not an LLM guess. No PDF is read here.
 */
import { courses, siteConfig, type Course, type Resource } from './data'
import { csAllCourses } from './cs-plan-data'
import { getAllCourseResources, archiveMessageId } from './telegram-materials'
import { cohortMembers } from './cohort-members-data'
import { normalizeAcademic } from './site-assistant-knowledge'
import { inferAssistantIntent } from './assistant-intent'
import type { SiteConversationState } from './assistant-intent'
import type { SiteRecordKind } from './assistant-site-sources'
import type { AcademicConversationState } from './academic-conversation-state'

/** Resource ownership travels with its links, including Telegram bot delivery URLs. */
export type CourseResourceGroup = {
  courseId: string
  courseName: string
  major: 'IT' | 'CS'
  year: number
  semester: 1 | 2
  tabKey?: 'h' | 'a' | 't' | 'x' | 'u'
  resources: { title: string; url: string; sourceUrl: string; kind: Resource['kind'] }[]
}

export type SmartAnswer = {
  text: string
  destination?: 'plan' | 'library' | 'about' | 'cs' | 'guide'
  button?: string
  links?: { title: string; url: string }[]
  resourceGroups?: CourseResourceGroup[]
  academicState?: AcademicConversationState | null
  siteState?: SiteConversationState | null
  retrieval?: { kind: SiteRecordKind; ids: string[]; sources: string[]; status: 'found' | 'empty' | 'clarify' }
  followups?: string[]
  courseId?: string
}
type Major = 'IT' | 'CS'
type Entry = { course: Course; major: Major }
const rows: Entry[] = [
  ...courses.map(course => ({ course, major: 'IT' as const })),
  ...csAllCourses.map(course => ({ course, major: 'CS' as const })),
]
const ordinals: Record<string, number> = {
  اول: 1, الاول: 1, الاولي: 1, اولي: 1, واحد: 1,
  ثاني: 2, الثاني: 2, الثانيه: 2, ثانيه: 2, اثنين: 2,
  ثالث: 3, الثالث: 3, الثالثه: 3, ثالثه: 3,
  رابع: 4, الرابع: 4, الرابعه: 4, رابعه: 4,
  خامس: 5, الخامس: 5, الخامسه: 5, خامسه: 5,
  سادس: 6, السادس: 6, السادسه: 6, سادسه: 6,
  سابع: 7, السابع: 7, السابعه: 7,
  ثامن: 8, الثامن: 8, الثامنه: 8,
  تاسع: 9, التاسع: 9, التاسعه: 9,
  عاشر: 10, العاشر: 10, العاشره: 10,
}
const ordinalName = (number: number) => ({1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع'} as Record<number, string>)[number] || `${number}`
const arabicDigits = (text: string) => text.replace(/[٠-٩]/g, x => String(x.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, x => String(x.charCodeAt(0) - 0x6f0))
const n = (text: string) => normalizeAcademic(arabicDigits(text)).replace(/\b(?:انجليزي|انجليزيه|انقليزي|انجليش|انقلش|انقليش|english)\b/g, 'انجليزي')
  .replace(/\b(?:عربي|عربيه|arabic)\b/g, 'عربي')
  .replace(/\b(?:برمجه|البرمجه|programming)\b/g, 'برمجه')
const wordBase = (w: string) => w.replace(/^و(?=.{3})/, '').replace(/^(?:وال|بال|فال|لل)(?=.{3})/, '').replace(/^ال(?=.{3})/, '')
const stopWords = new Set([
  'جب','لا','بس','طيب','اريده','عطني','اعطني','اعطيني','اريد','ابي','ابغا','ابغي','هات','جيب','ارسل','ارسلي','ابعت','ممكن','لو','سمحت',
  'ملزمه','ملازم','محاضره','محاضرات','ملف','ملفات','سلايد','سلايدات','مذكره','شرح','اشرح',
  'النظري','نظري','العملي','عملي','تطبيقي','خطة','خطه','الماده','ماده','مقرر','المقرر',
  'مستوي','فصل','ترم','الترم','السنه','سنه','الدراسي','السابق','الحالي','حق','في','من','عن','مع',
  'الاول','اول','الاولي','اولي','الثاني','ثاني','الثانيه','ثانيه','الثالث','ثالث','الثالثه','ثالثه','الرابع','رابع','الرابعه','رابعه',
  'ما','هي','هو','اي','ايش','وش','هذي','هذا','لي','كيف','هل','عندكم','موجود','متوفر','الموجوده',
  'اريدها','ابيها','الخاصه','الخاص','اللي','بعده','بعدها','الطلب','الرقم','رقم','جميع','كل',
])
const topicWords = (v: string) => n(v).split(' ').map(wordBase).filter(x => x.length >= 3 && !stopWords.has(x))
const numberAfter = (q: string, types: string): number | undefined => {
  const match = q.match(new RegExp(`(?:${types})\\s*(?:رقم\\s*)?(?:ال)?(\\d{1,2}|(?:ال)?(?:اول|اولي|ثاني|ثانيه|ثالث|ثالثه|رابع|رابعه|خامس|خامسه|سادس|سادسه))(?:\\s|$)`))
  if (!match) return undefined
  const value = ordinals[match[1]] ?? Number(match[1])
  return Number.isFinite(value) && value > 0 ? value : undefined
}
const yearFrom = (q: string): number | undefined => numberAfter(q, 'مستوي|المستوي|المستوى|سنه|السنه|السنة|level|السنه الدراسيه')
const semesterFrom = (q: string): number | undefined => numberAfter(q, 'الترم|ترم|الفصل|فصل|semester')
const majorFrom = (q: string): Major | undefined => {
  if (/(?:\bcs\b|علوم\s*الحاسوب|علوم\s*الحاسب)/.test(q)) return 'CS'
  if (/(?:\bit\b|تقنيه\s*المعلومات|تكنولوجيا\s*المعلومات)/.test(q)) return 'IT'
  return undefined
}
const wantedResource = (q: string) => /ملزم|محاضر|محاضره|ملازم|ملف|سلايد|شرائح|مذكر|pdf|نموذج|نماذج|اختبار|امتحان|ملخص|تلخيص|مراجع|اسئله|اسئلة|عملي|نظري|مترجم|ترجمه|تطبيقي|لاب|معمل|مصدر|مصادر|فيديو|برنامج|برامج|شروحات|تنزيل|تحميل|ارسل|ابعث|رابط/.test(q)
const wantsPlan = (q: string) => /(?:مواد|مقررات|الخطة|الخطه|خطة|جدول)/.test(q)
const wantsCourseDetails = (q: string) => /(?:تفاصيل|معلومات|الساعات|ساعات|كود|رمز|متى|وين|ايش\s*مادة|ايش\s*ماده)/.test(q)
const isExplanation = (q: string) => /^(?:اشرح|فسر|فهمني|علمني|وضح|ليش|لماذا|كيف\s+يعمل|ما\s*الفرق)/.test(q)
const normalizedCourse = (entry: Entry) => n(entry.course.name)
const englishAliases = (q: string) => /(?:english|انجليزي|الانجليزي|انقليزي|انجلش|انقلش|للانجليزي|لانجليزي)/.test(q) || q.split(' ').some(w => wordBase(w).length >= 5 && distance(wordBase(w),'انجليزي') <= 2)
const arabicAliases = (q: string) => /(?:عربي|العربي|عربيه|العربيه)/.test(q)
const distance = (a: string, b: string): number => {
  if (Math.abs(a.length - b.length) > 2) return 3
  const prev = Array.from({length:b.length+1},(_,i)=>i)
  for (let i=1;i<=a.length;i++) {
    let old = prev[0]; prev[0]=i
    for (let j=1;j<=b.length;j++) { const tmp=prev[j]; prev[j]=Math.min(prev[j]+1,prev[j-1]+1,old+(a[i-1]===b[j-1]?0:1));old=tmp }
  }
  return prev[b.length]
}
// Domain nouns are exact type signals, never spelling corrections into course titles.
const semanticNouns = new Set(['مسار', 'مسارات', 'مقرر', 'مقررات', 'محاضره', 'محاضرات', 'خطه', 'ملازم', 'تخصص'])
const closeWord = (a: string, b: string) => a===b || !semanticNouns.has(a) && !semanticNouns.has(b) && ( (Math.min(a.length,b.length)>=4 && (a.includes(b) && b.length>=4 || b.includes(a) && a.length>=4)) ||
  (Math.min(a.length,b.length)>=5 && distance(a,b) <= (Math.min(a.length,b.length)>=8 ? 2 : 1)))

export type AcademicCourseConstraints = {
  major?: Major | 'ALL'
  year?: number | 'ALL'
  semester?: number | 'ALL'
}
export type AcademicCourseResolution = { matches: Entry[]; hasSubject: boolean }

/*
 * Build the name index from the same catalog used by the site. Frequencies count
 * distinct names, so a shared IT/CS course is not less informative by accident.
 * Arabic conjunctions/articles are stripped per token rather than by word order.
 */
const catalogNames = [...new Set(rows.map(entry => normalizedCourse(entry)))]
const tokenFrequency = new Map<string, number>()
for (const name of catalogNames) {
  for (const word of new Set(topicWords(name))) {
    tokenFrequency.set(word, (tokenFrequency.get(word) || 0) + 1)
  }
}
const genericFrequency = Math.max(6, Math.ceil(catalogNames.length * 0.12))
const isInformative = (word: string) => (tokenFrequency.get(word) || 0) < genericFrequency
const wordWeight = (word: string) => Math.log((catalogNames.length + 1) / ((tokenFrequency.get(word) || 0) + 1))
const normalizedStopWords = new Set([...stopWords].map(word => wordBase(n(word))))
const requestWords = new Set([
  'اقصد', 'قصدي', 'يعني', 'لك', 'رجاء', 'ابغي', 'ابغاه', 'بغيت', 'بغيتك', 'حقها', 'حقه',
  'مواد', 'مقررات', 'مستويات', 'فصول', 'تخصص', 'تخصصين', 'كلا', 'كلاهما', 'تخصصات',
  'فقط', 'كلها', 'كلهن', 'كلهم', 'حقهن', 'حقهم', 'علي', 'عليه', 'عليها',
  'ليست', 'ليس', 'انما', 'بدل', 'بدلا', 'ماابي', 'ابدا', 'اخري', 'ثانيه',
  'عدد', 'عددها', 'عددهم', 'عددهن', 'احسب', 'احسبها', 'احسبهن', 'اعرض', 'اعرضها',
  'اعرضهن', 'عرض', 'قائمه', 'الي', 'حتي', 'كامل', 'كامله', 'لنا', 'هاتلي', 'ارني',
  'عطنا', 'اعطنا', 'عطيني', 'عطوني', 'اعطوني', 'جيبلنا', 'جيبلي', 'هاتلنا',
  'اسحب', 'نزل', 'نزلي', 'حمل', 'حملي', 'تحميل', 'تنزيل',
].map(word => wordBase(n(word))))
// Resource nouns can carry a possessive pronoun without naming another course.
const resourceNouns = new Set([
  'ملزمه', 'ملازم', 'محاضره', 'محاضرات', 'ملف', 'ملفات', 'رابط', 'روابط',
  'سلايد', 'سلايدات', 'شرائح', 'مذكره', 'مذكرات', 'ملخص', 'ملخصات', 'تلخيص', 'تلاخيص',
  'مراجعه', 'مراجعات', 'مصدر', 'مصادر', 'مرجع', 'مراجع', 'تعلم', 'التعلم', 'توثيق',
  'فيديو', 'فيديوهات', 'شروحات', 'يوتيوب', 'برنامج', 'برامج',
  'نموذج', 'نماذج', 'اختبار', 'اختبارات', 'امتحان', 'امتحانات', 'اسئله', 'اسئلة',
  'نهائي', 'نصفي', 'ميد', 'فاينل', 'كويز', 'سابق', 'سابقه',
  'نظري', 'عملي', 'مترجم', 'مترجمه', 'مترجمات', 'ترجمه', 'تطبيقي', 'تطبيقات', 'لاب', 'لابات', 'معمل', 'معامل',
  'فيه', 'فيها', 'لها', 'يوجد', 'توجد', 'شي', 'شيء', 'pdf',
])
const isResourceReference = (word: string) => {
  if (resourceNouns.has(word)) return true
  const suffix = word.match(/(?:ها|هما|هم|هن|نا|كم|كن|ه|ك|ي)$/)?.[0]
  if (!suffix) return false
  const base = word.slice(0, -suffix.length)
  return resourceNouns.has(base) || (base.endsWith('ت') && resourceNouns.has(base.slice(0, -1) + 'ه'))
}
const queryWords = (query: string) => {
  // Scope/lecture numbers do not become part of a course's name.
  const stripped = query
    .replace(/(?:المستوي|مستوي|السنه|سنه|الفصل|فصل|الترم|ترم|level|semester|المحاضره|محاضره|الملزمه|ملزمه|الملف|ملف)\s*(?:رقم\s*)?(?:\d{1,2}|(?:ال)?(?:اول|اولي|ثاني|ثانيه|ثالث|ثالثه|رابع|رابعه|خامس|خامسه|سادس|سادسه))(?=\s|$)/g, ' ')
    .replace(/(?:تقنيه|تكنولوجيا)\s+المعلومات|علوم\s+(?:الحاسب|الحاسوب)|\b(?:it|cs)\b/g, ' ')
  return [...new Set(topicWords(stripped).filter(word =>
    !normalizedStopWords.has(word) && !requestWords.has(word) && !isResourceReference(word) && !/^\d+$/.test(word),
  ))]
}
const escapedPattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const exactCodeMatches = (query: string, course: Course) => {
  const code = n(course.code)
  if (!code) return false
  const pattern = code.split(' ').map(escapedPattern).join('\\s*')
  return new RegExp('(?:^|[^\\p{L}\\p{N}])' + pattern + '(?=$|[^\\p{L}\\p{N}])', 'u').test(query)
}
const namedCourseNumber = (query: string) => {
  // Read only numbers following catalog topic words, never a lecture/scope label.
  const words = query.split(' ')
  for (let index = words.length - 1; index > 0; index--) {
    const value = ordinals[words[index]] || (/^[1-9]$/.test(words[index]) ? Number(words[index]) : undefined)
    const previous = wordBase(words[index - 1])
    const followsTopic = [...tokenFrequency.keys()].some(word => closeWord(previous, word))
    if (value && followsTopic && !normalizedStopWords.has(previous)) return value
  }
  return undefined
}

/** Resolve catalog identities, retaining real ambiguity and honoring every scope constraint. */
export function resolveAcademicCourses(question: string, constraints: AcademicCourseConstraints = {}): AcademicCourseResolution {
  if (inferAssistantIntent(question)) return { matches: [], hasSubject: false }
  const result = detectAcademicSubjects(question, constraints)
  return { matches: result.matches, hasSubject: result.hasSubject }
}

function detectAcademicSubjects(raw: string, constraints: AcademicCourseConstraints = {}): { matches: Entry[]; hasSubject: boolean; guessed: boolean } {
  const q = n(raw)
  const major = constraints.major ?? majorFrom(q)
  const year = constraints.year ?? yearFrom(q)
  const semester = constraints.semester ?? semesterFrom(q)
  const inputWords = queryWords(q)
  const directCodes = rows.filter(entry => exactCodeMatches(q, entry.course))
  const hasSubject = directCodes.length > 0 || inputWords.length > 0
  const specifiedNumber = namedCourseNumber(q)
  const scoped = rows.filter(entry =>
    (major === undefined || major === 'ALL' || major === entry.major) &&
    (year === undefined || year === 'ALL' || year === entry.course.year) &&
    (semester === undefined || semester === 'ALL' || semester === entry.course.semester),
  )
  if (directCodes.length) {
    return { matches: scoped.filter(entry => exactCodeMatches(q, entry.course)), hasSubject: true, guessed: false }
  }
  const candidates = scoped.map(entry => {
    const name = normalizedCourse(entry)
    const words = [...new Set(topicWords(name))]
    const direct = (' ' + q + ' ').includes(' ' + name + ' ')
    const hits = inputWords.flatMap(word => {
      const exact = words.find(courseWord => word === courseWord)
      const matched = exact || words.find(courseWord => closeWord(word, courseWord))
      return matched ? [{ word: matched, quality: exact ? 1 : 0.8 }] : []
    })
    const informative = hits.filter(hit => isInformative(hit.word)).length
    const suffix = Number(name.match(/\s(\d)$/)?.[1]) || undefined
    const suffixMatches = specifiedNumber === undefined || suffix === undefined || specifiedNumber === suffix
    // A frequent word cannot establish course identity, even with a known scope.
    const qualifies = direct || (informative > 0 && hits.length >= Math.min(2, inputWords.length))
    const score = (direct ? 100 : 0) + hits.reduce((sum, hit) => sum + wordWeight(hit.word) * hit.quality, 0) +
      (hits.length && hits.length === inputWords.length ? 2 : 0)
    return { entry, score, qualifies: qualifies && suffixMatches, direct }
  })
  let qualified = candidates.filter(candidate => candidate.qualifies)
  if (!qualified.length) {
    qualified = candidates.filter(candidate => candidate.score >= 2.2)
  }
  const finalCandidates = qualified
  if (!finalCandidates.length) return { matches: [], hasSubject, guessed: false }
  const best = Math.max(...finalCandidates.map(candidate => candidate.score))
  // An abbreviated name must retain equally accurate catalog possibilities.
  const bestMatches = finalCandidates.filter(candidate => Math.abs(candidate.score - best) < 0.000001)
  return { matches: bestMatches.map(candidate => candidate.entry), hasSubject, guessed: !bestMatches.some(candidate => candidate.direct) }
}

function detectedSubjects(raw: string): { matches: Entry[]; hasSubject: boolean; guessed: boolean } {
  return detectAcademicSubjects(raw)
}
const uniq = (entries: Entry[]): Entry[] => [...new Map(entries.map(e=>[e.major+':'+e.course.id,e])).values()]
const courseLabel = (e: Entry) => `${e.course.name} (${e.major}، المستوى ${ordinalName(e.course.year)}، الفصل ${ordinalName(e.course.semester)})`
function subjectDescription(q: string): string {
  if (englishAliases(q)) return 'اللغة الإنجليزية'
  if (arabicAliases(q)) return 'اللغة العربية'
  const known = rows.find(item => n(q).includes(n(item.course.name)))
  if (known) return known.course.name
  const from = n(q).match(/(?:ماده|مقرر|حق|ملزمه|ملازم|محاضره)\s+([\p{L}\s]{4,45})/u)?.[1]
  return (from||'المادة المطلوبة').replace(/\b(?:مستوي|سنه|الفصل|الترم|it|cs)\b.*$/,'').trim() || 'المادة المطلوبة'
}
function askMajorOrChoose(matches: Entry[], q: string): SmartAnswer | null {
  const labels = [...new Set(matches.map(({course}) => course.name))]
  if (matches.length === 1) return null
  // The course name can be identical across two majors. Ask rather than choose silently.
  if (labels.length === 1) {
    const majors = [...new Set(matches.map(e=>e.major))]
    if (majors.length > 1) return {
      text: `وجدت «${labels[0]}» في تخصصي IT وCS. أي تخصص تقصد؟`,
      followups: majors.map(m=>`${q.trim()} ${m}`), destination: 'library', button: 'المكتبة',
    }
  }
  const options = uniq(matches).slice(0,6)
  return {
    text: `وجدت أكثر من مقرر قريب من طلبك، ولا أريد اختيار مادة خطأ:\n${options.map(e=>'• '+courseLabel(e)).join('\n')}\n\nاختر اسم المادة وتخصصها، أو حدد المستوى والفصل.`,
    followups: options.slice(0,4).map(e=>`ملازم ${e.course.name} ${e.major}`),
    destination: 'library', button: 'المكتبة',
  }
}
function archiveLink(course: Course, resource: Resource): { title: string; url: string } | null {
  if (!/^https:\/\//i.test(resource.url)) return null
  try {
    const u=new URL(resource.url)
    const messageId=archiveMessageId(resource.url)
    const bot = String(siteConfig.telegramBotUsername||'').replace(/^@/,'')
    if (u.hostname==='t.me' && messageId && /^[\w]{5,32}bot$/i.test(bot)) {
      return { title: `استلام ${resource.title} عبر بوت الدفعة`, url: `https://t.me/${bot}?start=m_${course.id}_${messageId}` }
    }
    // Don't expose an inaccessible Telegram private-channel URL as a working public attachment.
    if (u.hostname==='t.me' && u.pathname.startsWith('/c/')) return null
    return {title: `فتح ${resource.title}`,url:resource.url}
  } catch {return null}
}
const isLearningKind = (r: Resource) => /وصف رسمي|توثيق رسمي|مسار تعلم|مرجع اضافي|فيديو|برنامج/.test(n(r.kind))
const isLecture = (r: Resource) => !isLearningKind(r) && /ملزمه|ملازم|محاضره|ملخص|تلخيص|نموذج|نماذج|اختبار|امتحان|عملي|تطبيق|مذكره|سلايد|ملف|pdf|الشرح/.test(n(r.kind+' '+r.title))
const typeMatch = (r: Resource, q: string) => {
  const kindOnly = n(r.kind)
  const kind = n(r.kind+' '+r.title)
  if (/مصادر|تعلم|مرجع|مراجع|توثيق|فيديو|برنامج|برامج/.test(q)) return isLearningKind(r)
  if (/كل الملفات|جميع الملفات/.test(q)) return isLecture(r) || isLearningKind(r)
  if (!isLecture(r)) return false
  if (/مترجم|ترجمه/.test(q)) return /مترجم|ترجمه/.test(kind)
  if (/نظري/.test(q)) return (/نظري|ملزمه pdf/.test(kindOnly) || (/ملزمه/.test(kindOnly) && !/عملي|مترجم/.test(kindOnly))) && !/اختبار|امتحان|نموذج|نماذج|ملخص|تلخيص|مترجم/.test(kind)
  if (/عملي|تطبيقي|لاب|معمل/.test(q)) return /عملي|تطبيقي|تطبيق عملي|لاب|معمل/.test(kind)
  if (/ملخص|تلخيص|مراجعه/.test(q)) return /ملخص|تلخيص|مراجعه/.test(kind)
  if (/اختبار|نموذج|نماذج|امتحان|اسئله|اسئلة/.test(q)) return /اختبار|امتحان|نموذج|نماذج/.test(kind)
  return true
}
const detectTabKey = (q: string): CourseResourceGroup['tabKey'] => {
  if (/مترجم|ترجمه/.test(q)) return 't'
  if (/عملي|تطبيقي|لاب|معمل/.test(q)) return 'a'
  if (/اختبار|نموذج|نماذج|امتحان|اسئله|اسئلة/.test(q)) return 'x'
  if (/ملخص|تلخيص|مراجعه/.test(q)) return 'u'
  if (/نظري/.test(q)) return 'h'
  return undefined
}
const lectureNum = (q: string) => numberAfter(q,'محاضره|المحاضره|ملزمه|الملزمه|ملف|الملف|سلايد|السلايد')
const resourceNum = (r: Resource) => lectureNum(n(r.title)) || (n(r.title).match(/\b\d{1,2}\b/)||[])[0] && Number((n(r.title).match(/\b\d{1,2}\b/)||[])[0])

/** Read files directly from the resolved source entry, without re-searching its name. */
export function getCourseResourceGroup(course: Course, major: Major, question = ''): CourseResourceGroup {
  const q = n(question)
  const number = lectureNum(q)
  const resources = getAllCourseResources(course)
    .filter(r => typeMatch(r, q))
    .filter(r => number === undefined || resourceNum(r) === number)
    .flatMap(resource => {
      const link = archiveLink(course, resource)
      return link ? [{title:resource.title, url:link.url, sourceUrl:resource.url, kind:resource.kind}] : []
    })
  return {courseId:course.id, courseName:course.name, major, year:course.year, semester:course.semester, tabKey:detectTabKey(q), resources}
}

function siteNavigation(q: string): SmartAnswer | null {
  if (!/(?:وين|كيف|رابط|افتح|ابي|عطني|اريد|مكان|اذهب|الانتقال|ادخل|شوف|اعرض)/.test(q)) return null
  if (/بوت|تيليجرام|تلجرام|تليجرام/.test(q)) {
    const bot=String(siteConfig.telegramBotUsername||'').replace(/^@/,'')
    return {text:bot?`بوت Tech Elite في تيليجرام هو @${bot}. تقدر تستخدمه للوصول للمصادر التي أُضيفت للأرشيف.`:'رابط بوت الدفعة غير مسجل حاليًا في الموقع.',links:bot?[{title:'فتح بوت الدفعة',url:`https://t.me/${bot}`}]:[]}
  }
  if (/مكتبه|ملازم/.test(q)) return {text:'المكتبة تجمع الملفات والمصادر حسب التخصص والمستوى والفصل والمقرر. اختر المادة للوصول لما أضافته الدفعة فعلًا.',destination:'library',button:'فتح المكتبة'}
  if (/خطة|خطه|مقررات|جدول/.test(q)) return {text:'ستجد جميع المقررات مرتبة حسب IT وCS والمستوى والفصل في الخطة الدراسية.',destination:'plan',button:'فتح الخطة'}
  if (/full\s*stack|خارطه|خارطة|مسار|لابتوب|ابتوب|جهاز/.test(q)) return {text:'صفحة خارطة Full Stack تحتوي مراحل التعلم ونصائح تجهيز اللابتوب. افتحها من الزر التالي.',destination:'guide',button:'فتح خارطة Full Stack'}
  if (/علوم الحاسوب|\bcs\b/.test(q)) return {text:'تجد شرح تخصص علوم الحاسوب CS في صفحة «عن تخصص CS».',destination:'cs',button:'فتح تخصص CS'}
  if (/تقنيه المعلومات|\bit\b/.test(q)) return {text:'تجد شرح تخصص تقنية المعلومات IT في صفحة «عن تخصص IT».',destination:'about',button:'فتح تخصص IT'}
  return null
}

/** Public navigation uses the same configured links as the existing assistant. */
export function findPublicSiteNavigation(question:string):SmartAnswer|null {return siteNavigation(n(question))}

/** Returns site-grounded facts; null means ask AI instead, never fabricate a lecture. */
export function findSmartAcademicAnswer(question: string, previousCourseId?: string): SmartAnswer | null {
  const q=n(question)
  // Public roster is read from the same data rendered by the cohort page.
  if (/مندوب|ممثل الدفعه/.test(q) && /(?:مين|من|اسم|هو|الدفعة|الدفعه|عندكم)/.test(q)) {
    const names=cohortMembers.representatives.map(p=>p.name).filter(Boolean)
    return {text:names.length?`مندوب الدفعة المسجل في الموقع: ${names.join('، ')}.`:'لم يُسجل مندوب للدفعة في بيانات الموقع بعد.'}
  }
  if (/مطور|مبرمج|من طور/.test(q) && /(?:مين|من|اسم|هو|عندكم|الموقع)/.test(q)) {
    const names=cohortMembers.developers.map(p=>p.name).filter(Boolean)
    return {text:names.length?`المطورون المسجلون في صفحة الدفعة: ${names.join('، ')}.`:'لم تُسجل أسماء مطوري الموقع بعد.'}
  }
  const resource=wantedResource(q)
  const year=yearFrom(q), term=semesterFrom(q), major=majorFrom(q)
  const navigation = siteNavigation(q)
  if (navigation && year === undefined && (!resource || !detectedSubjects(question).hasSubject || (/(?:وين|كيف|افتح|ادخل|رابط)/.test(q) && /مكتبه/.test(q)))) return navigation
  const namedCourseQuestion = /(?:ماده|مقرر|تفاصيل|معلومات)/.test(q) || (q.length <= 70 && rows.some(e => q.includes(n(e.course.name))))
  if (!resource && !wantsPlan(q) && !wantsCourseDetails(q) && year===undefined && !namedCourseQuestion) {
    return navigation
  }
  if (isExplanation(q) && !resource) return null // Explain via the actual model.
  // Plan queries with an explicit level but no named subject.
  const detected=detectedSubjects(question)
  if (!detected.hasSubject && year!==undefined && (wantsPlan(q) || /(?:ايش|وش|ماهي|ماهي|قائمه|عرض|مستوي)/.test(q))) {
    if (!major) return {text:`تقصد مواد المستوى ${ordinalName(year)} في IT أم CS؟`,followups:[`مواد المستوى ${ordinalName(year)} IT`,`مواد المستوى ${ordinalName(year)} CS`],destination:'plan',button:'الخطة الدراسية'}
    const matches=rows.filter(e=>e.major===major&&e.course.year===year&&(term===undefined||e.course.semester===term))
    return matches.length?{text:`مواد المستوى ${ordinalName(year)} في ${major}${term?`، الفصل ${ordinalName(term)}`:''}:\n${matches.map(e=>'• '+e.course.name).join('\n')}\n\nالمصدر: الخطة المعروضة في Tech Elite.`,destination:'plan',button:'فتح الخطة'}:
      {text:`لا توجد مواد مسجلة لهذا المستوى والفصل في خطة ${major} المعروضة بالموقع.`,destination:'plan',button:'فتح الخطة'}
  }
  if (!resource && !detected.hasSubject && !wantsPlan(q)) return siteNavigation(q)

if (resource && !detected.hasSubject) {
  if (previousCourseId) {
    const prev = rows.find(
      e => e.course.id === previousCourseId
    )

    if (prev) {
      return deliverFiles(prev, q)
    }
  }

  return {
    text: 'أكيد. اكتب اسم المادة، ويفضل التخصص والمستوى والفصل، وسأبحث عن الملف المسجّل فعليًا. مثال: «ملزمة عملي برمجة الحاسب 1 IT».',
    destination: 'library',
    button: 'فتح المكتبة'
  }
}

  const broad=detectedSubjects(question)
  if (!broad.matches.length) {
    // Unknown subject: do not send an earlier subject's files.
    return {text:`لم أجد مقررًا يطابق «${subjectDescription(q)}» ضمن خطة IT أو CS المسجلة في الموقع. جرّب اسمًا أقرب أو رمز المقرر، وأقدر أعرض لك مواد المستوى المطلوب.`,destination:'plan',button:'فتح الخطة الدراسية'}
  }
  // Explicit constraints have authority over course name similarity and session context.
  const valid=broad.matches.filter(e=>(year===undefined||e.course.year===year)&&(term===undefined||e.course.semester===term))
  if (!valid.length) {
    const options=uniq(broad.matches).slice(0,6)
    const subject=subjectDescription(q)
    const target=`${year!==undefined?`المستوى ${ordinalName(year)}`:'المستوى المذكور'}${term!==undefined?`، الفصل ${ordinalName(term)}`:''}`
    return {text:`بحسب خطة Tech Elite، لا يوجد مقرر «${subject}» في ${target}${major?` لتخصص ${major}`:''}.\n${options.length?`المقررات المشابهة موجودة هنا:\n${options.map(e=>'• '+courseLabel(e)).join('\n')}`:'لم أجد مقررات مشابهة مسجلة.'}\n\nإذا كنت تقصد اسمًا آخر، اكتب اسم المادة أو رمزها.`,destination:'plan',button:'التحقق من الخطة', followups:options.slice(0,3).map(e=>`ملازم ${e.course.name} ${e.major}`)}
  }
  const unique=uniq(valid)
  const confusion=askMajorOrChoose(unique,question)
  if (confusion) return confusion
  const only=unique[0]
  if (!resource) {
    const c=only.course
    return {text:`${broad.guessed?`فهمت أنك تقصد «${c.name}».\n`:''}${courseLabel(only)}\nالرمز: ${c.code}، الساعات: ${c.creditHours}.\n${c.description}\n\nالمصدر: خطة Tech Elite. إذا تريد ملازمها، اكتب «ملازم ${c.name}».`,courseId:c.id,destination:'plan',button:'الخطة الدراسية'}
  }

  return deliverFiles(only, q)
}

function deliverFiles(entry: Entry, q: string): SmartAnswer {

  const {course}=entry
  const resources=getAllCourseResources(course).filter(isLecture).filter(r=>typeMatch(r,q))
  const number=lectureNum(q)
  const group = getCourseResourceGroup(course, entry.major, q)
  const qualifier=/عملي/.test(q)?'العملي':/نظري/.test(q)?'النظري':/ملخص/.test(q)?'الملخص':/اختبار|نموذج/.test(q)?'الاختبار':'الملازم'
  if (!group.resources.length) {
    const hints=resources.length?`\nالمواد المسجلة من هذا النوع: ${resources.slice(0,4).map(r=>r.title).join('، ')}.`:''
    return {text:`وجدت المقرر «${course.name}» في ${entry.major}، المستوى ${ordinalName(course.year)}، الفصل ${ordinalName(course.semester)}، لكن لا توجد ${number!==undefined?`المحاضرة رقم ${number}`:`ملفات ${qualifier}`} قابلة للفتح مسجلة له في مكتبة الموقع حاليًا.${hints}\nلا أريد أن أختلق لك رابطًا. يمكنك فتح المكتبة أو أن تطلب شرحًا لموضوع من المادة.`,courseId:course.id,destination:'library',button:'تصفح المكتبة',followups:[`اشرح ${course.name}`]}
  }
  return {text:`وجدت ${group.resources.length===1?'ملفًا':'ملفات'} لمقرر «${course.name}» (${entry.major}، المستوى ${ordinalName(course.year)}، الفصل ${ordinalName(course.semester)}).`,resourceGroups:[group],courseId:course.id,destination:'library',button:'المكتبة',followups:[`اشرح لي موضوعًا من ${course.name}`]}
}
