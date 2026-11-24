/**
 * Semantic request types are selected with exact domain vocabulary.
 * Course spelling similarity is deliberately absent from this layer.
 */
import { normalizeAcademic } from './site-assistant-knowledge'

export type SiteIntent = 'Identity' | 'Services' | 'Tracks' | 'TrackPlanDifference' | 'Roadmap' | 'LearningCourses' | 'Library' | 'Bot' | 'Projects' | 'Members' | 'Major' | 'Laptop' | 'Logo'
export type SiteConversationState = { version: 1; intent: SiteIntent; major?: string; query?: string; count?: boolean }
const norm = (text: string) => normalizeAcademic(text).replace(/(^|\s)و(?=\s|ال|it\b|cs\b|مسار|علوم|تقنيه|تكنولوجيا|طيب|طب)/g, '$1').replace(/\s+/g, ' ').trim()
const has = (q: string, forms: string) => new RegExp(`(?:^|\\s)(?:ال|لل|بال|ب|ل)?(?:${forms})(?=\\s|$)`).test(q)
const majors = (q: string): string | undefined => {
  const it = /\bit\b|تقنيه المعلومات|تكنولوجيا المعلومات/.test(q)
  const cs = /\bcs\b|علوم الحاسب|علوم الحاسوب/.test(q)
  if (it && cs) return 'ALL'
  if (it) return 'IT'
  if (cs) return 'CS'
  const explicit = q.match(/(?:تخصص|قسم)\s+(.+?)(?:\s+(?:عندكم|في الموقع|المسجله|المتاحه))?$/)?.[1]
  return explicit || (has(q, 'مسار|مسارات') ? q.match(/\b[a-z]{2,8}\b/)?.[0].toUpperCase() : undefined)
}
const scopeWords = /مستوي|مستويات|فصل|ترم|سنه|\b(?:it|cs)\b|تقنيه المعلومات|علوم الحاسب|علوم الحاسوب/
const resourceForms = 'ملازم|ملزمه|محاضره|محاضرات|ملفات|ملف|pdf|سلايد|سلايدات|ملخص|اختبار|اختبارات|نموذج|نماذج'
const identityEntity = (q: string) => /tech\s*elite|تيك\s*(?:اليت|ايليت|الييت)|تك\s*اليت|دفعه|دفعتنا|دفعتكم|دفعتك|هويتنا/.test(q)
const siteEntity = (q: string) => /موقعكم|موقعنا|الموقع|موقع\s*(?:ال)?(?:دفعه|tech)/.test(q)
const wantsExplanation = (q: string) => has(q, 'اشرح|شرح|فسر|فهمني|علمني|حلل|علل|برمج|اكتب') || /كيف\s+(?:يعمل|تعمل|نكتب|اكتب|ابرمج|اثبت|اشغل)/.test(q)
const count = (q: string) => has(q, 'كم|عدد|اجمالي|احسب')
const residual = (q: string) => q
  .replace(/(?:تقنيه|تكنولوجيا)\s+المعلومات|علوم\s+(?:الحاسب|الحاسوب)|\b(?:it|cs)\b/g, '')
  .split(' ').filter(word => !/^(?:ال)?(?:عطني|اعطني|اعطيني|اريد|منك|ابي|ابغي|ابغا|عرض|اعرض|وين|فين|من|في|عن|كيف|الي|علي|احصل|القي|الاقي|احصلها|اجيب|الاقيها|ممكن|لو|سمحت|لي|انا|هذا|هذه|عندكم|مسار|مسارات|تعلم|التعلم|دورات|دوره|كورسات|كورس|خارطه|خطوات|مراحل|ابدا|اتعلم|تخصص|و|and|طيب|وطيب|طب|زين|اوكي|اما|بالنسبه|وبالنسبه|بس|فقط|ماهي|ماهو|ما|هي|هو|اش|ايش|وش|شنو|حق|حقنا|الموجوده|المتاحه|المسجله|التعليميه|كل|جميع|اهم|حاليا|تعطيني|تعطينا|جيب|جب|هات|كم|عدد|اجمالي|احسب)$/.test(word)).join(' ').trim()
const allIntents: SiteIntent[] = ['Identity', 'Services', 'Tracks', 'TrackPlanDifference', 'Roadmap', 'LearningCourses', 'Library', 'Bot', 'Projects', 'Members', 'Major', 'Laptop', 'Logo']
function validState(value: unknown): value is SiteConversationState {
  if (!value || typeof value !== 'object') return false
  const state = value as SiteConversationState
  return state.version === 1 && allIntents.includes(state.intent)
    && (state.major === undefined || typeof state.major === 'string' && state.major.length <= 100)
    && (state.query === undefined || typeof state.query === 'string' && state.query.length <= 350)
    && (state.count === undefined || typeof state.count === 'boolean')
}
export function inferAssistantIntent(question: string, previous?: SiteConversationState | null): SiteConversationState | null {
  const q = norm(question)
  if (!q) return null
  const major = majors(q)
  const make = (intent: SiteIntent, extra: Partial<SiteConversationState> = {}): SiteConversationState => ({ version: 1, intent, ...extra })
  const tracks = has(q, 'مسار|مسارات')
  const plan = has(q, 'خطه|مواد|مقررات')
  const resources = has(q, resourceForms)
  const explanation = wantsExplanation(q)
  if (tracks && plan && /فرق|اختلاف|قارن/.test(q)) return make('TrackPlanDifference')

  // Check Members BEFORE Identity so "منهم اعضاء دفعة tech elite" returns the member list, not the batch bio.
  const ownedRole = identityEntity(q) || siteEntity(q)
  if (/مندوب|ممثل/.test(q) && !resources && (ownedRole || /^(?:(?:من|مين)(?:\s+هو)?|اسم)\s+(?:ال)?(?:مندوب|ممثل)$/.test(q))) return make('Members', { query: 'representatives', count: count(q) })
  if (/مطور|مبرمج|فريق التطوير|(?:من|مين)\s+(?:طور|برمج|صمم)/.test(q) && (ownedRole || /^(?:(?:من|مين)(?:\s+هو)?|اسم)\s+(?:ال)?(?:مطور|مطورين|مبرمج)$/.test(q))) return make('Members', { query: 'developers', count: count(q) })
  if (/(?:اعضاء|اسماء|اسامي|قائمه|شباب|زملاء)\s*(?:ال)?(?:طلاب|دفعه|دفعتنا|الموقع|tech|تيك|تك)?/.test(q) || /(?:منهم|من\s*هم|مين\s*هم|مين)\s*(?:اعضاء|طلاب|شباب|زملاء)/.test(q) || /(?:عدد|كم)\s*(?:ال)?(?:طلاب|اعضاء|دفعتنا)/.test(q)) {
    return make('Members', { query: /اعضاء|دفعه|دفعتنا|tech|تيك|تك/.test(q) && !/طلاب/.test(q) ? undefined : 'students', count: count(q) })
  }

  // A factual site topic can be explained entirely from its published source.
  const who = /(?:^|\s)(?:من|مين)\s+(?:نحن|احنا|انتم|انتو)(?=\s|$)|(?:^|\s)(?:من|مين)\s+(?:(?:هم|هو|هي)\s+)?(?:ال)?(?:دفعه|دفعتنا|دفعتكم|tech|تيك|تك)/.test(q)
  if (!resources && !plan && (who || identityEntity(q) && has(q, 'هويه|تعريف|نبذه|عرفني|عرفنا|حدثني|احكي|تكلم|معلومات'))) return make('Identity')
  if (siteEntity(q) && /خدمات|اقسام|يقدم|تقدم|يوفر|يسوي|يحتوي|اهداف/.test(q)) return make('Services')
  if (siteEntity(q) && explanation && /(?:عن|عرفني|فهمني)\s*(?:هذا\s*)?(?:الموقع|موقعكم|موقعنا)$/.test(q)) return make('Services')
  if (/شعار|فلسفه الشعار|الوان الهويه/.test(q)) return make('Logo')
  // Course/topic explanations remain generative even when a title matches.
  if (explanation) return null
  if (/مشاريع\s*(?:التخرج|تخرج)/.test(q) || /مشروع\s*(?:التخرج|تخرج)/.test(q) && !resources && !has(q, 'ماده|مقرر') && !/(?:التخرج|تخرج)\s*\d/.test(q)) return make('Projects')
  if (/لابتوب|لاب توب|ابتوب|لابتاب|حاسوب محمول|كمبيوتر محمول|مواصفات الجهاز|اشتري جهاز/.test(q)) return make('Laptop')
  const fullStack = /full\s*stack|فول\s*ستاك|فل\s*ستاك/.test(q)
  if (fullStack && (tracks || /خارطه|مراحل|خطوات|ترتيب|كيف.*(?:ابدا|اتعلم|اتعلمه)|خطة|خطه/.test(q))) return make('Roadmap')
  if (tracks) {
    // Unknown majors and unknown topics remain scoped misses, never lists of curricula.
    const query = residual(q)
    return make('Tracks', { major: major || previous?.major, count: count(q), ...(query && !(major && norm(major).includes(query)) ? { query } : {}) })
  }
  if (has(q, 'دورات|كورسات|دوره|كورس')) return make('LearningCourses', { query: residual(q) })
  if (/بوت|تيليجرام|تلجرام|تليجرام/.test(q) && !resources && !plan) return make('Bot')
  // Navigation is recognized without asking fuzzy course search to choose the intent.
  const library = has(q, 'مكتبه')
  const access = has(q, 'وين|فين|كيف|مكان|افتح|ادخل|رابط|الوصول|احصل')
  const genericResourceNavigation = access && resources && !scopeWords.test(q)
    && q.split(' ').every(word => new RegExp(`^(?:ال|لل|بال|ب|ل)?(?:${resourceForms}|وين|فين|كيف|احصل|القي|الاقي|اجيب|اصل|ادخل|علي|في|من|الي|عن|عندكم|حق|رابط|افتح|الموقع|موقعكم|انا|لي|ممكن|لو|سمحت)$`).test(word))
  if (library && !scopeWords.test(q) || genericResourceNavigation) return make('Library')
  // Academic noun requests retain their academic context, including corrections.
  if (resources || plan || /مستوي|مستويات|الفصل|الترم/.test(q)) return null
  if (siteEntity(q) && /يقدم|تقدم|يوفر|خدمات|اقسام|يحتوي|فيه|يسوي|اهداف|هدف|معلومات|عرف|تعريف|نبذه|عن|اش|ايش|وش/.test(q)) return make('Services')
  if (/^(?:من|مين)\s*(?:نحن|احنا|انتم|انتو)$/.test(q)
    || identityEntity(q) && /من|مين|عرف|تعريف|نبذه|معلومات|اش|ايش|وش|ما|حدثني|احكي|تكلم|هدف/.test(q)) return make('Identity')
  // An entity-only or conversational follow-up reply (e.g. "وطيب و cs") updates the active request before broad major definitions.
  const shortMajor = major && !residual(q)
  if (shortMajor && previous && ['Tracks', 'Major', 'Roadmap', 'LearningCourses'].includes(previous.intent)) return { ...previous, major }
  const majorOnlyQuestion = residual(q).split(' ').every(word => /^(?:ال)?(?:|فرق|مقارنه|بين|ساعات|ساعه|معتمده|دراسيه|مده|دراسه|معلومات|عرفني|برنامج|بكالوريوس)$/.test(word))
  if (major && majorOnlyQuestion && /تخصص|علوم|تقنيه|تكنولوجيا|ساعات|ساعه|فرق|مقارنه|ماهو|ما هو|ماهي|ما هي|عرف|معلومات/.test(q)) return make('Major', { major })
  return null
}
/** Replays legacy turns and validates persisted site snapshots, including truncated chats. */
export function reconstructSiteState(history: { author: 'student' | 'assistant'; text: string; siteState?: SiteConversationState | null }[]): SiteConversationState | null {
  let state: SiteConversationState | null = null
  for (const turn of history) {
    if (turn.author === 'student') state = inferAssistantIntent(turn.text, state)
    else if (turn.siteState === null) state = null
    else if (validState(turn.siteState)) state = { ...turn.siteState }
  }
  return state
}
