'use strict'
require('./assistant-source-loader.cjs')
// Run from the project root: node tests/academic-dialogue-v2.test.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8')
  const js = ts.transpileModule(content, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText
  module._compile(js, filename)
}
const {answerAcademicDialogue,academicDialogueContext} = require(path.join(process.cwd(),'src','academic-dialogue-v2.ts'))
const S = text => ({author:'student',text})
const A = text => ({author:'assistant',text})
const scope = {major:'all',year:'all',semester:'all'}
const csScope = {major:'CS',year:'all',semester:'all'}
const tests = []
const check = (name, q, history, expected, givenScope = scope) => tests.push([name,q,history,expected,givenScope])
const testChain = (name, questions, expected, givenScope=scope) => {
  const history = []
  for (const [index,q] of questions.entries()) {
    const answer = answerAcademicDialogue(q, history, givenScope)
    history.push(S(q),A(answer?.text ?? 'رد الذكاء الاصطناعي'))
    if(index === questions.length-1) assert.match(answer?.text||'',expected,name)
  }
  return history
}
check('initial no-major', 'اريد مواد مستوى رابع', [], /IT أو CS/)
check('initial count no major', 'كم عدد مواد المستوى الثالث ترم أول', [], /IT أو CS/)
check('it majors', 'مواد المستوى الرابع IT', [], /IT، المستوى 4/)
check('cs majors', 'مواد المستوى الرابع CS', [], /CS، المستوى 4/)
check('first semester', 'مواد المستوى الرابع الفصل الاول cs', [], /الفصل الأول: 11 مقررات/)
check('count only', 'كم عدد مواد المستوى الرابع الفصل الأول CS', [], /الفصل الأول: 11 مقررات/)
check('colloquial sentence', 'هاتلي مواد مستوى ثاني ترم اول CS', [], /CS، المستوى 2، الفصل الأول/)
check('arabic digits', 'اعطني مواد مستوى ٢ ترم ١ IT', [], /IT، المستوى 2، الفصل الأول/)
check('from context major', 'CS', [S('عطني مواد المستوى الثاني الترم الأول'),A('أي تخصص؟')], /CS، المستوى 2، الفصل الأول/)
check('scope', 'مواد المستوى الثالث', [], /IT أو CS/, scope)
check('selected scope', 'مواد المستوى الثالث', [], /CS، المستوى 3/, csScope)
check('pronoun count from list', 'عطني عدد المواد حقهم', [S('مواد المستوى الرابع CS'),A('قائمة')], /الإجمالي: 17 مقررات مسجلة/)
check('explicit count when latest is list', 'كم عدد المواد حقهم',[S('مواد المستوى الرابع CS'),A('قائمة'),S('الترم الاول بس'),A('القائمة')],/الفصل الأول: 11 مقررات مسجلة/)
check('spaced waw', 'طيب و الفصل الثاني ؟', [S('كم عدد مواد مستوى ثالث الترم الأول CS'),A('العدد')], /CS، المستوى 3، الفصل الثاني/)
check('attached waw', 'طيب والفصل الثاني؟', [S('كم عدد مواد مستوى ثالث الترم الأول CS'),A('العدد')], /CS، المستوى 3، الفصل الثاني/)
check('term alone with بس', 'الترم الاول بس', [S('مواد المستوى الرابع CS'),A('قائمة')], /CS، المستوى 4، الفصل الأول/)
check('ar pronoun', 'عدد المواد حقهن', [S('مواد المستوى الرابع CS'),A('القائمة')], /الإجمالي: 17/)
check('an unrelated question must go AI', 'ليش ما يشتغل كود Flutter', [S('مواد المستوى الرابع CS')], null)
check('followup after unrelated must not use stale plan', 'CS', [S('مواد المستوى الرابع'),A('تخصص؟'),S('كيف اثبت flutter'),A('شرح')], null)
check('lecture files preserved', 'هات ملزمة قواعد البيانات', [S('مواد المستوى الرابع CS')], null)
check('evaluation stays AI', 'أيهن أصعب؟', [S('مواد المستوى الرابع CS')], null)
check('explicit year resets semester', 'مواد المستوى الثالث CS', [S('مواد المستوى الرابع الفصل الأول CS')], /الفصل الثاني:/)
check('semester explicit both', 'الفصلين', [S('مواد المستوى الرابع CS'),A('قائمة')], /الإجمالي: 17/)
check('count without previous plan requests year', 'كم عدد المواد', [], /حدد المستوى الدراسي/)
check('just CS no history must not trigger', 'CS', [], null)
check('bad plan unrelated conversation', 'ترم الاول بس', [S('كيف اسوي واجهه فلاتر')], null)
check('count intent inherits on semester', 'الترم الثاني',[S('كم عدد مواد المستوى الرابع CS الفصل الأول'),A('11')],/الفصل الثاني: 6 مقررات مسجلة/)
check('list intent changes after count', 'اعرضها',[S('كم عدد مواد المستوى الرابع CS الفصل الأول'),A('11')],/\n1\. /)
check('term only no history', 'الترم الأول بس',[],null)
check('simple level change', 'المستوى الثالث', [S('مواد المستوى الرابع IT'), A('...')], /IT، المستوى 3/)
check('full major change with prefix', 'طيب و CS', [S('مواد المستوى الرابع IT'), A('...')], /CS، المستوى 4/)

let passed = 0
for (const [name,q,history,expected,givenScope] of tests) {
  const result = answerAcademicDialogue(q,history,givenScope)
  if (expected === null) assert.equal(result,null,name)
  else assert.match(result?.text || '',expected,name)
  passed++
}
// Real regression: a multi-turn session with two major switches, limiting to one semester, then asking for counts.
const transcript = ['اريد مواد مستوى رابع','IT','طيب و cs','الترم الاول بس','عطني عدد المواد حقهم']
const history = testChain('user actual failure transcript',transcript,/CS، المستوى 4، الفصل الأول:[\s\S]*الفصل الأول: 11 مقررات مسجلة/)
passed++
assert.doesNotMatch(history.at(-1).text,/الفصل الثاني:/)
passed++
check('student focus', 'احسب عددهم',history,/الفصل الأول: 11 مقررات مسجلة/)
// A varied set of followups, answer intent preserved, plan history intact after an AI explanation.
testChain('switch from first to second after multiple selections',[
  'عطني مواد المستوى الثاني الترم الأول','CS','طيب الترم الثاني','كم عددها'
],/CS، المستوى 2، الفصل الثاني:[\s\S]*مقررات مسجلة/)
passed++
const beforeAI = [S('مواد المستوى الرابع الفصل الأول CS'),A('11 مقررات')]
assert.match(academicDialogueContext('ايش أصعب مادة فيهن؟',beforeAI,scope),/CS، المستوى 4، الفصل الأول/)
passed++
assert.equal(academicDialogueContext('اشرح EF Core',beforeAI,scope),'')
passed++
assert.match(answerAcademicDialogue('عطني عدد المواد حقهم',[...beforeAI,S('اشرح لي EF Core'),A('شرح EF Core')],scope)?.text || '',/حدد المستوى الدراسي/)
passed++
console.log(`PASS ${passed} contextual curriculum regression checks on Tech Elite course data`)
