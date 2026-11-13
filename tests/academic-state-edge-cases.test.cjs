require('./assistant-source-loader.cjs')
// Local state/retrieval edge cases supplementary to the full transcript suite.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
const originalJS=require.extensions['.js']
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f)
require.extensions['.ts']=compile
require.extensions['.js']=(m,f)=>f.startsWith(path.join(process.cwd(),'src')+path.sep)?compile(m,f):originalJS(m,f)
const {answerAssistant}=require('../src/assistant-router.ts')
const {courses,siteConfig}=require('../src/data.ts')
const {getCourseResourceGroup}=require('../src/smart-academic-search.ts')
const scope={major:'all',year:'all',semester:'all'}
const course=courses.find(c=>c.name==='تنظيم ومعمارية الحاسب')
const indexed=getCourseResourceGroup(course,'IT').resources
const links=a=>(a?.resourceGroups||[]).flatMap(g=>g.resources)
const run=qs=>{const h=[];for(const q of qs){const a=answerAssistant(q,h,scope);h.push({author:'student',text:q},{author:'assistant',...a,text:a?.text||'AI'})}return h.at(-1)}
let passed=0
function test(name,f){f();passed++;console.log('PASS',name)}
test('resource wording during a clarification retains the first-lecture intent',()=>{const a=run(['عطني المحاضرة الأولى بس','ملازم المعمارية','IT']);assert.equal(a.academicState.intent,'GetLecture');assert.equal(a.academicState.lectureNumber,1);assert.deepEqual(links(a),indexed.slice(0,1))})
test('an explicit all-file request replaces the pending lecture number',()=>{const a=run(['عطني المحاضرة الأولى بس','جميع المحاضرات','المعمارية والتنظيم','IT']);assert.equal(a.academicState.intent,'GetResources');assert.equal(a.academicState.lectureNumber,undefined);assert.deepEqual(links(a),indexed)})
test('known specialization is reused while the original request waits for a subject',()=>{const a=run(['مواد المستوى الرابع IT','جب المحاضرة الثانية','المعمارية']);assert.equal(a.academicState.major,'IT');assert.equal(a.academicState.level,2);assert.equal(a.academicState.semester,1);assert.deepEqual(links(a),indexed.slice(1,2))})
for(const q of ['ملازمها','عطني ملفاتها','روابطها','هات الروابط']) test('resource pronoun refers to the resolved course: '+q,()=>{const a=run(['ملازم تنظيم ومعمارية الحاسب IT',q]);assert.deepEqual(links(a),indexed);assert.equal(a.academicState.course.courseId,course.id)})
test('a possessive lecture label keeps the requested source number',()=>{const a=run(['ملازم تنظيم ومعمارية الحاسب IT','محاضرتها الأولى']);assert.equal(a.academicState.lectureNumber,1);assert.deepEqual(links(a),indexed.slice(0,1))})
test('both specializations retain separate groups for the same named course',()=>{const a=answerAssistant('ملازم تنظيم ومعمارية الحاسب IT وCS',[],scope);assert.equal(a.academicState.major,'ALL');assert.deepEqual(new Set(a.resourceGroups.map(g=>g.major)),new Set(['IT','CS']));assert.deepEqual(links(a),indexed)})
test('generic computer word cannot establish a specific subject',()=>{const a=answerAssistant('مادة الحاسب IT',[],scope);assert.equal(a.academicState.pendingRequest.missing,'course');assert.equal(links(a).length,0)})
test('public bot link is a local site fact',()=>{const a=answerAssistant('عطني رابط بوت تيليجرام',[],scope);assert.equal(a.links[0].url,'https://t.me/'+siteConfig.telegramBotUsername.replace(/^@/,''));assert.equal(a.academicState,null)})
test('ALL overrides selected numeric level and semester',()=>{const a=answerAssistant('مواد IT جميع المستويات جميع الفصول',[],{major:'CS',year:4,semester:1});assert.equal(a.academicState.major,'IT');assert.equal(a.academicState.level,'ALL');assert.equal(a.academicState.semester,'ALL');assert.equal(a.academicState.lastResults.courses.length,courses.length)})
console.log(`PASS ${passed} academic state edge checks`)
