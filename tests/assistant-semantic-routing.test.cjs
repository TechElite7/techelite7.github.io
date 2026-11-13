// Semantic routing is verified against source identities, not answer keywords alone.
require('./assistant-source-loader.cjs')
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const originalJS = require.extensions['.js']
function compile(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename)
}
require.extensions['.ts'] = compile
require.extensions['.js'] = (module, filename) => filename.startsWith(path.resolve(__dirname, '../src') + path.sep) ? compile(module, filename) : originalJS(module, filename)
const { answerAssistant, assistantContext } = require('../src/assistant-router.ts')
const { siteRecords, sourceRecords, readSourceLiteral, sourceParagraphs } = require('../src/assistant-site-sources.ts')
const { inferAssistantIntent } = require('../src/assistant-intent.ts')
const { resolveAcademicCourses } = require('../src/smart-academic-search.ts')
const { courses, learningTracks, siteConfig } = require('../src/data.ts')
const { fullstackStages } = require('../src/fullstack-guide-data.ts')
const { learningCourses } = require('../src/learning-paths-data.ts')
const { graduationProjects } = require('../src/graduation-projects-data.js')
const { getAllCourseResources, archiveMessageId } = require('../src/telegram-materials.ts')
const scope = { major: 'all', year: 'all', semester: 'all' }
const kind = (answer, expected) => {
  assert.ok(answer)
  assert.equal(answer.retrieval.kind, expected)
  assert.equal(answer.academicState, null)
  assert.equal(answer.resourceGroups, undefined)
  assert.equal(answer.courseId, undefined)
  return answer
}
const run = (questions, initial = []) => {
  const history = [...initial]
  for (const question of questions) {
    const answer = answerAssistant(question, history, scope)
    history.push({ author: 'student', text: question }, { author: 'assistant', ...(answer || { text: 'AI' }) })
  }
  return history
}
const recordIds = (type, major) => siteRecords.filter(record => record.kind === type && (!major || record.major === major)).map(record => record.id)
function literalTitles(filename, name) {
  // Independent TypeScript AST reads expected private page literals.
  const source = ts.createSourceFile(filename, fs.readFileSync(path.join(__dirname, '../src', filename), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let initializer
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) initializer = node.initializer
    ts.forEachChild(node, visit)
  }
  visit(source)
  assert.ok(initializer, name)
  const objects = ts.isArrayLiteralExpression(initializer) ? initializer.elements : [initializer]
  return objects.map(object => object.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(source).replace(/['"]/g, '') === 'title').initializer.text)
}

for (const question of ['من هم دفعة Tech Elite؟', 'من نحن؟', 'عرفني بالدفعة السابعة.', 'من هم Tech Elite؟', 'من احنا؟', 'ايش هي دفعتكم؟']) {
  test('identity is sourced and local: ' + question, () => {
    const answer = kind(answerAssistant(question, [], scope), 'identity')
    assert.deepEqual(answer.retrieval.ids, ['identity:batch'])
    assert.match(answer.text, /الدفعة السابعة/)
    assert.ok(answer.text.includes(siteConfig.universityName))
    assert.ok(answer.retrieval.sources.some(source => source.includes('CohortIdentity.tsx')))
  })
}
test('site services come from the live navigation section list', () => {
  const answer = kind(answerAssistant('اش يقدم هذا الموقع؟', [], scope), 'section')
  assert.deepEqual(answer.retrieval.ids, recordIds('section'))
  assert.ok(answer.retrieval.ids.includes('section:guide'))
  assert.ok(answer.retrieval.ids.includes('section:batch'))
})
test('IT tracks contain the actual data fields and the page cloud field', () => {
  const answer = kind(answerAssistant('عطني مسارات IT.', [], scope), 'learning_track')
  assert.deepEqual(answer.retrieval.ids, recordIds('learning_track', 'IT'))
  const titles = answer.retrieval.ids.map(id => siteRecords.find(record => record.id === id).title)
  assert.deepEqual(titles, [...learningTracks.map(track => track.title), ...literalTitles('TrackCollections.tsx', 'extraIt')])
  assert.doesNotMatch(answer.text, /مهارات الحاسوب|مهارات الاتصال|مهارات التعلم/)
})
for (const followup of ['و مسارات CS.', 'و CS؟', 'وCS؟']) {
  test('major change preserves track intent: ' + followup, () => {
    const answer = kind(run(['عطني مسارات IT.', followup]).at(-1), 'learning_track')
    assert.equal(answer.siteState.major, 'CS')
    assert.deepEqual(answer.retrieval.ids, recordIds('learning_track', 'CS'))
    assert.deepEqual(answer.retrieval.ids.map(id => siteRecords.find(record => record.id === id).title), literalTitles('TrackCollections.tsx', 'csTracks'))
    assert.doesNotMatch(answer.text, /مهارات الحاسوب|مهارات الاتصال|مهارات التعلم/)
  })
}
test('plain curriculum request is an academic plan, not a track collection', () => {
  const answer = answerAssistant('عطني مواد IT.', [], scope)
  assert.equal(answer.academicState.intent, 'ListCourses')
  assert.equal(answer.academicState.major, 'IT')
  assert.equal(answer.retrieval, undefined)
})
test('a computer skills course stays a real course', () => {
  const course = courses.find(course => course.name === 'مهارات الحاسوب')
  assert.ok(course)
  const answer = answerAssistant('عطني مهارات الحاسوب IT.', [], scope)
  assert.equal(answer.academicState.intent, 'CourseDetails')
  assert.equal(answer.academicState.course.courseId, course.id)
  assert.equal(answer.retrieval, undefined)
})
test('track/plan comparison is local even though it mentions both types', () => {
  const answer = kind(answerAssistant('ما الفرق بين مسارات التعلم والخطة الدراسية؟', [], scope), 'section')
  assert.equal(answer.siteState.intent, 'TrackPlanDifference')
  assert.ok(answer.retrieval.ids.includes('section:plan'))
  assert.ok(answer.retrieval.ids.includes('section:guide'))
})
for (const question of ['وين أحصل على الملازم؟', 'وين مكتبة الملازم؟']) {
  test('generic library navigation avoids course matching: ' + question, () => {
    const answer = kind(answerAssistant(question, [], scope), 'section')
    assert.equal(answer.destination, 'library')
    assert.deepEqual(answer.retrieval.ids, ['section:library'])
  })
}
test('project requests report actual publication availability', () => {
  const answer = kind(answerAssistant('عطني مشاريع تخرج دفعتنا.', [], scope), 'graduation_project')
  assert.equal(answer.retrieval.ids.length, graduationProjects.length)
  assert.equal(answer.retrieval.status, graduationProjects.length ? 'found' : 'empty')
  assert.ok(answer.retrieval.sources.some(source => source.includes('graduation-projects-data.js')))
})
test('all levels, semester and count keep precisely the original curriculum rows', () => {
  const history = run(['عطني جميع مستويات IT.', 'الفصل الثاني بس.', 'كم عدد موادهن؟'])
  const first = history[1].academicState
  assert.equal(first.level, 'ALL')
  assert.equal(first.major, 'IT')
  const narrowed = history[3].academicState
  const expected = courses.filter(course => course.semester === 2).map(course => course.id)
  assert.equal(narrowed.semester, 2)
  assert.deepEqual(narrowed.lastResults.courses.map(course => course.courseId).sort(), [...expected].sort())
  const counted = history.at(-1).academicState
  assert.equal(counted.intent, 'CountCourses')
  assert.deepEqual(counted.lastResults.courses, narrowed.lastResults.courses)
  assert.equal(counted.lastResults.courses.length, expected.length)
})
test('a correction from plan to files keeps major and level', () => {
  const answer = run(['عطني مواد المستوى الثاني IT.', 'لا، أقصد الملازم.']).at(-1)
  assert.equal(answer.academicState.intent, 'GetResources')
  assert.equal(answer.academicState.major, 'IT')
  assert.equal(answer.academicState.level, 2)
  for (const group of answer.resourceGroups) {
    assert.equal(group.year, 2)
    assert.equal(group.major, 'IT')
    const original = courses.find(course => course.id === group.courseId)
    for (const resource of group.resources) assert.ok(getAllCourseResources(original).some(item => item.url === resource.sourceUrl && item.title === resource.title))
  }
})
function firstLecture(answer) {
  const course = courses.find(course => course.name === 'تنظيم ومعمارية الحاسب')
  assert.equal(answer.academicState.intent, 'GetLecture')
  assert.equal(answer.academicState.lectureNumber, 1)
  assert.equal(answer.academicState.course.courseId, course.id)
  const resources = answer.resourceGroups.flatMap(group => group.resources)
  assert.equal(resources.length, 1)
  assert.ok(getAllCourseResources(course).some(item => item.title === resources[0].title && item.url === resources[0].sourceUrl))
  assert.equal(new URL(resources[0].url).searchParams.get('start'), 'm_' + course.id + '_' + archiveMessageId(resources[0].sourceUrl))
}
test('first lecture is source-backed in one turn', () => firstLecture(answerAssistant('المحاضرة الأولى من تنظيم ومعمارية الحاسب IT.', [], scope)))
test('first lecture survives two clarification turns', () => firstLecture(run(['جب المحاضرة الأولى.', 'تنظيم ومعمارية الحاسب.', 'IT.']).at(-1)))
test('site and track requests discard obsolete course selection', () => {
  const history = run(['المحاضرة الأولى تنظيم ومعمارية الحاسب IT', 'عطني مسارات CS'])
  const answer = kind(history.at(-1), 'learning_track')
  assert.deepEqual(answer.retrieval.ids, recordIds('learning_track', 'CS'))
  kind(answerAssistant('من هم دفعة Tech Elite؟', history, scope), 'identity')
})
test('local answers never touch a broken network', () => {
  const original = global.fetch
  let calls = 0
  global.fetch = () => { calls++; throw new TypeError('Failed to fetch') }
  try {
    for (const question of ['من هم دفعة Tech Elite؟', 'عطني مسارات IT', 'عطني مسارات CS', 'كيف أصل لبوت الدفعة؟']) assert.ok(answerAssistant(question, [], scope))
    assert.equal(calls, 0)
  } finally { global.fetch = original }
})
test('technical reasoning requires the model while learning roadmap stays local', () => {
  assert.equal(answerAssistant('اشرح SQL وNoSQL', [], scope), null)
  assert.equal(answerAssistant('اشرح مهارات الحاسوب IT', [], scope), null)
  const roadmap = kind(answerAssistant('كيف أتعلم Full Stack؟', [], scope), 'roadmap_stage')
  assert.deepEqual(roadmap.retrieval.ids, fullstackStages.map(stage => 'roadmap:' + stage.id))
  assert.ok(assistantContext('اشرح SQL وNoSQL', [], scope).includes(siteConfig.batchName))
})
test('an unregistered major cannot borrow tracks or skill courses', () => {
  for (const question of ['عطني مسارات تخصص الهندسة الكهربائية', 'عطني مسارات SE']) {
    const answer = kind(answerAssistant(question, [], scope), 'learning_track')
    assert.equal(answer.retrieval.status, 'empty')
    assert.deepEqual(answer.retrieval.ids, [])
    assert.doesNotMatch(answer.text, /مهارات الحاسوب|مهارات الاتصال/)
  }
})
test('a supported major with no registered tracks returns an empty local result', () => {
  const original = [...siteRecords]
  siteRecords.splice(0, siteRecords.length, ...siteRecords.filter(record => record.kind !== 'learning_track' || record.major !== 'CS'))
  try {
    const answer = kind(answerAssistant('عطني مسارات CS', [], scope), 'learning_track')
    assert.equal(answer.retrieval.status, 'empty')
    assert.deepEqual(answer.retrieval.ids, [])
  } finally { siteRecords.splice(0, siteRecords.length, ...original) }
})
test('domain vocabulary cannot be fuzzy resolved as a course', () => {
  for (const question of ['عطني مسارات IT', 'مسارات CS', 'من هم Tech Elite']) assert.deepEqual(resolveAcademicCourses(question).matches, [])
  assert.equal(inferAssistantIntent('عطني مهارات الحاسوب IT'), null)
})
test('site snapshots survive truncation and unrelated topics clear them', () => {
  const first = answerAssistant('مسارات IT', [], scope)
  const saved = JSON.parse(JSON.stringify([{ author: 'assistant', ...first }]))
  kind(answerAssistant('و CS؟', saved, scope), 'learning_track')
  assert.equal(answerAssistant('CS', run(['مسارات IT', 'اشرح SQL']), scope), null)
  assert.equal(answerAssistant('CS', [{ author: 'assistant', text: '', siteState: { version: 1, intent: 'Unknown' } }], scope), null)
})
test('learning courses, bot and major details use original sources', () => {
  const coursesAnswer = kind(answerAssistant('عطني دورات', [], scope), 'learning_course')
  assert.deepEqual(coursesAnswer.retrieval.ids, learningCourses.map(course => 'learning:' + course.id))
  assert.deepEqual(coursesAnswer.links.map(link => link.url), [...new Set(learningCourses.map(course => course.url))])
  const bot = kind(answerAssistant('كيف أصل لبوت الدفعة؟', [], scope), 'bot')
  assert.equal(bot.links[0].url, 'https://t.me/' + siteConfig.telegramBotUsername.replace(/^@/, ''))
  const major = kind(answerAssistant('ما هو تخصص CS؟', [], scope), 'major')
  assert.deepEqual(major.retrieval.ids, ['major:CS'])
})
test('static source adapter respects typed arrays, comments, nested strings and icon identifiers', () => {
  const source = "const sample: { title: string }[] = [/* comment */ { title: 'عنوان { عربي }', description: 'نص، صحيح', icon: Code2, tags: ['a,b'] }]"
  const records = sourceRecords(source, 'sample', ['title', 'description'])
  assert.equal(records[0].title, 'عنوان { عربي }')
  assert.deepEqual(records[0].tags, ['a,b'])
  assert.equal(records[0].icon, undefined)
  assert.deepEqual(sourceParagraphs('<p>نص <strong>أصلي</strong></p><p>{dynamic}</p>'), ['نص أصلي'])
})
test('malformed or dynamic source refactors are detected instead of invented', () => {
  for (const source of ["const x = [{ title: 'unclosed }]", 'const x = [/*', 'const x = [...other]', 'const x = [{ title: dynamic }]', 'const y = []']) {
    assert.throws(() => sourceRecords(source, 'x', ['title']))
  }
  assert.throws(() => readSourceLiteral('const x = `text ${dynamic}`', 'x'))
})

for (const followup of ['علوم الحاسوب', 'وعلوم الحاسوب', 'و تقنية المعلومات', 'وتقنية المعلومات', 'تخصص CS']) {
  test('major names in Arabic retain the active learning intent: ' + followup, () => {
    const answer = kind(run(['عطني مسارات IT', followup]).at(-1), 'learning_track')
    const expected = /الحاسوب|CS/.test(followup) ? 'CS' : 'IT'
    assert.equal(answer.siteState.major, expected)
    assert.deepEqual(answer.retrieval.ids, recordIds('learning_track', expected))
  })
}
for (const question of ['عدد مسارات IT', 'ايش هي مسارات CS الموجودة عندكم؟', 'عطني جميع المسارات التعليمية IT']) {
  test('request modifiers do not become missing learning topics: ' + question, () => {
    const major = question.includes('CS') ? 'CS' : 'IT'
    const answer = kind(answerAssistant(question, [], scope), 'learning_track')
    assert.deepEqual(answer.retrieval.ids, recordIds('learning_track', major))
    assert.equal(answer.retrieval.status, 'found')
  })
}
for (const question of ['كم ساعات مادة تنظيم ومعمارية الحاسب IT', 'كم ساعات تنظيم ومعمارية الحاسب CS']) {
  test('course hours are course data rather than total program hours: ' + question, () => {
    const answer = answerAssistant(question, [], scope)
    assert.equal(answer.retrieval, undefined)
    assert.equal(answer.academicState.intent, 'CourseDetails')
    assert.equal(answer.academicState.course.courseName, 'تنظيم ومعمارية الحاسب')
    const major = question.includes('CS') ? 'CS' : 'IT'
    assert.equal(answer.academicState.major, major)
  })
}
for (const question of ['ما هو IT؟', 'ماهو CS؟']) {
  test('a simple major definition is a local source fact: ' + question, () => kind(answerAssistant(question, [], scope), 'major'))
}
test('library access accepts the Arabic preposition attached to its noun', () => {
  const answer = kind(answerAssistant('كيف أصل لمكتبة الملازم؟', [], scope), 'section')
  assert.equal(answer.destination, 'library')
})
test('a general programmer question cannot claim the site developer identity', () => {
  const answer = answerAssistant('من هو مبرمج بلغة Python', [], scope)
  assert.equal(answer, null)
})
for (const [question, expected] of [['اشرح لي من هم دفعة Tech Elite', 'identity'], ['فهمني عن الموقع', 'section'], ['اشرح فلسفة شعارنا', 'logo']]) {
  test('explanation verbs preserve unambiguous local site facts: ' + question, () => kind(answerAssistant(question, [], scope), expected))
}
test('a graduation course stays distinct from published cohort projects', () => {
  const course = courses.find(course => course.name === 'مشروع التخرج 1')
  const answer = answerAssistant('ملازم مشروع التخرج 1 IT', [], scope)
  assert.equal(answer.retrieval, undefined)
  assert.equal(answer.academicState.course.courseId, course.id)
})
