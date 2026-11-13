require('./assistant-source-loader.cjs')
// Run: node tests/academic-state-review-regressions.test.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const originalJS = require.extensions['.js']
function compile(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename)
}
require.extensions['.ts'] = compile
require.extensions['.js'] = (module, filename) =>
  filename.startsWith(path.join(process.cwd(), 'src') + path.sep) ? compile(module, filename) : originalJS(module, filename)

const { answerAssistant } = require('../src/assistant-router.ts')
const { reconstructAcademicState } = require('../src/academic-dialogue-v2.ts')
const { resolveAcademicCourses } = require('../src/smart-academic-search.ts')
const { courses } = require('../src/data.ts')
const scope = { major: 'all', year: 'all', semester: 'all' }
let passed = 0
function test(name, run) {
  run()
  passed++
  console.log('PASS', name)
}
function chain(questions, selectedScope = scope) {
  const history = []
  for (const question of questions) {
    const answer = answerAssistant(question, history, selectedScope)
    assert.ok(answer, 'academic regression questions must stay in the factual assistant path')
    history.push({ author: 'student', text: question }, { author: 'assistant', ...answer })
  }
  return history.at(-1)
}
const courseIds = values => values.map(value => value.courseId || value.course?.id).sort()

for (const [name, malformed] of [
  ['null course reference', { course: null }],
  ['null candidate reference', { courseCandidates: [null] }],
  ['null last results', { lastResults: null }],
  ['null last-result course reference', { lastResults: { kind: 'courses', courses: [null] } }],
  ['null last-result course array', { lastResults: { kind: 'courses', courses: null } }],
]) {
  test('malformed saved state ignores ' + name + ' and replays legacy student context', () => {
    const history = [
      { author: 'student', text: 'مواد المستوى الثاني IT' },
      {
        author: 'assistant', text: 'saved response',
        academicState: {
          version: 1, intent: 'ListCourses', target: 'selection',
          major: 'CS', level: 4, semester: 1, ...malformed,
        },
      },
    ]
    let restored
    assert.doesNotThrow(() => { restored = reconstructAcademicState(history, scope) })
    assert.equal(restored.major, 'IT')
    assert.equal(restored.level, 2)
    let answer
    assert.doesNotThrow(() => { answer = answerAssistant('كم عددها', history, scope) })
    assert.equal(answer.academicState.major, 'IT')
    assert.equal(answer.academicState.level, 2)
    assert.match(answer.text, /IT، المستوى 2/)
  })
}
test('a malformed state without earlier students requests clarification safely', () => {
  const history = [{
    author: 'assistant', text: 'saved response',
    academicState: { version: 1, intent: 'ListCourses', target: 'selection', lastResults: null },
  }]
  let answer
  assert.doesNotThrow(() => { answer = answerAssistant('ملازم', history, scope) })
  assert.ok(answer?.academicState?.pendingRequest)
  assert.equal(answer.links?.length || 0, 0)
  assert.equal(answer.resourceGroups?.flatMap(group => group.resources).length || 0, 0)
})

function assertExamAnswer(answer) {
  assert.equal(answer.academicState.intent, 'GetResources')
  assert.equal(answer.academicState.resourceType, 'exam')
  assert.equal(answer.academicState.course.courseName, 'تنظيم ومعمارية الحاسب')
  assert.equal(answer.academicState.course.major, 'IT')
  assert.doesNotMatch(answer.text, /الرمز:|الساعات:|الساعات المعتمدة/)
  assert.equal(answer.destination, 'library')
}
test('a direct plural exam request searches resources instead of course details', () =>
  assertExamAnswer(chain(['اختبارات تنظيم ومعمارية الحاسب IT'])))
test('a plural exam request after a plan switches to exam resources', () =>
  assertExamAnswer(chain(['مواد المستوى الثاني IT', 'اختبارات تنظيم ومعمارية الحاسب IT'])))

const english = resolveAcademicCourses('اللغة الإنجليزية', {
  major: 'IT', year: 'ALL', semester: 'ALL',
}).matches
assert.ok(english.length > 1, 'use the existing English course family from the site catalog')
function assertAllEnglish(answer) {
  const state = answer.academicState
  assert.equal(state.intent, 'GetResources')
  assert.equal(state.major, 'IT')
  assert.equal(state.level, 'ALL')
  assert.equal(state.semester, 'ALL')
  assert.equal(state.pendingRequest, undefined)
  assert.ok(Array.isArray(answer.resourceGroups), 'all matching courses retain groups even when they have no files')
  assert.deepEqual(courseIds(answer.resourceGroups), courseIds(english), 'explicit ALL cannot collapse to an old course or semester')
  assert.ok(answer.resourceGroups.some(group => group.semester === 1))
  assert.ok(answer.resourceGroups.some(group => group.semester === 2))
  assert.ok(answer.resourceGroups.every(group => group.major === 'IT'))
  for (const group of answer.resourceGroups) {
    const source = courses.find(course => course.id === group.courseId)
    assert.equal(group.courseName, source.name)
    assert.equal(group.year, source.year)
    assert.equal(group.semester, source.semester)
  }
}
test('explicit all levels expands an earlier single English course to its full family', () =>
  assertAllEnglish(chain([
    'ملازم اللغة الإنجليزية 1 IT',
    'ملازم اللغة الإنجليزية جميع المستويات IT',
  ])))
test('explicit all levels and IT override a previous CS semester selection', () =>
  assertAllEnglish(chain([
    'مواد المستوى الثالث CS الفصل الأول',
    'ملازم اللغة الإنجليزية جميع المستويات IT',
  ])))
test('explicit all levels and all semesters override selected scope controls', () =>
  assertAllEnglish(chain([
    'ملازم اللغة الإنجليزية جميع المستويات جميع الفصول IT',
  ], { major: 'CS', year: 1, semester: 1 })))

function assertProgrammingCandidates(answer, intent, lectureNumber) {
  const state = answer.academicState
  const expected = resolveAcademicCourses('البرمجة', {
    major: 'IT', year: 'ALL', semester: 'ALL',
  }).matches
  assert.ok(expected.length > 1)
  assert.equal(state.intent, intent)
  assert.equal(state.lectureNumber, lectureNumber)
  assert.equal(state.major, 'IT')
  assert.equal(state.course, undefined, 'a major reply cannot silently choose the first course')
  assert.equal(state.pendingRequest?.missing, 'course')
  assert.equal(state.pendingRequest?.intent, intent)
  assert.equal(state.pendingRequest?.lectureNumber, lectureNumber)
  assert.deepEqual(courseIds(state.courseCandidates), courseIds(expected))
  assert.equal(answer.links?.length || 0, 0)
  assert.equal(answer.resourceGroups?.flatMap(group => group.resources).length || 0, 0)
}
test('major clarification retains every matching programming course', () =>
  assertProgrammingCandidates(chain(['محاضرات البرمجة', 'IT']), 'GetResources', undefined))
test('major clarification retains a pending lecture number and course ambiguity', () =>
  assertProgrammingCandidates(chain(['المحاضرة الأولى للبرمجة', 'IT']), 'GetLecture', 1))
test('an exact course selection completes the pending lecture without changing its number', () => {
  const answer = chain([
    'المحاضرة الأولى للبرمجة', 'IT', 'البرمجة الموجهة للكائنات IT',
  ])
  assert.equal(answer.academicState.intent, 'GetLecture')
  assert.equal(answer.academicState.lectureNumber, 1)
  assert.equal(answer.academicState.pendingRequest, undefined)
  assert.equal(answer.academicState.course.courseName, 'البرمجة الموجهة للكائنات')
  assert.equal(answer.academicState.course.major, 'IT')
})

console.log('PASS ' + passed + ' saved-state, exam, ALL-range and pending-course regressions')
