require('./assistant-source-loader.cjs')
// Run: node tests/assistant-router.test.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const originalJS = require.extensions['.js']
function compile(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename)
}
require.extensions['.ts'] = compile
require.extensions['.js'] = (module,filename) => filename.startsWith(path.join(process.cwd(),'src')+path.sep) ? compile(module,filename) : originalJS(module,filename)
const {answerAssistant, assistantContext, usableAIEndpoint} = require('../src/assistant-router.ts')
const {streamAnswer} = require('../src/assistant-transport.ts')
const {courses} = require('../src/data.ts')
const {getAllCourseResources} = require('../src/telegram-materials.ts')
const scope = {major:'all', year:'all', semester:'all'}
let passed = 0
function test(name, run) { run(); passed++; console.log('PASS',name) }
function chain(questions) {
  const history=[]
  for(const text of questions) {
    const result=answerAssistant(text,history,scope)
    history.push({author:'student',text},{author:'assistant',...result,text:result?.text || 'AI'})
  }
  return history
}
const resourceLinks=answer=>(answer.resourceGroups||[]).flatMap(group=>group.resources)
const S=text=>({author:'student',text})
test('site identity is factual',()=>assert.match(answerAssistant('عرفني بدفعة Tech Elite',[],scope).text,/السابعة/))
test('multi-turn major, semester and count',()=>assert.match(chain(['عطني مواد المستوى الرابع','IT','طيب وCS؟','الترم الأول بس','عطني عدد المواد حقهم']).at(-1).text,/CS، المستوى 4، الفصل الأول:[\s\S]*11 مقررات/))
test('implicit second semester and pronoun count',()=>assert.match(chain(['مواد المستوى الثالث CS الترم الأول','طيب والثاني؟','كم عددهن؟']).at(-1).text,/CS، المستوى 3، الفصل الثاني/))
test('plan to actual resources',()=>{const a=chain(['عطني مواد المستوى الثاني IT','لا أريد الخطة، أريد الملازم']).at(-1);assert.equal(a.destination,'library');assert.match(a.text,/المستوى 2/);assert.ok(resourceLinks(a).length)})
for(const name of ['تنظيم ومعمارية الحاسب','تنظيم و معمارية الحاسب','تنظيم ومعمارية','تنضيم و معمارية الحاسب']) {
 test('precise course: '+name,()=>{const a=answerAssistant('جب لي محاضرات '+name+' IT',[],scope);assert.match(a.text,/تنظيم ومعمارية الحاسب/);assert.doesNotMatch(a.text,/برمجة الحاسب|أمن الحاسب/);assert.ok(resourceLinks(a).length)})
}
test('clarification preserves subject',()=>{const h=chain(['جب لي محاضرات تنظيم و معمارية الحاسب','IT']);assert.match(h.at(-1).text,/تنظيم ومعمارية الحاسب/);assert.ok(resourceLinks(h.at(-1)).length)})
test('existing first lecture and source-backed links',()=>{const course=courses.find(c=>c.name==='تنظيم ومعمارية الحاسب');const a=answerAssistant('المحاضرة الأولى تنظيم ومعمارية الحاسب IT',[],scope);assert.ok(resourceLinks(a).length);const resources=getAllCourseResources(course);for(const link of resourceLinks(a)){const id=new URL(link.url).searchParams.get('start')?.split('_').at(-1);assert.ok(resources.some(r=>r.url===link.url || (id && r.url.endsWith('/'+id))))}})
test('missing lecture never invents URL',()=>{const a=answerAssistant('المحاضرة 99 تنظيم ومعمارية الحاسب IT',[],scope);assert.equal(resourceLinks(a).length,0);assert.match(a.text,/لا توجد.*99/)})
test('AI comparison receives referenced selection',()=>{const h=chain(['مواد المستوى الثالث CS الترم الأول','طيب والثاني؟','كم عددهن؟']);assert.equal(answerAssistant('أيهن أصعب؟',h,scope),null);assert.match(assistantContext('أيهن أصعب؟',h,scope),/CS، المستوى 3، الفصل الثاني/)})
test('technical explanation goes to model',()=>assert.equal(answerAssistant('اشرح SQL وNoSQL',[],scope),null))
test('unrelated topic clears old selection',()=>assert.equal(answerAssistant('CS',[S('مواد المستوى الرابع'),S('كيف أثبت Flutter')],scope),null))
test('deployed page cannot use loopback',()=>assert.equal(usableAIEndpoint('http://127.0.0.1:8787','example.github.io'),''))
test('development keeps configured endpoint',()=>assert.equal(usableAIEndpoint('http://127.0.0.1:8787','localhost'),'http://127.0.0.1:8787'))
test('HTTPS production URL preserved',()=>assert.equal(usableAIEndpoint('https://example.workers.dev','example.github.io'),'https://example.workers.dev'))
test('projects sourced without invention',()=>assert.match(answerAssistant('عطني مشاريع التخرج',[],scope).text,/مشاريع تخرج منشورة|مشاريع التخرج المنشورة/))
test('learning courses sourced with links',()=>assert.ok(answerAssistant('عطني دورات',[],scope).links.length))
test('unknown course with generic shared word cannot return other files',()=>{const a=answerAssistant('محاضرات فيزياء الحاسب IT',[],scope);assert.equal(resourceLinks(a).length,0)})
test('direct resource selection by level',()=>assert.ok(resourceLinks(answerAssistant('ملازم المستوى الثاني IT',[],scope)).length))
test('selected scope supports general resource request',()=>assert.ok(resourceLinks(answerAssistant('عطني الملازم',[],{major:'IT',year:2,semester:'all'})).length))
async function networkTests(){
 const originalFetch=global.fetch
 try {
  global.fetch=async()=>{throw new TypeError('Failed to fetch')}
  await assert.rejects(streamAnswer('http://127.0.0.1:8787',{},new AbortController().signal,()=>{}),/Failed to fetch/);passed++
  assert.match(answerAssistant('مواد المستوى الثاني IT',[],scope).text,/IT، المستوى 2/);passed++
  const paths=[]
  global.fetch=async url=>{paths.push(url);return paths.length===1?new Response('',{status:404}):Response.json({answer:'شرح حقيقي'})}
  assert.equal(await streamAnswer('https://example.workers.dev',{},new AbortController().signal,()=>{}),'شرح حقيقي');assert.deepEqual(paths,['https://example.workers.dev/chat/stream','https://example.workers.dev/chat']);passed++
  global.fetch=async()=>new Response('data: {"response":"أهلا"}\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}})
  assert.equal(await streamAnswer('https://example.workers.dev',{},new AbortController().signal,()=>{}),'أهلا');passed++
 } finally {global.fetch=originalFetch}
 console.log(`PASS ${passed} unified routing and transport checks`)
}
networkTests().catch(e=>{console.error(e);process.exitCode=1})
