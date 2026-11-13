require('./assistant-source-loader.cjs')
// Run: node tests/academic-conversation-state.test.cjs
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const ts=require('typescript')
const originalJS=require.extensions['.js']
function compile(module,filename){module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename)}
require.extensions['.ts']=compile
require.extensions['.js']=(module,filename)=>filename.startsWith(path.join(process.cwd(),'src')+path.sep)?compile(module,filename):originalJS(module,filename)
const {answerAssistant,assistantContext}=require('../src/assistant-router.ts')
const {courses}=require('../src/data.ts')
const {csAllCourses}=require('../src/cs-plan-data.ts')
const {getAllCourseResources}=require('../src/telegram-materials.ts')
const scope={major:'all',year:'all',semester:'all'}
const catalog=[...courses.map(course=>({course,major:'IT'})),...csAllCourses.map(course=>({course,major:'CS'}))]
const owner=courses.find(course=>course.name==='تنظيم ومعمارية الحاسب')
assert.ok(owner)
const reference=({course,major})=>({courseId:course.id,courseName:course.name,major,year:course.year,semester:course.semester})
function expected(major,level='ALL',semester='ALL'){
 const seen=new Set()
 return catalog.filter(row=>(major==='ALL'||row.major===major)&&(level==='ALL'||row.course.year===level)&&(semester==='ALL'||row.course.semester===semester))
 .filter(({course,major})=>{const key=[major,course.year,course.semester,course.code,course.name].join(':');if(seen.has(key))return false;seen.add(key);return true})
 .sort((a,b)=>a.major===b.major?a.course.year-b.course.year||a.course.semester-b.course.semester:a.major==='IT'?-1:1).map(reference)
}
function conversation(initial=[]){const history=JSON.parse(JSON.stringify(initial));return {history,ask(text){const a=answerAssistant(text,history,scope);history.push({author:'student',text},{author:'assistant',...(a||{text:'شرح من النموذج',academicState:null})});return a}}}
function state(a){assert.ok(a?.academicState,'a local academic response must carry its versioned state');assert.equal(a.academicState.version,1);return a.academicState}
function selection(a,major,level='ALL',semester='ALL'){
 const s=state(a);assert.equal(s.major,major);assert.equal(s.level,level);assert.equal(s.semester,semester);assert.equal(s.pendingRequest,undefined)
 assert.deepEqual(s.lastResults.courses,expected(major,level,semester),'the result must contain exactly the original catalog rows in curriculum order')
}
const resources=a=>(a?.resourceGroups||[]).flatMap(group=>group.resources)
function archive(a,lecture){
 const s=state(a);assert.equal(s.intent,'GetLecture');assert.equal(s.lectureNumber,lecture)
 assert.deepEqual(s.course,{courseId:owner.id,courseName:owner.name,major:'IT',year:owner.year,semester:owner.semester})
 assert.equal(s.major,'IT');assert.equal(s.level,2);assert.equal(s.semester,1)
 assert.equal(a.resourceGroups.length,1)
 const group=a.resourceGroups[0];assert.equal(group.courseId,owner.id);assert.equal(group.major,'IT');assert.equal(group.year,2);assert.equal(group.semester,1)
 assert.equal(resources(a).length,1,'a single-lecture request must expose exactly one file')
 const resource=resources(a)[0]
 assert.ok(getAllCourseResources(owner).some(source=>source.title===resource.title&&source.url===resource.sourceUrl),'lecture title and source URL must be an original resource of the selected course')
 const messageId=new URL(resource.sourceUrl).pathname.split('/').filter(Boolean).at(-1)
 assert.equal(new URL(resource.url).searchParams.get('start'),'m_'+owner.id+'_'+messageId)
 return resource
}
let passed=0,failed=0
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(error){failed++;console.error('FAIL',name,error.stack)}}
const all=conversation()
test('01 all IT levels use the complete original curriculum',()=>selection(all.ask('مواد IT جميع المستويات'),'IT'))
test('02 major-only correction keeps all levels',()=>selection(all.ask('طيب CS؟'),'CS'))
test('03 semester-only correction keeps all levels and the major',()=>selection(all.ask('الفصل الأول فقط'),'CS','ALL',1))
test('04 count is calculated from those exact saved results',()=>{const a=all.ask('كم عدد المواد؟');selection(a,'CS','ALL',1);assert.equal(state(a).intent,'CountCourses');assert.match(a.text,new RegExp(String(expected('CS','ALL',1).length)+'\\s+مقرر'))})
test('05 the first lecture survives missing course and major clarifications',()=>{
 const c=conversation();const missing=c.ask('عطني المحاضرة الأولى بس');assert.equal(state(missing).pendingRequest.missing,'course');assert.equal(state(missing).lectureNumber,1)
 const ambiguous=c.ask('المعمارية والتنظيم');assert.equal(state(ambiguous).pendingRequest.missing,'major');assert.equal(state(ambiguous).intent,'GetLecture')
 archive(c.ask('IT'),1)
})
test('06 the second lecture survives the same clarification sequence',()=>{const c=conversation();c.ask('جب المحاضرة الثانية');c.ask('تنظيم ومعمارية الحاسب');archive(c.ask('IT'),2)})
test('07 a correction from curriculum to files retains the selection and link ownership',()=>{
 const c=conversation();c.ask('مواد المستوى الثاني IT');const a=c.ask('لا أريد الخطة، أريد الملازم');selection(a,'IT',2);assert.equal(state(a).intent,'GetResources')
 const groups=a.resourceGroups;assert.ok(resources(a).length);assert.deepEqual(groups.map(g=>g.courseId).sort(),expected('IT',2).map(c=>c.courseId).sort())
 let empty=false
 for(const group of groups){if(!group.resources.length)empty=true;else assert.equal(empty,false,'available files must come first')
 const course=courses.find(c=>c.id===group.courseId);assert.equal(group.major,'IT');assert.equal(group.year,course.year);assert.equal(group.semester,course.semester)
 for(const r of group.resources)assert.ok(getAllCourseResources(course).some(source=>source.url===r.sourceUrl&&source.title===r.title))}
})
test('08 spacing variants never select courses through the generic word computer',()=>{const c=conversation();c.ask('جب لي محاضرات تنظيم و معمارية الحاسب');const a=c.ask('IT');assert.equal(a.resourceGroups.length,1);assert.equal(a.resourceGroups[0].courseId,owner.id);assert.ok(resources(a).length>=2)})
test('09 first-only follow-up narrows an existing lecture collection',()=>{const c=conversation();c.ask('محاضرات تنظيم ومعمارية الحاسب IT');archive(c.ask('جب الأولى بس'),1)})
test('10 second-only follow-up uses the same course and a different verified file',()=>{const c=conversation();const first=archive(c.ask('المحاضرة الأولى تنظيم ومعمارية الحاسب IT'),1);const second=archive(c.ask('طيب وين الثانية؟'),2);assert.notEqual(first.sourceUrl,second.sourceUrl)})
test('11 Yemeni phrasing, typo, Arabic numeral and abbreviation retain the request',()=>{const c=conversation();c.ask('جيب لي المحاضره ٢ بس');c.ask('اقصد لك ماده تنضيم و معماريه الحاسب');archive(c.ask('IT'),2)})
test('12 archive lookup remains synchronous and never invokes a failed Worker',()=>{const old=global.fetch;let calls=0;global.fetch=()=>{calls++;throw Error('Worker offline')};try{archive(answerAssistant('المحاضرة الأولى تنظيم ومعمارية الحاسب IT',[],scope),1);assert.equal(calls,0)}finally{global.fetch=old}})
test('13 nonexistent lecture has no source URL or fabricated file',()=>{const a=answerAssistant('المحاضرة 99 تنظيم ومعمارية الحاسب IT',[],scope);assert.equal(state(a).lectureNumber,99);assert.equal(resources(a).length,0);assert.equal(a.links?.length||0,0);assert.match(a.text,/لا توجد.*99/)})
test('14 unrelated explanation releases the old academic state',()=>{const c=conversation();c.ask('مواد المستوى الثالث CS الفصل الأول');assert.equal(c.ask('كيف أثبت Flutter'),null);assert.equal(c.ask('IT'),null);assert.doesNotMatch(assistantContext('IT',c.history,scope),/المستوى 3/)})
test('15 JSON reloaded pending state resumes and legacy student turns replay',()=>{
 const c=conversation();c.ask('عطني المحاضرة الأولى بس');c.ask('المعمارية والتنظيم')
 const restored=conversation(JSON.parse(JSON.stringify(c.history)));archive(restored.ask('IT'),1)
 const legacy=conversation(c.history.filter(m=>m.author==='student'));archive(legacy.ask('IT'),1)
 const finished=conversation();finished.ask('مواد IT جميع المستويات');finished.ask('طيب CS؟');const reloaded=conversation(JSON.parse(JSON.stringify(finished.history)));selection(reloaded.ask('الفصل الأول فقط'),'CS','ALL',1)
})
test('16 one-word major preserves the level and semester; numeric level completes a pending query',()=>{
 const c=conversation();selection(c.ask('مواد المستوى الثاني IT الفصل الأول'),'IT',2,1);selection(c.ask('CS'),'CS',2,1)
 const missing=conversation();assert.equal(state(missing.ask('مواد IT')).pendingRequest.missing,'level');selection(missing.ask('٢'),'IT',2)
})
test('17 local archives remain local with AI quota irrelevant to router output',()=>{for(const major of ['IT','CS']){const a=answerAssistant('ملازم المستوى الثاني '+major,[],scope);selection(a,major,2);assert.equal(state(a).intent,'GetResources');assert.equal(state(a).lastResults.resourceCount,resources(a).length)}})
test('explicit ALL overrides a prior single level and semester',()=>{const c=conversation();c.ask('مواد المستوى الثاني IT الفصل الأول');selection(c.ask('كل المستويات وجميع الفصول'),'IT');selection(c.ask('كلا التخصصين'),'ALL')})
test('all-level synonyms and both semesters preserve exact catalog identity',()=>{for(const phrase of ['جميع المستويات','كل المستويات','من الأول إلى الرابع'])selection(answerAssistant('مواد IT '+phrase,[],scope),'IT');selection(answerAssistant('مواد CS جميع المستويات الفصل الثاني',[],scope),'CS','ALL',2)})
test('an explicit public-site topic resets the previous selection',()=>{const c=conversation();c.ask('مواد المستوى الثاني IT');const a=c.ask('عرفني بدفعة Tech Elite');assert.equal(a.academicState,null);assert.equal(c.ask('CS'),null)})
test('changing a pending major keeps its original numbered lecture',()=>{const c=conversation();c.ask('المحاضرة الأولى');c.ask('تنظيم ومعمارية الحاسب');c.ask('CS');archive(c.ask('IT'),1)})
console.log('RESULT '+passed+' passed, '+failed+' failed academic conversation checks')
if(failed)process.exitCode=1
