require('./assistant-source-loader.cjs')
// Exercise the existing chat submit handler with isolated React hooks and a mocked Worker.
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const Module=require('node:module')
const ts=require('typescript')
const originalJS=require.extensions['.js']
function compile(module,filename){module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename)}
require.extensions['.ts']=compile
require.extensions['.tsx']=compile
require.extensions['.css']=()=>{}
require.extensions['.js']=(module,filename)=>filename.startsWith(path.join(process.cwd(),'src')+path.sep)?compile(module,filename):originalJS(module,filename)
const realReact=require('react')
let state=[],index=0,input=''
const hooks={...realReact,useEffect:()=>{},useRef:value=>({current:value}),useState:initial=>{const i=index++;state[i]=i===2?input:typeof initial==='function'?initial():initial;return [state[i],update=>{state[i]=typeof update==='function'?update(state[i]):update}]}}
const originalLoad=Module._load
Module._load=function(name,...rest){return name==='react'?hooks:originalLoad.call(this,name,...rest)}
global.window={location:{hostname:'localhost'},setTimeout,clearTimeout}
let saved=[],used=0
const originalFetch=global.fetch
global.localStorage={getItem:key=>key==='te-academic-chat-v5'?JSON.stringify(saved):JSON.stringify({day:new Date().toLocaleDateString('en-CA'),used})}
const SiteAssistant=require('../src/SiteAssistant.tsx').default
function form(node){if(!node||typeof node!=='object')return null;if(node.type==='form')return node;for(const c of [node.props?.children].flat(Infinity)){const found=form(c);if(found)return found}return null}
async function submit(question,count,history=[],failure=false){input=question;used=count;saved=history;state=[];index=0;let calls=0;global.fetch=async()=>{calls++;if(failure)throw TypeError('Failed to fetch');return Response.json({answer:'شرح من النموذج'})};form(SiteAssistant({onNavigate:()=>{}})).props.onSubmit({preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));return {calls,used:state[1],messages:state[0]}}
async function main(){
 let a=await submit('مواد المستوى الثاني IT',15);assert.equal(a.calls,0);assert.equal(a.used,15);assert.match(a.messages.at(-1).text,/IT، المستوى 2/)
 a=await submit('اشرح SQL',0);assert.equal(a.calls,1);assert.equal(a.used,1);assert.equal(a.messages.at(-1).text,'شرح من النموذج')
 a=await submit('اشرح SQL',0,[],true);assert.equal(a.calls,1);assert.equal(a.used,0);assert.match(a.messages.at(-1).text,/تعذر الاتصال بنموذج AI/);assert.doesNotMatch(a.messages.at(-1).text,/Failed to fetch/)
 a=await submit('اشرح SQL',15);assert.equal(a.calls,0);assert.equal(a.used,15);assert.match(a.messages.at(-1).text,/استهلكت حصة/)
 a=await submit('كم عددهن؟',15,[{id:1,author:'student',text:'مواد المستوى الثالث CS الترم الأول'},{id:2,author:'assistant',text:'قائمة'},{id:3,author:'student',text:'طيب والثاني؟'},{id:4,author:'assistant',text:'قائمة'}]);assert.equal(a.calls,0);assert.equal(a.used,15);assert.match(a.messages.at(-1).text,/CS، المستوى 3، الفصل الثاني/)
 console.log('PASS 5 chat submission checks: free factual answers, paid AI, failed-call refund, daily limit, restored history')
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{Module._load=originalLoad;global.fetch=originalFetch})
