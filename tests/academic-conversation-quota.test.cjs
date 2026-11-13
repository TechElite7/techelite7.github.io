require('./assistant-source-loader.cjs')
// Run: node tests/academic-conversation-quota.test.cjs
// Exercise the actual submit handler, savedMessages loader and persistence effects.
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const Module=require('node:module')
const ts=require('typescript')
const originalJS=require.extensions['.js']
function compile(module,filename){module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename)}
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;require.extensions['.css']=()=>{}
require.extensions['.js']=(module,filename)=>filename.startsWith(path.join(process.cwd(),'src')+path.sep)?compile(module,filename):originalJS(module,filename)
const realReact=require('react')
let states=[],cursor=0,input='',effects=[]
const hooks={...realReact,useEffect:effect=>{if(String(effect).includes('localStorage.setItem'))effects.push(effect)},useRef:value=>({current:value}),useState:initial=>{const i=cursor++;if(!(i in states))states[i]=i===2?input:typeof initial==='function'?initial():initial;return [states[i],update=>{states[i]=typeof update==='function'?update(states[i]):update}]}}
const originalLoad=Module._load
Module._load=function(name,...rest){return name==='react'?hooks:originalLoad.call(this,name,...rest)}
const originalFetch=global.fetch
const originalStorage=global.localStorage
const originalWindow=global.window
global.window={location:{hostname:'localhost'},setTimeout,clearTimeout}
const storage=new Map()
global.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}
const SiteAssistant=require('../src/SiteAssistant.tsx').default
const {courses}=require('../src/data.ts')
const {getAllCourseResources}=require('../src/telegram-materials.ts')
const owner=courses.find(course=>course.name==='تنظيم ومعمارية الحاسب')
const chatKey='te-academic-chat-v5',quotaKey='te-academic-questions-v4'
function form(node){if(!node||typeof node!=='object')return null;if(node.type==='form')return node;for(const c of [node.props?.children].flat(Infinity)){const found=form(c);if(found)return found}return null}
function render(){cursor=0;effects=[];const tree=SiteAssistant({onNavigate:()=>{}});for(const effect of effects)effect();return tree}
async function submit(question,count=15,history=[],failure=true){
 input=question;states=[];storage.set(chatKey,JSON.stringify(history));storage.set(quotaKey,JSON.stringify({day:new Date().toLocaleDateString('en-CA'),used:count}))
 let calls=0;global.fetch=async()=>{calls++;if(failure)throw TypeError('Worker offline');return Response.json({answer:'شرح من النموذج'})}
 form(render()).props.onSubmit({preventDefault(){}})
 await new Promise(resolve=>setImmediate(resolve))
 render()
 return {calls,used:states[1],messages:states[0],saved:JSON.parse(storage.get(chatKey)),quota:JSON.parse(storage.get(quotaKey))}
}
const files=a=>(a.resourceGroups||[]).flatMap(g=>g.resources)
function lecture(result,number){
 assert.equal(result.calls,0);assert.equal(result.used,15);assert.equal(result.quota.used,15)
 const answer=result.messages.at(-1)
 assert.equal(answer.academicState.intent,'GetLecture');assert.equal(answer.academicState.lectureNumber,number);assert.equal(answer.academicState.course.courseId,owner.id);assert.equal(answer.academicState.major,'IT')
 assert.equal(files(answer).length,1)
 assert.ok(getAllCourseResources(owner).some(source=>source.url===files(answer)[0].sourceUrl&&source.title===files(answer)[0].title))
 assert.deepEqual(result.saved.at(-1).academicState,JSON.parse(JSON.stringify(answer.academicState)))
 return answer
}
let passed=0
async function test(name,fn){await fn();passed++;console.log('PASS',name)}
async function main(){
 await test('archive lecture is free and available at the exhausted daily limit',async()=>lecture(await submit('المحاضرة الأولى تنظيم ومعمارية الحاسب IT'),1))
 await test('a pending lecture survives real storage save and component reloads',async()=>{
  let a=await submit('عطني المحاضرة الأولى بس');assert.equal(a.calls,0);assert.equal(a.saved.at(-1).academicState.pendingRequest.missing,'course')
  a=await submit('المعمارية والتنظيم',15,a.saved);assert.equal(a.saved.at(-1).academicState.pendingRequest.missing,'major');assert.equal(a.used,15)
  a=await submit('IT',15,a.saved);lecture(a,1)
  const b=await submit('طيب وين الثانية؟',15,a.saved);lecture(b,2);assert.notEqual(files(a.messages.at(-1))[0].url,files(b.messages.at(-1))[0].url)
 })
 await test('all-level saved results remain available through a full component reload',async()=>{
  const a=await submit('مواد IT جميع المستويات');assert.equal(a.calls,0);assert.equal(a.used,15);const s=a.saved.at(-1).academicState;assert.equal(s.level,'ALL');assert.ok(s.lastResults.courses.length>40)
  const b=await submit('كم عدد المواد؟',15,a.saved);assert.equal(b.calls,0);assert.equal(b.used,15);assert.equal(b.saved.at(-1).academicState.intent,'CountCourses');assert.deepEqual(b.saved.at(-1).academicState.lastResults.courses,s.lastResults.courses)
 })
 await test('a failed Worker call does not disable a later local archive request',async()=>{
  const a=await submit('اشرح SQL',0,[],true);assert.equal(a.calls,1);assert.equal(a.used,0);assert.equal(a.quota.used,0)
  const b=await submit('المحاضرة الأولى تنظيم ومعمارية الحاسب IT',0,a.saved,true);assert.equal(b.calls,0);assert.equal(b.used,0);assert.equal(files(b.messages.at(-1)).length,1)
 })
 await test('a legacy saved chat without academic snapshots replays the pending lecture',async()=>{
  const saved=[{id:1,author:'student',text:'جب المحاضرة الثانية'},{id:2,author:'assistant',text:'لأي مادة؟'},{id:3,author:'student',text:'تنظيم ومعمارية الحاسب'},{id:4,author:'assistant',text:'IT أو CS؟'}]
  lecture(await submit('IT',15,saved),2)
 })
 await test('plan-to-file correction is free and persists structured owners',async()=>{
  const a=await submit('مواد المستوى الثاني IT');const b=await submit('لا أريد الخطة، أريد الملازم',15,a.saved)
  assert.equal(b.calls,0);assert.equal(b.used,15);assert.equal(b.saved.at(-1).academicState.intent,'GetResources');assert.ok(files(b.saved.at(-1)).length)
  for(const group of b.saved.at(-1).resourceGroups){const course=courses.find(c=>c.id===group.courseId);assert.equal(group.major,'IT');assert.equal(group.year,2);assert.equal(group.semester,course.semester);for(const resource of group.resources)assert.ok(getAllCourseResources(course).some(source=>source.url===resource.sourceUrl&&source.title===resource.title))}
 })

 await test('site questions and learning tracks stay local while Worker is offline', async()=>{
  for(const question of ['من هم دفعة Tech Elite؟','من نحن؟','عرفني بالدفعة السابعة','اش يقدم هذا الموقع؟','عطني مسارات IT','عطني مسارات CS','وين أحصل على الملازم؟','كيف أصل لبوت الدفعة؟','عطني مشاريع تخرج دفعتنا']){
   const result=await submit(question,15)
   assert.equal(result.calls,0,question);assert.equal(result.used,15);assert.equal(result.quota.used,15)
   assert.ok(result.messages.at(-1).retrieval,question)
   assert.equal(result.messages.at(-1).academicState,null,question)
   assert.doesNotMatch(result.messages.at(-1).text,/Failed to fetch/)
  }
 })
 await test('learning domain survives persistence with only the latest answer retained', async()=>{
  const first=await submit('عطني مسارات IT',15)
  assert.equal(first.saved.at(-1).siteState.intent,'Tracks')
  const second=await submit('وCS؟',15,first.saved.slice(-1))
  assert.equal(second.calls,0);assert.equal(second.used,15)
  assert.equal(second.saved.at(-1).siteState.major,'CS')
  assert.equal(second.saved.at(-1).retrieval.kind,'learning_track')
  assert.equal(second.saved.at(-1).academicState,null)
 })
 await test('AI transport failure is a service message and keeps the daily allowance', async()=>{
  const failed=await submit('اشرح SQL وNoSQL',0,[],true)
  assert.equal(failed.calls,1);assert.equal(failed.used,0)
  assert.match(failed.messages.at(-1).text,/تعذر الاتصال بنموذج AI/)
  assert.doesNotMatch(failed.messages.at(-1).text,/Worker offline|Failed to fetch/)
 })
 console.log('RESULT '+passed+' passed, 0 failed component persistence and quota checks')
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{Module._load=originalLoad;global.fetch=originalFetch;global.localStorage=originalStorage;global.window=originalWindow})
