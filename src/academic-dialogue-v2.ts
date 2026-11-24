/** One reducer owns academic intent, slots, clarifications and verified results.
 * Replays legacy turns and resumes versioned snapshots from saved chat messages.
 * This module never calls AI, fabricates files or copies site curriculum data.
 */
import { inferAssistantIntent } from './assistant-intent'
import { courses, type Course } from './data'
import { csAllCourses } from './cs-plan-data'
import { normalizeAcademic } from './site-assistant-knowledge'
import { resolveAcademicCourses, getCourseResourceGroup, type SmartAnswer } from './smart-academic-search'
import type { AcademicScope } from './academic-intent'
import type { AcademicConversationState as State, AcademicTurn, CourseReference, Major, Level, Semester, Range } from './academic-conversation-state'

type Entry = { course: Course; major: Major }
const catalog: Entry[] = [...courses.map(course => ({course, major:'IT' as const})), ...csAllCourses.map(course => ({course, major:'CS' as const}))]
const norm = (s: string) => normalizeAcademic(s)
  .replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x6f0))
  .replace(/(^|\s)و(?=\s|ال|it\b|cs\b)/g,'$1').replace(/\s+/g,' ').trim()
const ordinals: Record<string,number> = {اول:1,اولي:1,واحد:1,ثاني:2,ثانيه:2,تاني:2,ثالث:3,ثالثه:3,رابع:4,رابعه:4,خامس:5,خامسه:5,سادس:6,سادسه:6,سابع:7,سابعه:7,ثامن:8,ثامنه:8,تاسع:9,تاسعه:9,عاشر:10,عاشره:10}
const numberWord = (s: string) => ordinals[s.replace(/^ال/,'')] || (/^\d+$/.test(s) ? Number(s) : undefined)
const numberPattern = '(?:\\d{1,3}|اول(?:ي)?|ثاني(?:ه)?|تاني|ثالث(?:ه)?|رابع(?:ه)?|خامس(?:ه)?|سادس(?:ه)?|سابع(?:ه)?|ثامن(?:ه)?|تاسع(?:ه)?|عاشر(?:ه)?)'
const after = (q:string,unit:string) => {
  const noun=unit.replace(/ه(?=\||$)/g,'(?:ه|ت(?=ها|هم|هن|نا|كم|ه))')
  const m=q.match(new RegExp(`(?:^|\\s)(?:ال)?(?:${noun})(?:ها|هم|هن|نا|كم|ه)?\\s*(?:رقم\\s*)?(?:ال)?(${numberPattern})(?=\\s|$)`))
  return m ? numberWord(m[1]) : undefined
}
const planWords = (q:string) => /(?:^|\s)(?:مواد|المواد|مقررات|المقررات|خطه|الخطه|خطة|جدول)(?=\s|$)/.test(q)
const courseMarker = (q:string) => /(?:^|\s)(?:ماده|الماده|مقرر|المقرر)(?=\s|$)/.test(q)
const resourceWords = (q:string) => /ملزم|ملازم|محاضر|محاضره|ملف|pdf|تحميل|تنزيل|رابط|روابط|سلايد|شرائح|مذكر|ملخص|تلخيص|مراجع|مراجعه|نموذج|نماذج|امتحان|اختبار|اسئله|اسئلة|نهائي|نصفي|ميد|فاينل|كويز|عملي|نظري|مترجم|ترجمه|تطبيقي|لاب|معمل|مصدر|مصادر|مرجع|فيديو|برنامج|برامج|شروحات|توثيق/.test(q)
const referenceWords = (q:string) => /فيهن|فيهم|منهن|منهم|ايهن|ايهم|عددهن|عددهم|عددها|حقهم|حقهن|حقها|اعرضها|ارسلها|هاتها|اشرحها|اشرحهن|لها|له|نفسها|نفسه|هذي|هذه|هذولا|ذكرتها|المواد|المقررات|(?:مواد|مقررات)(?:ها|هم|هن)/.test(q)
export const needsAcademicReasoning = (question:string) => { const nq = norm(question); if (/اشرح|شرح|فسر|فهمني|علمني|وضح|قارن|مقارنه|الفرق|فرق\s+بين|اصعب|اسهل|افضل|لماذا|ليش/.test(nq)) return true; if (/كيف/.test(nq) && !resourceWords(nq)) return true; if (/^(?:ما\s*هي|ما\s*هو|ماهي|ماهو|اذكر|عرف|من\s*هو|من\s*هي|تحدث|تكلم)/.test(nq) && !resourceWords(nq) && !planWords(nq) && !courseMarker(nq) && !/(?:ساعات|رمز|كود|مستوي|فصل|ترم)/.test(nq)) return true; return false }
const countWords = (q:string) => /(?:^|\s)(?:كم|عدد|اجمالي|مجموع|احسب|عددها|عددهم|عددهن)(?=\s|$)/.test(q)
const listWords = (q:string) => /(?:^|\s)(?:اعرضها|ارسلها|هاتها|اسماءها|اساميها|اسامي|اسماء|قائمه)(?=\s|$)/.test(q)
const termName = (s:number) => s === 1 ? 'الأول' : 'الثاني'
const ref = (e:Entry):CourseReference => ({courseId:e.course.id,courseName:e.course.name,major:e.major,year:e.course.year,semester:e.course.semester})
const entryFor = (r:CourseReference|null|undefined) => r && typeof r==='object' ? catalog.find(e=>e.major===r.major && e.course.id===r.courseId) : undefined
const rangeLabel = (s:State) => `${s.major==='ALL'?'IT وCS':s.major || 'التخصص غير المحدد'}، ${s.level==='ALL'?'جميع المستويات':`المستوى ${s.level}`}${s.semester && s.semester!=='ALL'?`، الفصل ${termName(s.semester)}`:''}`

type Entities = { major?:Range<Major>; level?:Range<Level>; semester?:Range<Semester>; lectureNumber?:number; bareNumber?:number; resourceType?:State['resourceType'] }
function entities(q:string):Entities {
  const it=/(?:^|\s)it(?=\s|$)|تقنيه المعلومات|تكنولوجيا المعلومات/.test(q)
  const cs=/(?:^|\s)cs(?=\s|$)|علوم الحاسب|علوم الحاسوب/.test(q)
  const allMajors=it&&cs || /(?:كلا|كلي|كل|جميع)\s*التخصصين|التخصصين\s*(?:معا|كلهم)|جميع التخصصات|كل التخصصات/.test(q)
  const allLevels=/(?:جميع|كل|كافه)\s*(?:ال)?(?:مستويات|المستويات)|(?:المستويات|مستويات)\s*(?:كلها|جميعها)|من\s*(?:ال)?(?:اول|1)\s*(?:الي|الى|ل|حتي)\s*(?:ال)?(?:رابع|4)/.test(q)
  const allTerms=/(?:جميع|كل|كافه)\s*(?:ال)?(?:فصول|ترمات)|(?:الفصول|الفصلين|الترمين|الفصلان|الترمان)(?:\s*(?:كلها|جميعها|مع بعض))?|(?:الفصل|الترم)\s*الاول\s*(?:و\s*)?الثاني/.test(q)
  const y=after(q,'مستوي|مستوا|مستو|سنه|level|year') ?? (planWords(q) ? after(q,'مواد|مقررات') : undefined)
  const t=after(q,'فصل|ترم|سمستر|semester|term')
  const lecture=after(q,'محاضره|محاضرات|ملزمه|ملف|سلايد')
  const stripped=q.replace(/^(?:(?:طيب|طب|تمام|زين|اوكي|ايوه|ايوا|عادي|بس|لكن|عاد|يعني|اقصد|لك|انا|اريد|ابي|ابغي|ابغا|ارسل|ارسلي|جب|جيب|جيبلي|هات|هاتلي|عطني|اعطني|اعطيني|وين|و)\s*)+/,'').replace(/\s*(?:بس|فقط)$/,'').trim()
  const bareNumber=numberWord(stripped)
  return {
    major:allMajors?'ALL':it?'IT':cs?'CS':undefined,
    level:allLevels?'ALL':y && y<=4 ? y as Level : undefined,
    semester:allTerms?'ALL':t && t<=2 ? t as Semester : undefined,
    lectureNumber:lecture,
    bareNumber,
    resourceType:/(?:كل|جميع|كافه)\s*(?:ال)?(?:ملفات|المصادر|شي|شيء)/.test(q)?'all':/مصدر|مصادر|مرجع|مراجع|توثيق|فيديو|برنامج|برامج|شروحات/.test(q)?'learning':/مترجم|ترجمه/.test(q)?'translated':/عملي|تطبيقي|لاب|معمل/.test(q)?'practical':/نظري/.test(q)?'theory':/ملخص|تلخيص|مراجعه|مراجعات/.test(q)?'summary':/اختبار|امتحان|نموذج|نماذج|اسئله|اسئلة|نهائي|نصفي|ميد|فاينل|كويز/.test(q)?'exam':/محاضر|محاضره/.test(q)?'lecture':/ملزم|ملازم|سلايد|شرائح|مذكر/.test(q)?'notes':/رابط|روابط/.test(q)?'link':undefined,
  }
}
export function explicitDialogueSlots(question:string) {
  const e=entities(norm(question))
  return {major:e.major,year:e.level,semester:e.semester,bothSemesters:e.semester==='ALL'}
}
function seed(scope:AcademicScope):Pick<State,'major'|'level'|'semester'> {
  return {major:scope.major==='all'?undefined:scope.major,level:scope.year==='all'?undefined:scope.year,semester:scope.semester==='all'?'ALL':scope.semester}
}
function selected(s:State):Entry[] {
  const seen=new Set<string>()
  return catalog.filter(e=>(s.major==='ALL'||e.major===s.major) && (s.level==='ALL'||e.course.year===s.level) && (s.semester==='ALL'||!s.semester||e.course.semester===s.semester))
    .filter(e=>{const key=`${e.major}:${e.course.year}:${e.course.semester}:${e.course.code}:${norm(e.course.name)}`;if(seen.has(key))return false;seen.add(key);return true})
    .sort((a,b)=>a.major===b.major?a.course.year-b.course.year||a.course.semester-b.course.semester:a.major==='IT'?-1:1)
}
function candidates(s:State):Entry[] {
  if(s.course) {const e=entryFor(s.course);return e?[e]:[]}
  return (s.courseCandidates||[]).flatMap(r=>{const e=entryFor(r);return e?[e]:[]})
}
function withResults(s:State):State {
  let pending:State['pendingRequest']
  const sameNamedCourses=s.major==='ALL' && candidates(s).length>0 && new Set(candidates(s).map(e=>norm(e.course.name))).size===1
  if(s.target==='course' && !s.course && !(sameNamedCourses || s.includeAllCourseMatches&&candidates(s).length)) {
    const options=candidates(s)
    pending={intent:s.intent,missing:options.length>1 && new Set(options.map(e=>norm(e.course.name))).size===1 && new Set(options.map(e=>e.major)).size>1?'major':'course',lectureNumber:s.lectureNumber}
  } else if(s.target==='selection') {
    if(!s.level) pending={intent:s.intent,missing:'level'}
    else if(!s.major) pending={intent:s.intent,missing:'major'}
  }
  if(pending) return {...s,pendingRequest:pending}
  const rows=s.target==='course'?candidates(s):selected(s)
  const files=['GetResources','GetLecture','CountResources'].includes(s.intent)
  const resourceCount=files?rows.reduce((n,e)=>n+getCourseResourceGroup(e.course,e.major,resourceQuery(s)).resources.length,0):undefined
  return {...s,pendingRequest:undefined,lastResults:{kind:files?'resources':'courses',courses:rows.map(ref),...(resourceCount!==undefined?{resourceCount}:{})}}
}
function resourceQuery(s:State):string {
  const kinds:Record<NonNullable<State['resourceType']>,string>={lecture:'نظري',notes:'نظري',summary:'ملخص',exam:'اختبار',practical:'عملي',theory:'نظري',translated:'مترجمه',learning:'مصادر تعلم',link:'نظري',all:'كل الملفات'}
  return `${s.resourceType?kinds[s.resourceType]:'ملازم'} ${s.lectureNumber!==undefined?`المحاضرة ${s.lectureNumber}`:''}`
}
/** Apply entities to the existing request; clarifications do not become new intents. */
function transition(question:string, previous:State|null, scope:AcademicScope):{state:State|null;handled:boolean} {
  const q=norm(question)
  if(!q) return {state:previous,handled:false}
  // A domain change also clears replayed legacy academic state.
  if(inferAssistantIntent(question)) return {state:null,handled:false}
  const e=entities(q)
  if(needsAcademicReasoning(q)) {
    const referential=previous && (referenceWords(q) || !!resolveAcademicCourses(question).matches.length)
    return {state:referential?previous:null,handled:false}
  }
  const found=resolveAcademicCourses(question,{major:e.major,year:e.level,semester:e.semester})
  const explicitPlan=planWords(q)
  const explicitResources=resourceWords(q)
  const explicitDetails=/(?:تفاصيل|ساعات|الساعات|رمز|كود|معلومات)\s*(?:الماده|المقرر)|(?:^|\s)(?:ساعات|الساعات|رمز|كود)(?=\s|$)/.test(q)
  const hasSlots=e.major!==undefined || e.level!==undefined || e.semester!==undefined
  const hasCourse=found.matches.length>0 && !explicitPlan
  const isNumber=e.bareNumber!==undefined
  const follows=!!previous && (hasSlots || isNumber || e.resourceType!==undefined || referenceWords(q) || listWords(q) || (previous.pendingRequest?.missing==='course' && found.hasSubject) || hasCourse)
  const starts=explicitPlan || explicitResources || hasCourse || (courseMarker(q) && found.hasSubject) || (e.level!==undefined && /اعرض|عطني|كم|عدد|هات/.test(q))
  if(!starts&&!follows) return {state:null,handled:false}
  let s:State={...(previous||{version:1,...seed(scope),intent:'ListCourses',target:'selection'}),pendingRequest:undefined}
  const priorResource=previous && ['GetResources','GetLecture','CountResources'].includes(previous.intent)
  const lectureNumber=e.lectureNumber ?? (isNumber && priorResource && previous?.pendingRequest?.missing!=='level' ? e.bareNumber : undefined)
  const allFiles=/(?:كل|جميع|كافه)\s*(?:ال)?(?:محاضرات|ملازم|ملفات|روابط)/.test(q)
  const pendingLecture=previous?.pendingRequest && previous.intent==='GetLecture' && !allFiles
  const pendingChoice=previous?.pendingRequest?.missing==='course' && previous.courseCandidates?.length && isNumber && !explicitResources ? previous.courseCandidates[e.bareNumber!-1] : undefined
  // Explicit intent changes take priority; a bare course/major reply keeps a pending lecture.
  if(explicitDetails) s.intent='CourseDetails'
  else if(countWords(q)) s.intent=priorResource&&!explicitPlan?'CountResources':'CountCourses'
  else if(explicitPlan&&!explicitResources) s.intent='ListCourses'
  else if(explicitResources) s.intent=lectureNumber!==undefined||pendingLecture?'GetLecture':'GetResources'
  else if(lectureNumber!==undefined && priorResource && !pendingChoice) s.intent='GetLecture'
  else if(listWords(q) && s.intent==='CountCourses') s.intent='ListCourses'
  else if(hasCourse && !priorResource && !previous?.pendingRequest) s.intent='CourseDetails'
  const scopeOnly=e.level!==undefined || e.semester!==undefined
  if(explicitPlan || (scopeOnly && explicitResources && !hasCourse)) {
    s={...s,target:'selection',course:undefined,courseQuery:undefined,courseCandidates:undefined,includeAllCourseMatches:undefined}
  }
  if(e.major!==undefined) s.major=e.major
  if(e.level!==undefined) {
    if(e.semester===undefined && (e.level!==s.level || explicitPlan || hasCourse || e.level==='ALL')) s.semester='ALL'
    s.level=e.level
  }
  if(e.semester!==undefined) s.semester=e.semester
  if(isNumber && previous?.pendingRequest?.missing==='level' && e.bareNumber!<=4) s.level=e.bareNumber as Level
  else if(isNumber && !priorResource && previous?.semester && e.bareNumber!<=2) s.semester=e.bareNumber as Semester
  if(e.resourceType!==undefined) s.resourceType=e.resourceType
  else if(hasCourse && explicitResources) s.resourceType='notes'
  if(lectureNumber!==undefined && !pendingChoice) {s.lectureNumber=lectureNumber;s.resourceType=e.resourceType||s.resourceType||'lecture'}
  else if(explicitResources && (!previous?.pendingRequest || allFiles)) s.lectureNumber=undefined
  if(explicitPlan && !explicitResources) {s.lectureNumber=undefined;s.resourceType=undefined}
  if(pendingChoice) {
    s={...s,course:pendingChoice,courseQuery:pendingChoice.courseName,target:'course',major:pendingChoice.major,level:pendingChoice.year as Level,semester:pendingChoice.semester}
  } else if(hasCourse || (explicitResources&&found.hasSubject) || (courseMarker(q)&&found.hasSubject) || (previous?.pendingRequest?.missing==='course' && found.hasSubject && !hasSlots && !isNumber)) {
    s={...s,target:'course',course:undefined,courseQuery:found.matches.length && new Set(found.matches.map(x=>norm(x.course.name))).size===1 ? found.matches[0].course.name : question.slice(0,350),courseCandidates:found.matches.map(ref),includeAllCourseMatches:e.level==='ALL'||e.semester==='ALL'}
  } else if(explicitResources && s.target!=='course' && (!s.level || e.lectureNumber!==undefined&&!scopeOnly&&!explicitPlan)) {
    s={...s,target:'course',course:undefined,courseQuery:undefined,courseCandidates:undefined,includeAllCourseMatches:undefined}
  }
  if(s.target==='course' && !pendingChoice) {
    if(e.level==='ALL'||e.semester==='ALL') {s.includeAllCourseMatches=true;s.course=undefined}
    if(e.level==='ALL'&&s.courseQuery&&!hasCourse) s.courseQuery=s.courseQuery.replace(/\s+\d+$/,'')
    let options=hasCourse?found.matches:s.courseQuery?resolveAcademicCourses(s.courseQuery,{major:s.major,year:'ALL',semester:'ALL'}).matches:candidates(s)
    // Only explicitly named level/semester constrain a new course. Old plan scopes do not.
    if(s.major && s.major!=='ALL') options=options.filter(x=>x.major===s.major)
    if(e.level!==undefined&&e.level!=='ALL') options=options.filter(x=>x.course.year===e.level)
    if(e.semester!==undefined&&e.semester!=='ALL') options=options.filter(x=>x.course.semester===e.semester)
    if(options.length>1 && !hasCourse && !hasSlots && s.course) options=options.filter(x=>x.course.id===s.course!.courseId&&x.major===s.course!.major)
    if(options.length>1 && e.level===undefined && e.semester===undefined && !s.includeAllCourseMatches && previous?.level && previous.level!=='ALL' && options.some(x=>x.course.year===previous.level)) options=options.filter(x=>x.course.year===previous.level)
    if(options.length>1 && e.level===undefined && e.semester===undefined && !s.includeAllCourseMatches && previous?.semester && previous.semester!=='ALL' && options.some(x=>x.course.semester===previous.semester)) options=options.filter(x=>x.course.semester===previous.semester)
    if(options.length>1 && e.level===undefined && !s.includeAllCourseMatches && scope.year!=='all' && options.some(x=>x.course.year===scope.year)) options=options.filter(x=>x.course.year===scope.year)
    if(options.length>1 && e.semester===undefined && e.level!=='ALL' && !s.includeAllCourseMatches && scope.semester!=='all' && options.some(x=>x.course.semester===scope.semester)) options=options.filter(x=>x.course.semester===scope.semester)
    s.courseCandidates=options.map(ref)
    if(options.length===1 && !s.includeAllCourseMatches && s.major!=='ALL') {
      const only=ref(options[0]);s={...s,course:only,major:only.major,level:only.year as Level,semester:only.semester}
    } else {
      s.course=undefined
      if((s.major==='ALL'||s.includeAllCourseMatches) && options.length) {
        if(s.level!=='ALL') s.level=new Set(options.map(x=>x.course.year)).size===1?options[0].course.year as Level:'ALL'
        if(s.semester!=='ALL') s.semester=new Set(options.map(x=>x.course.semester)).size===1?options[0].course.semester:'ALL'
      }
    }
  }
  return {state:withResults(s),handled:true}
}
function validSnapshot(value:unknown):value is State {
  if(!value||typeof value!=='object')return false
  const s=value as State
  const intents=['ListCourses','CountCourses','GetResources','GetLecture','CountResources','CourseDetails']
  const reference=(r:CourseReference|null|undefined) => {
    const entry=entryFor(r)
    return !!entry && !!r && r.courseName===entry.course.name && r.year===entry.course.year && r.semester===entry.course.semester
  }
  const references=(v:unknown) => Array.isArray(v)&&v.every(reference)
  return s.version===1 && intents.includes(s.intent) && ['selection','course'].includes(s.target)
    && (s.major===undefined||['IT','CS','ALL'].includes(s.major))
    && (s.level===undefined||[1,2,3,4,'ALL'].includes(s.level)) && (s.semester===undefined||[1,2,'ALL'].includes(s.semester))
    && (s.lectureNumber===undefined||Number.isInteger(s.lectureNumber)&&s.lectureNumber>0)
    && (s.courseQuery===undefined||typeof s.courseQuery==='string'&&s.courseQuery.length<=350)
    && (s.includeAllCourseMatches===undefined||typeof s.includeAllCourseMatches==='boolean')
    && (s.resourceType===undefined||['lecture','notes','summary','exam','practical','theory','translated','learning','link','all'].includes(s.resourceType))
    && (s.course===undefined||reference(s.course)) && (s.courseCandidates===undefined||references(s.courseCandidates))
    && (s.pendingRequest===undefined||!!s.pendingRequest&&typeof s.pendingRequest==='object'&&intents.includes(s.pendingRequest.intent)&&['major','level','course'].includes(s.pendingRequest.missing))
    && (s.lastResults===undefined||!!s.lastResults&&typeof s.lastResults==='object'&&['courses','resources'].includes(s.lastResults.kind)&&references(s.lastResults.courses))
}
/** A snapshot keeps context when the UI's retained message window drops older turns. */
export function reconstructAcademicState(history:AcademicTurn[],scope:AcademicScope):State|null {
  let state:State|null=null,start=0
  for(let i=history.length-1;i>=0;i--) {
    if(history[i].author==='assistant' && history[i].academicState===null) {state=null;start=i+1;break}
    if(history[i].author==='assistant' && validSnapshot(history[i].academicState)) {state=structuredClone(history[i].academicState!);start=i+1;break}
  }
  for(const turn of history.slice(start)) if(turn.author==='student') state=transition(turn.text,state,scope).state
  return state
}
function planAnswer(s:State):SmartAnswer {
  const rows=selected(s)
  const majors:Major[]=s.major==='ALL'?['IT','CS']:[s.major as Major]
  const levels:Level[]=s.level==='ALL'?[1,2,3,4]:[s.level as Level]
  const terms:Semester[]=s.semester==='ALL'||!s.semester?[1,2]:[s.semester]
  const sections=majors.flatMap(major=>levels.map(level=>{
    const parts=terms.map(term=>{
      const items=rows.filter(x=>x.major===major&&x.course.year===level&&x.course.semester===term)
      return `الفصل ${termName(term)}: ${items.length} مقررات مسجلة${s.intent==='CountCourses'||!items.length?'':`\n${items.map((x,i)=>`${i+1}. ${x.course.name}${x.course.code?` (${x.course.code})`:''}`).join('\n')}`}`
    }).join('\n\n')
    return `${majors.length>1?`${major} — `:''}${levels.length>1?`المستوى ${level}:\n`:''}${parts}`
  }))
  return {text:`خطة ${rangeLabel(s)}:\n${sections.join('\n\n')}${majors.length*levels.length*terms.length>1?`\n\nالإجمالي: ${rows.length} مقررات مسجلة.`:''}\n\nالمصدر: بيانات خطة Tech Elite. قد تتضمن الأعداد مقررات اختيارية معروضة؛ العدد ليس بالضرورة عدد المواد الإلزامية.`,destination:'plan',button:'عرض الخطة',followups:terms.length===2?['الفصل الأول فقط','الفصل الثاني فقط']:['جميع الفصول']}
}
function clarify(s:State):SmartAnswer {
  const missing=s.pendingRequest!.missing
  if(missing==='level')return {text:'حدد المستوى الدراسي (الأول أو الثاني أو الثالث أو الرابع)، أو اطلب جميع المستويات.',destination:'plan',button:'فتح الخطة',followups:['جميع المستويات']}
  if(missing==='major')return {text:s.target==='course'?`وجدت «${s.courseCandidates?.[0]?.courseName || 'المقرر'}» في IT وCS. أي تخصص تقصد: IT أو CS؟`:`تقصد ${s.level==='ALL'?'جميع المستويات':`المستوى ${s.level}`} في IT أو CS؟`,followups:['IT','CS'],destination:s.target==='course'?'library':'plan',button:'فتح القسم'}
  const options=candidates(s)
  if(options.length)return {text:`وجدت أكثر من مقرر قريب. أي مقرر تقصد؟\n${options.map(x=>`${x.course.name} (${x.major}، المستوى ${x.course.year}، الفصل ${x.course.semester})`).join('\n')}`,followups:options.slice(0,4).map(x=>`${x.course.name} ${x.major}`),destination:'library',button:'المكتبة'}
  return {text:s.courseQuery?`لم أجد مقررًا يطابق «${s.courseQuery}» ضمن النطاق المحدد. اكتب اسم المادة أو رمزها لأكمل طلبك${s.lectureNumber?` للمحاضرة رقم ${s.lectureNumber}`:''}.`:`لأي مادة تريد ${s.lectureNumber?`المحاضرة رقم ${s.lectureNumber}`:'الملفات'}؟ اكتب اسم المادة.`,destination:'library',button:'المكتبة'}
}
function answerState(s:State):SmartAnswer {
  if(s.pendingRequest)return clarify(s)
  if(s.intent==='ListCourses'||s.intent==='CountCourses')return planAnswer(s)
  const rows=s.target==='course'?candidates(s):selected(s)
  if(s.intent==='CourseDetails') {
    return {text:rows.map(({course,major})=>`${course.name} (${major}، المستوى ${course.year}، الفصل ${course.semester})\nالرمز: ${course.code}، الساعات: ${course.creditHours}.\n${course.description}`).join('\n\n'),courseId:rows.length===1?rows[0].course.id:undefined,destination:'plan',button:'الخطة الدراسية'}
  }
  const resourceGroups=rows.map(x=>getCourseResourceGroup(x.course,x.major,resourceQuery(s))).sort((a,b)=>Number(b.resources.length>0)-Number(a.resources.length>0))
  const total=resourceGroups.reduce((n,g)=>n+g.resources.length,0)
  if(s.intent==='CountResources')return {text:`عدد الملفات القابلة للفتح في النتائج الحالية: ${total}.`,courseId:rows.length===1?rows[0].course.id:undefined,destination:'library',button:'المكتبة'}
  const activeType = s.resourceType || 'notes'
  if(s.target==='course'&&rows.length===1&&!s.includeAllCourseMatches) {
    const entry = rows[0]
    const c = entry.course
    const inv = [
      { key: 'theory', label: 'ملازم النظري', prompt: 'عطني النظري', count: getCourseResourceGroup(c, entry.major, 'نظري').resources.length },
      { key: 'practical', label: 'ملازم العملي', prompt: 'عطني العملي', count: getCourseResourceGroup(c, entry.major, 'عملي').resources.length },
      { key: 'translated', label: 'الملازم المترجمة', prompt: 'عطني الملازم المترجمة', count: getCourseResourceGroup(c, entry.major, 'مترجمه').resources.length },
      { key: 'exam', label: 'النماذج والاختبارات', prompt: 'عطني النماذج', count: getCourseResourceGroup(c, entry.major, 'اختبار').resources.length },
      { key: 'summary', label: 'الملخصات', prompt: 'عطني الملخصات', count: getCourseResourceGroup(c, entry.major, 'ملخص').resources.length },
      { key: 'learning', label: 'مصادر التعلم', prompt: 'عطني مصادر التعلم', count: getCourseResourceGroup(c, entry.major, 'مصادر تعلم').resources.length },
    ]
    const normActive = ['notes','lecture','link','theory'].includes(activeType) ? 'theory' : activeType
    const availableOthers = inv.filter(x => x.key !== normActive && x.count > 0)
    if (!total) {
      let msg = ''
      if (s.lectureNumber) {
        msg = `لا توجد المحاضرة رقم ${s.lectureNumber} مسجلة لمقرر «${c.name}» حاليًا.`
      } else if (normActive === 'practical') {
        msg = c.hasPractical === false
          ? `مقرر «${c.name}» مادة نظرية فقط ولا يوجد لها جزء عملي في الخطة الدراسية.`
          : `مقرر «${c.name}» له جزء عملي، لكن لا توجد ملازم عملي مرفوعة له في المكتبة حاليًا.`
      } else if (normActive === 'theory') {
        msg = c.hasTheory === false
          ? `مقرر «${c.name}» مادة عملية/تطبيقية ولا توجد لها ملازم نظري.`
          : `لا توجد ملازم نظري مرفوعة لمقرر «${c.name}» في المكتبة حاليًا.`
      } else if (normActive === 'translated') {
        msg = `لا توجد ملازم مترجمة مسجلة لمقرر «${c.name}» حاليًا.`
      } else if (normActive === 'exam') {
        msg = `لا توجد نماذج اختبارات مسجلة لمقرر «${c.name}» حاليًا.`
      } else if (normActive === 'summary') {
        msg = `لا توجد ملخصات مسجلة لمقرر «${c.name}» حاليًا.`
      } else if (normActive === 'learning') {
        msg = `لا توجد مصادر تعلم مسجلة لمقرر «${c.name}» حاليًا.`
      } else {
        msg = `لا توجد ملفات مسجلة لمقرر «${c.name}» حاليًا.`
      }
      if (availableOthers.length) {
        msg += `\n\nالمتاح حاليًا لهذه المادة: ${availableOthers.map(x => `${x.label} (${x.count})`).join('، ')}. اختر ما تريده من الأزرار أدناه:`
      }
      return {
        text: msg,
        followups: availableOthers.length ? availableOthers.map(x => x.prompt) : ['افتح المكتبة'],
        courseId: c.id,
        destination: 'library',
        button: 'المكتبة',
      }
    }
    const typeLabel = normActive==='translated'?'الملازم المترجمة':normActive==='practical'?'ملازم العملي':normActive==='exam'?'النماذج والاختبارات':normActive==='summary'?'الملخصات':normActive==='learning'?'مصادر التعلم':normActive==='all'?'جميع الملفات والمصادر':'ملازم النظري'
    const followups = availableOthers.length
      ? availableOthers.map(x => x.prompt)
      : inv.filter(x => x.key !== normActive && (x.key !== 'practical' || c.hasPractical !== false)).slice(0, 3).map(x => x.prompt)
    return {
      text: `${typeLabel} لمقرر «${c.name}»:`,
      resourceGroups,
      followups,
      courseId: c.id,
      destination: 'library',
      button: 'المكتبة',
    }
  }
  return {text:`الملازم المسجلة لـ ${rangeLabel(s)}:`,resourceGroups,courseId:rows.length===1?rows[0].course.id:undefined,destination:'library',button:'المكتبة'}
}
export function routeAcademicDialogue(question:string,history:AcademicTurn[],scope:AcademicScope):{answer:SmartAnswer|null;state:State|null} {
  const result=transition(question,reconstructAcademicState(history,scope),scope)
  return {answer:result.handled&&result.state?{...answerState(result.state),academicState:result.state}:null,state:result.state}
}
/** Compatibility entry point for curriculum callers; file requests use the same reducer. */
export function answerAcademicDialogue(question:string,history:AcademicTurn[],scope:AcademicScope):SmartAnswer|null {
  const result=routeAcademicDialogue(question,history,scope)
  return result.answer && result.state && ['ListCourses','CountCourses'].includes(result.state.intent)?result.answer:null
}
export function dialogueSelection(history:AcademicTurn[],scope:AcademicScope) {
  const s=reconstructAcademicState(history,scope)
  return s?{major:s.major,year:s.level,semester:s.semester,intent:s.intent}:null
}
export function academicDialogueContext(question:string,history:AcademicTurn[],scope:AcademicScope):string {
  if(!needsAcademicReasoning(question))return ''
  const previous=reconstructAcademicState(history,scope)
  if(!previous)return ''
  const named=resolveAcademicCourses(question).matches
  if(!referenceWords(norm(question))&&!named.length)return ''
  const rows=named.length?named:(previous.lastResults?.courses||[]).flatMap(r=>{const e=entryFor(r);return e?[e]:[]})
  if(!rows.length)return ''
  return `مرجع من الخطة الدراسية، وليس من PDF: ${rangeLabel(previous)}.\n${rows.map(x=>`${x.course.name} (${x.major}، المستوى ${x.course.year}، الفصل ${x.course.semester})`).join('\n')}`.slice(0,1800)
}
