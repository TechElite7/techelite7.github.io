require('./assistant-source-loader.cjs')
// Run: node tests/academic-course-resolution.test.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(
  fs.readFileSync(filename, 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText, filename)
const { resolveAcademicCourses, findSmartAcademicAnswer, getCourseResourceGroup } = require('../src/smart-academic-search.ts')
const { courses } = require('../src/data.ts')
const { csAllCourses } = require('../src/cs-plan-data.ts')
const { telegramMaterials } = require('../src/telegram-materials.ts')
const original = courses.find(course => course.name === 'تنظيم ومعمارية الحاسب')
const csOriginal = csAllCourses.find(course => course.name === original.name)
assert.ok(original && csOriginal)
let passed = 0
function test(name, run) {
  run()
  passed++
  console.log('PASS', name)
}
const identities = result => result.matches.map(entry => entry.major + ':' + entry.course.id).sort()
for (const query of [
  'تنظيم ومعمارية الحاسب',
  'تنظيم و معمارية',
  'المعمارية والتنظيم',
  'مادة المعمارية',
  'محاضرات التنظيم والمعمارية',
  'اقصد لك مادة المعمارية و التنظيم',
  'جب لي محاضرات تنضيم و معماريه الحاسب',
  'تَنْظِيم وَمِعْمَارِيَّة الحَاسِب',
]) {
  test('catalog name normalization: ' + query, () => {
    const result = resolveAcademicCourses(query)
    assert.equal(result.hasSubject, true)
    assert.deepEqual(identities(result), ['IT:' + original.id, 'CS:' + csOriginal.id].sort())
    assert.equal(result.matches.find(entry => entry.major === 'IT').course, original)
  })
}
test('scope selects the real IT source identity', () => {
  const result = resolveAcademicCourses('المعمارية والتنظيم', { major: 'IT', year: 2, semester: 1 })
  assert.deepEqual(identities(result), ['IT:' + original.id])
})
for (const constraints of [
  { major: 'IT', year: 1 },
  { major: 'CS', year: 3 },
  { major: 'IT', semester: 2 },
  { major: 'CS', year: 2, semester: 2 },
]) {
  test('scope never falls back to another course placement: ' + JSON.stringify(constraints), () => {
    const result = resolveAcademicCourses('تنظيم ومعمارية الحاسب', constraints)
    assert.equal(result.hasSubject, true)
    assert.equal(result.matches.length, 0)
  })
}
test('ALL preserves catalog ambiguity', () => {
  const result = resolveAcademicCourses('مادة المعمارية', { major: 'ALL', year: 'ALL', semester: 'ALL' })
  assert.deepEqual(identities(result), ['IT:' + original.id, 'CS:' + csOriginal.id].sort())
})
test('raw explicit scope is parsed when no constraint was supplied', () =>
  assert.deepEqual(identities(resolveAcademicCourses('ملازم المعمارية IT المستوى الثاني الفصل الأول')), ['IT:' + original.id]))
test('exact code resolves only catalog owners', () => {
  assert.deepEqual(identities(resolveAcademicCourses('ملزمة ' + original.code)), ['IT:' + original.id, 'CS:' + csOriginal.id].sort())
  assert.deepEqual(identities(resolveAcademicCourses(original.code.replace(/\s/g, ''), { major: 'IT' })), ['IT:' + original.id])
})
test('a code prefix or suffix is not an exact course code', () => {
  for (const query of [original.code + '9', 'ز' + original.code, 'ملازم عال1179']) {
    assert.equal(resolveAcademicCourses(query).matches.length, 0)
  }
})
test('generic computer word never establishes a course even inside a scope', () => {
  for (const query of ['الحاسب', 'محاضرات الحاسب IT', 'محاضرات فيزياء الحاسب IT']) {
    assert.equal(resolveAcademicCourses(query, { major: 'IT', year: 2 }).matches.length, 0)
  }
})
test('short family name keeps genuine level ambiguity', () => {
  const result = resolveAcademicCourses('ملازم برمجة الحاسب', { major: 'IT' })
  assert.deepEqual(result.matches.map(entry => entry.course.name).sort(), ['برمجة الحاسب 1', 'برمجة الحاسب 2'])
})
test('course suffix is distinct from a lecture number', () => {
  for (const query of ['برمجة الحاسب 1', 'المحاضرة الثانية برمجة الحاسب 1']) {
    const result = resolveAcademicCourses(query, { major: 'IT' })
    assert.deepEqual(result.matches.map(entry => entry.course.name), ['برمجة الحاسب 1'])
  }
})
for (const query of ['مواد IT جميع المستويات', 'ملازم المستوى الثاني IT', 'عطني المحاضرة الأولى بس', 'الفصل الأول فقط', 'كلا التخصصين جميع الفصول', 'كم عددهن', 'IT', 'طيب والثاني', 'مواد IT من الأول إلى الرابع']) {
  test('scope or resource request contains no invented subject: ' + query, () => {
    const result = resolveAcademicCourses(query)
    assert.equal(result.hasSubject, false)
    assert.equal(result.matches.length, 0)
  })
}
test('single-course source retrieval still keeps the requested first lecture only', () => {
  const result = resolveAcademicCourses('مادة المعمارية', { major: 'IT' })
  const group = getCourseResourceGroup(result.matches[0].course, 'IT', 'المحاضرة الأولى')
  assert.equal(group.courseId, original.id)
  assert.equal(group.resources.length, 1)
  assert.equal(group.resources[0].title, telegramMaterials[original.id][0].title)
  assert.equal(group.resources[0].sourceUrl, telegramMaterials[original.id][0].url)
  assert.equal(new URL(group.resources[0].url).searchParams.get('start'),
    'm_' + original.id + '_' + new URL(group.resources[0].sourceUrl).pathname.split('/').at(-1))
})
test('legacy factual retrieval uses the same improved matching', () => {
  const answer = findSmartAcademicAnswer('محاضرات المعمارية والتنظيم IT')
  assert.equal(answer.courseId, original.id)
  assert.equal(answer.resourceGroups.length, 1)
  assert.equal(answer.resourceGroups[0].courseId, original.id)
  assert.equal(answer.resourceGroups[0].resources.length, telegramMaterials[original.id].length)
})

test('every complete catalog name retains its original scoped identity', () => {
  for (const [major, catalog] of [['IT', courses], ['CS', csAllCourses]]) {
    for (const course of catalog) {
      const result = resolveAcademicCourses('ملازم ' + course.name, { major, year: course.year, semester: course.semester })
      assert.deepEqual(identities(result), [major + ':' + course.id], major + ' ' + course.name)
      assert.equal(result.matches[0].course, course)
    }
  }
})

test('abbreviated language names retain their numbered course variant', () => {
  for (const [query, name] of [['الانجليزي 1', 'اللغة الإنجليزية 1'], ['عربي 2', 'اللغة العربية 2']]) {
    const result = resolveAcademicCourses(query, { major: 'IT' })
    assert.deepEqual(result.matches.map(entry => entry.course.name), [name])
  }
})

for (const query of [
  'ملازمها', 'محاضراتها', 'ملزمتها', 'روابطها', 'هات الروابط', 'عطني ملفاتها',
  'اسحب لي المحاضره', 'عطنا', 'هات لنا', 'عطنا ملازمها', 'هات لنا محاضراتها',
  'محاضرتها الأولى', 'ملزمتي', 'رابطه', 'ارسل لنا ملفاتهن', 'نزل ملفاتها',
]) {
  test('referring resource words do not become a new named course: ' + query, () => {
    const result = resolveAcademicCourses(query)
    assert.equal(result.hasSubject, false)
    assert.deepEqual(result.matches, [])
  })
}
test('resource morphology leaves explicit unknown and known subjects intact', () => {
  const unknown = resolveAcademicCourses('هات لنا محاضراتها فيزياء الحاسب IT')
  assert.equal(unknown.hasSubject, true)
  assert.deepEqual(unknown.matches, [])
  const known = resolveAcademicCourses('عطنا روابط مادة المعمارية IT')
  assert.equal(known.hasSubject, true)
  assert.deepEqual(identities(known), ['IT:' + original.id])
})
console.log('PASS ' + passed + ' catalog course resolution checks')
