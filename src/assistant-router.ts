/** Intent selects a site domain before the academic resolver can rank course names. */
import { routeAcademicQuestion } from './academic-intent'
import { routeAcademicDialogue, academicDialogueContext, needsAcademicReasoning } from './academic-dialogue-v2'
import { resolveAcademicCourses, type SmartAnswer } from './smart-academic-search'
import { answerSiteRequest, buildWholeSiteContext } from './site-wide-knowledge'
import { inferAssistantIntent, reconstructSiteState } from './assistant-intent'
import { normalizeAcademic } from './site-assistant-knowledge'
import type { AcademicScope } from './academic-intent'
import type { AcademicTurn } from './academic-conversation-state'

export const needsReasoning = needsAcademicReasoning
export function answerAssistant(question: string, history: AcademicTurn[], scope: AcademicScope): SmartAnswer | null {
  const request = inferAssistantIntent(question, reconstructSiteState(history))
  if (request) return answerSiteRequest(request)
  if (needsReasoning(question) || /(?:اختبار|أسئلة|اسئله).*(?:ميول|اختيار|تحديد).*تخصص/.test(question)) return null
  const result = routeAcademicDialogue(question, history, scope)
  if (result.answer) return { ...result.answer, siteState: null }
  const last = history.at(-1)
  if (/عملي|نظري|ساعات|رمز|كود/.test(question) && last?.author === 'assistant' && last.courseId) {
    const answer = routeAcademicQuestion(question, scope, { previousCourseId: last.courseId }).answer
    if (answer) return { ...answer, siteState: null }
  }
  // Unhandled requests belong to generative reasoning; legacy fallbacks must not reclassify them.
  return null
}
export function assistantContext(question: string, history: AcademicTurn[], scope: AcademicScope): string {
  const recentHistoryText = history.slice(-4).map(turn => turn.text).join(' ')
  return [academicDialogueContext(question, history, scope), buildWholeSiteContext(question, recentHistoryText)].filter(Boolean).join('\n').slice(0, 4500)
}
/** Site-related questions (including follow-ups) stay free and do not consume the 15-question AI quota. */
export function isSiteQuestion(question: string, history: AcademicTurn[], scope: AcademicScope): boolean {
  const q = normalizeAcademic(question)
  if (inferAssistantIntent(question, reconstructSiteState(history))) return true
  if (resolveAcademicCourses(question, { major: scope.major === 'all' ? undefined : scope.major }).matches.length > 0) return true
  if (/tech\s*elite|تيك\s*(?:اليت|ايليت)|دفعه|دفعتنا|الموقع|موقعكم|طلاب|مندوب|مطور|ملزم|ملازم|محاضر|محاضره|نموذج|نماذج|اختبار|امتحان|ملخص|تلخيص|مراجعه|عملي|نظري|مترجم|ترجمه|لاب|مصدر|مصادر|مراجع|تيليجرام|تلجرام|مقرر|مقررات|خطه|مسار|مسارات|لابتوب|مشاريع التخرج|\bit\b|\bcs\b|تقنيه المعلومات|علوم الحاسب|علوم الحاسوب/.test(q)) {
    return true
  }
  const lastAssistant = [...history].reverse().find(turn => turn.author === 'assistant')
  if (lastAssistant && (lastAssistant.courseId || lastAssistant.academicState || lastAssistant.siteState)) {
    return /^(?:طيب|طب|و|ايش|وش|كم|هل|فيه|فيها|يوجد|توجد|ليش|ليه|لماذا|اشرح|وضح|بسط|اريد|ابي|ابغي|ابغا|عطني|اعطني|اعطيني|جيب|جب|هات|اعرض|ارسل|رابط|روابط|مثال|تفاصيل|ساعات|عملي|العملي|نظري|النظري|نماذج|النماذج|ملخص|الملخصات|مصادر|المصادر|مراجع|المراجع|فيهم|فيهن|منهم|منهن|لها|له|الاول|الاولي|الثاني|الثانيه|الثالث|الثالثه|الرابع|الرابعه|الخامس|الخامسه|\d+)/.test(q)
  }
  return false
}
/** Local endpoints are usable only from a local page, never from GitHub Pages. */
export function usableAIEndpoint(endpoint: string, hostname: string): string {
  try {
    const url = new URL(endpoint)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    const localPage = ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    if (url.username || url.password || url.search || url.hash) return ''
    return (url.protocol === 'https:' && (!local || localPage)) || (url.protocol === 'http:' && local && localPage) ? endpoint.replace(/\/$/, '') : ''
  } catch { return '' }
}
