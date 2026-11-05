/**
 * Tech Elite: optional academic scope and contextual intent routing.
 * This module does not call an AI provider, create links, or spend a quota.
 * Keep general questions in the existing AI path by returning null.
 */
import { courses, type Course } from './data'
import { csAllCourses } from './cs-plan-data'
import { getAllCourseResources } from './telegram-materials'
import { normalizeAcademic } from './site-assistant-knowledge'
import { findSmartAcademicAnswer, type SmartAnswer } from './smart-academic-search'

export type AcademicScope = {
  major: 'all' | 'IT' | 'CS'
  year: 'all' | 1 | 2 | 3 | 4
  semester: 'all' | 1 | 2
}
export const DEFAULT_SCOPE: AcademicScope = { major: 'all', year: 'all', semester: 'all' }
type Entry = { course: Course; major: 'IT' | 'CS' }
const entries: Entry[] = [
  ...courses.map(course => ({ course, major: 'IT' as const })),
  ...csAllCourses.map(course => ({ course, major: 'CS' as const })),
]
export type AcademicContext = { previousCourseId?: string; previousMajor?: 'IT' | 'CS' }
export type ContextualResult = { answer: SmartAnswer | null; context: AcademicContext; intent: string }

const norm = (value: string) => normalizeAcademic(value)
  .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
  .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
  .replace(/[؟?!،,.]/g, ' ').replace(/\s+/g, ' ').trim()

const resourceWords = /ملزم|ملازم|محاضر|محاضره|ملف|ملفات|سلايد|مذكر|pdf|تحميل|تنزيل|رابط|ارسل|هات|جيب|نموذج|ملخص/
const practicalWords = /عملي|تطبيقي|تطبيق|لاب|مختبر|نظري/
const continuationWords = /(?:^|\s)(?:لها|له|فيها|فيه|حقها|حقه|منها|منه|عندها|عنده|نفسها|نفسه|الماده|المقرر|الاولى|الثانيه|بعده|بعدها)(?:\s|$)/
const availabilityWords = /(?:هل|في|يوجد|موجود|عندكم|معها|لها|له|متوفر|متاح)/
const explainWords = /^(?:اشرح|فهمني|علمني|وضح|فسر|ليش|لماذا|كيف|ما الفرق|قارن|اكتب كود|حل)/
const majorInText = (q: string): 'IT' | 'CS' | undefined => {
  if (/\bcs\b|علوم الحاسوب|علوم الحاسب/.test(q)) return 'CS'
  if (/\bit\b|تقنيه المعلومات|تكنولوجيا المعلومات/.test(q)) return 'IT'
  return undefined
}
const yearInText = (q: string): number | undefined => {
  const hit = q.match(/(?:المستوى|مستوى|مستوي|السنه|السنة|level)\s*(?:ال)?(1|2|3|4|اول|ثاني|ثالث|رابع)/)
  if (!hit) return undefined
  return ({اول:1,ثاني:2,ثالث:3,رابع:4} as Record<string,number>)[hit[1]] || Number(hit[1])
}
const semesterInText = (q: string): number | undefined => {
  const hit = q.match(/(?:الفصل|فصل|ترم|الترم|semester)\s*(?:ال)?(1|2|اول|ثاني)/)
  if (!hit) return undefined
  return ({اول:1,ثاني:2} as Record<string,number>)[hit[1]] || Number(hit[1])
}
const explicitCourse = (q: string): Entry[] => entries.filter(({course}) => {
  const name = norm(course.name)
  return name.length > 3 && q.includes(name)
})
const label = (e: Entry) => `${e.course.name} (${e.major}، المستوى ${e.course.year}، الفصل ${e.course.semester})`
const matchesScope = (e: Entry, scope: AcademicScope) =>
  (scope.major === 'all' || e.major === scope.major) &&
  (scope.year === 'all' || e.course.year === scope.year) &&
  (scope.semester === 'all' || e.course.semester === scope.semester)
const resourceKind = (q: string) => /عملي|تطبيقي|لاب|مختبر/.test(q) ? 'عملي' : /نظري/.test(q) ? 'نظري' : undefined

/**
 * Priority: explicit wording > selected scope > previous course.
 * If ambiguous, ask instead of fabricating. Do not intercept general AI queries.
 * The result must still be displayed by the existing assistant renderer.
 */
export function routeAcademicQuestion(
  question: string,
  scope: AcademicScope = DEFAULT_SCOPE,
  context: AcademicContext = {},
): ContextualResult {
  const q = norm(question)
  if (!q) return { answer: null, context, intent: 'empty' }
  const major = majorInText(q)
  const year = yearInText(q)
  const semester = semesterInText(q)
  const explicitlyNamed = explicitCourse(q).filter(e =>
    (major === undefined || e.major === major) &&
    (year === undefined || e.course.year === year) &&
    (semester === undefined || e.course.semester === semester))

  // A selected scope is a *preference*; never block an explicit, conflicting request.
  const scoped = explicitlyNamed.length > 0
    ? explicitlyNamed
    : entries.filter(e => matchesScope(e, {
        major: major || scope.major,
        year: (year as AcademicScope['year']) || scope.year,
        semester: (semester as AcademicScope['semester']) || scope.semester,
      }))
  const prior = context.previousCourseId
    ? entries.filter(e => e.course.id === context.previousCourseId &&
        (!context.previousMajor || e.major === context.previousMajor))
    : []
  const reference = explicitlyNamed.length ? explicitlyNamed
    : continuationWords.test(q) && prior.length ? prior
    : []

  // Specific follow-up: "هل لها عملي أو نظري؟" is about the last subject, not navigating to IT.
  if (practicalWords.test(q) && availabilityWords.test(q) && !explainWords.test(q)) {
    const target = reference.length ? reference : scoped
    if (target.length === 1) {
      const e = target[0]
      const data = getAllCourseResources(e.course)
      const practical = data.filter(r => /عملي|تطبيقي|مختبر|لاب/.test(norm(r.kind+' '+r.title)))
      const theoretical = data.filter(r => /نظري/.test(norm(r.kind+' '+r.title)))
      const requested = resourceKind(q)
      const practicalMessage = practical.length
        ? `يوجد ${practical.length} مورد/موارد مصنّفة عملي في المكتبة.`
        : 'لم أجد موارد مصنّفة عملي في المكتبة حاليًا.'
      const theoryMessage = theoretical.length
        ? `يوجد ${theoretical.length} مورد/موارد مصنّفة نظري في المكتبة.`
        : 'لم أجد موارد مصنّفة نظري في المكتبة حاليًا.'
      const text = `بالنسبة إلى «${e.course.name}» (${e.major}):\n${requested==='عملي' ? practicalMessage : requested==='نظري' ? theoryMessage : practicalMessage+'\n'+theoryMessage}\n\nتنبيه: هذا يصف الملفات المسجلة في مكتبة Tech Elite فقط، ولا يثبت أن المقرر يحتوي أو لا يحتوي جزءًا عمليًا رسميًا. راجع الخطة أو توصيف المقرر للتأكد.`
      return { answer: {
        text, destination: 'library', button: 'المكتبة', courseId: e.course.id,
        followups: [`ملازم عملي ${e.course.name} ${e.major}`, `ملازم نظري ${e.course.name} ${e.major}`],
      }, context: { previousCourseId: e.course.id, previousMajor: e.major }, intent: 'resource-availability' }
    }
    if (!reference.length && !explicitlyNamed.length && scope.major === 'all' && scope.year === 'all' && scope.semester === 'all') {
      return {answer: {text:'أي مادة تقصد؟ اكتب اسم المقرر، أو اختر التخصص والمستوى والفصل لتضييق البحث دون تقييد بقية الأسئلة.'},context,intent:'clarify-course'}
    }
    if (target.length > 1 && target.length <= 12) return {
      answer: {text:`وجدت أكثر من مادة محتملة. حدد المقرر:\n${target.slice(0,8).map(e=>'• '+label(e)).join('\n')}`,
        followups:target.slice(0,4).map(e=>`هل يوجد عملي في ${e.course.name} ${e.major}؟`)},
      context, intent:'clarify-course',
    }
    return {answer:{text:'حدد اسم المقرر الذي تريد معرفة موارده العملية والنظرية، وسأتحقق من المكتبة.'},context,intent:'clarify-course'}
  }

  // Explicit course names should win over scope. Reuse the mature academic search for real links.
  if (explicitlyNamed.length === 1) {
    const e = explicitlyNamed[0]
    const answer = findSmartAcademicAnswer(question, e.course.id)
    return {answer, context:{previousCourseId:e.course.id,previousMajor:e.major},intent:'named-course'}
  }

  // If a previous subject exists and the student asks for its files, preserve context.
  if (resourceWords.test(q) && reference.length === 1) {
    const e = reference[0]
    const answer = findSmartAcademicAnswer(question, e.course.id)
    return {answer,context:{previousCourseId:e.course.id,previousMajor:e.major},intent:'resource-followup'}
  }

  // General technical questions (Flutter, APIs, debugging, concepts) go straight to AI.
  if (explainWords.test(q) && !resourceWords.test(q))
    return {answer:null,context,intent:'open-ai'}

  // For generic academic queries, prepend only optional missing qualifiers.
  // Don't force a scope on explicit user requests and never spend quota to search site data.
  const academic = /مقرر|ماده|مواد|مقررات|خطة|خطه|ملازم|ملزمه|محاضر|المكتبه|مكتبه|ملف|سلايد/.test(q)
  if (academic) {
    const add = [major ? '' : scope.major === 'all' ? '' : scope.major,
      year ? '' : scope.year === 'all' ? '' : `المستوى ${scope.year}`,
      semester ? '' : scope.semester === 'all' ? '' : `الفصل ${scope.semester}`]
      .filter(Boolean).join(' ')
    const answer = findSmartAcademicAnswer(`${question} ${add}`.trim(), context.previousCourseId)
    if (answer) return {answer,context: answer.courseId
      ? {previousCourseId:answer.courseId,previousMajor: major || context.previousMajor}
      : context,intent:'site-academic'}
  }
  return {answer:null,context,intent:'open-ai'}
}
