require('./assistant-source-loader.cjs')
// Run: node tests/assistant-resource-groups.test.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const originalJS = require.extensions['.js']
function compile(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename)
}
require.extensions['.ts'] = compile
require.extensions['.tsx'] = compile
require.extensions['.css'] = () => {}
require.extensions['.js'] = (module, filename) =>
  filename.startsWith(path.join(process.cwd(), 'src') + path.sep) ? compile(module, filename) : originalJS(module, filename)

const { answerAssistant } = require('../src/assistant-router.ts')
const { getCourseResourceGroup } = require('../src/smart-academic-search.ts')
const { courses } = require('../src/data.ts')
const { csAllCourses } = require('../src/cs-plan-data.ts')
const { telegramMaterials, getAllCourseResources } = require('../src/telegram-materials.ts')
const scope = { major: 'all', year: 'all', semester: 'all' }
const archiveCourse = courses.find(course => course.name === 'تنظيم ومعمارية الحاسب')
assert.ok(archiveCourse, 'the regression course must come from the actual site catalog')

let passed = 0
function test(name, run) {
  run()
  passed++
  console.log('PASS', name)
}
function groups(answer) {
  assert.ok(answer, 'expected a factual assistant answer')
  assert.equal(answer.links?.length || 0, 0, 'course resources must not be flattened into message.links')
  assert.ok(Array.isArray(answer.resourceGroups), 'expected structured course resource groups')
  return answer.resourceGroups
}
function resources(answer) {
  return (answer?.resourceGroups || []).flatMap(group => group.resources)
}
function assertOwnership(answer) {
  for (const group of groups(answer)) {
    const catalog = group.major === 'IT' ? courses : csAllCourses
    const course = catalog.find(course => course.id === group.courseId)
    assert.ok(course, 'each resource group must identify a real course in its own major')
    assert.equal(group.courseName, course.name)
    assert.equal(group.year, course.year)
    assert.equal(group.semester, course.semester)
    for (const resource of group.resources) {
      assert.ok(getAllCourseResources(course).some(source =>
        source.title === resource.title && source.url === resource.sourceUrl && source.kind === resource.kind),
      'each title, source URL and kind must belong to the grouped course')
      assert.match(resource.url, /^https:\/\//)
      const payload = new URL(resource.url).searchParams.get('start')
      if (payload) {
        const messageId = new URL(resource.sourceUrl).pathname.split('/').filter(Boolean).at(-1)
        assert.equal(payload, 'm_' + course.id + '_' + messageId, 'bot delivery must retain the course owner')
      } else {
        assert.equal(resource.url, resource.sourceUrl, 'public resources retain their original indexed URL')
      }
    }
  }
}
function assertSelection(answer, major, year, semester) {
  assertOwnership(answer)
  const expected = (major === 'IT' ? courses : csAllCourses)
    .filter(course => course.year === year && (semester === undefined || course.semester === semester))
  assert.deepEqual(groups(answer).map(group => group.courseId).sort(), expected.map(course => course.id).sort())
  let sawEmpty = false
  for (const group of groups(answer)) {
    if (!group.resources.length) sawEmpty = true
    else assert.equal(sawEmpty, false, 'courses with files must precede courses without files')
  }
  assert.equal(answer.text.trim().split('\n').length, 1, 'broad answer text must be a short introduction')
}
function fromPlan(question = 'لا أريد الخطة، أريد الملازم') {
  const prompt = 'عطني مواد المستوى الثاني IT'
  const plan = answerAssistant(prompt, [], scope)
  return answerAssistant(question, [
    { author: 'student', text: prompt },
    { author: 'assistant', ...plan },
  ], scope)
}

test('plan correction keeps archive lectures attached to the second-level IT course', () => {
  const answer = fromPlan()
  assertSelection(answer, 'IT', 2)
  const owner = groups(answer).find(group => group.courseId === archiveCourse.id)
  assert.ok(owner.resources.length)
  assert.deepEqual(owner.resources.map(resource => resource.title),
    telegramMaterials[archiveCourse.id].map(resource => resource.title))
  assert.equal(groups(answer)[0].courseId, archiveCourse.id)
  assert.doesNotMatch(answer.text, /لا أريد أن أختلق|يمكنك فتح المكتبة|لكن لا توجد/)
})
test('direct level resource request preserves each course and semester', () =>
  assertSelection(answerAssistant('ملازم المستوى الثاني IT', [], scope), 'IT', 2))
test('all-materials wording uses the complete level selection', () =>
  assertSelection(answerAssistant('عطني جميع ملازم المستوى الثاني IT', [], scope), 'IT', 2))
test('selected controls support a generic resource request', () =>
  assertSelection(answerAssistant('عطني الملازم', [], { major: 'IT', year: 2, semester: 'all' }), 'IT', 2))
test('explicit semester filters the grouped level selection', () =>
  assertSelection(answerAssistant('ملازم المستوى الثاني IT الفصل الأول', [], scope), 'IT', 2, 1))
test('selected semester filters every group before files are collected', () =>
  assertSelection(answerAssistant('عطني الملازم', [], { major: 'IT', year: 2, semester: 2 }), 'IT', 2, 2))
test('single-course request uses the same source-backed resource groups', () => {
  const answer = answerAssistant('ملازم تنظيم ومعمارية الحاسب IT', [], scope)
  assertOwnership(answer)
  assert.equal(groups(answer).length, 1)
  assert.equal(groups(answer)[0].courseId, archiveCourse.id)
  assert.equal(groups(answer)[0].resources.length, telegramMaterials[archiveCourse.id].length)
})
test('single first lecture returns only its original title and source', () => {
  const answer = answerAssistant('المحاضرة الأولى تنظيم ومعمارية الحاسب IT', [], scope)
  assertOwnership(answer)
  assert.equal(groups(answer).length, 1)
  assert.deepEqual(resources(answer).map(resource => resource.title), ['المحاضرة الأولى'])
  assert.equal(resources(answer)[0].sourceUrl, telegramMaterials[archiveCourse.id][0].url)
})
test('single second lecture remains attached to the same source course', () => {
  const answer = answerAssistant('المحاضرة الثانية تنظيم ومعمارية الحاسب IT', [], scope)
  assertOwnership(answer)
  assert.deepEqual(resources(answer).map(resource => resource.title), ['المحاضرة الثانية'])
  assert.equal(resources(answer)[0].sourceUrl, telegramMaterials[archiveCourse.id][1].url)
})
test('missing lecture invents no title or link', () => {
  const answer = answerAssistant('المحاضرة 99 تنظيم ومعمارية الحاسب IT', [], scope)
  assert.equal(answer.links?.length || 0, 0)
  assert.equal(resources(answer).length, 0)
  assert.match(answer.text, /لا توجد.*99/)
})
test('unknown subject does not reuse the previous course files', () => {
  const previous = answerAssistant('ملازم تنظيم ومعمارية الحاسب IT', [], scope)
  const answer = answerAssistant('محاضرات فيزياء الحاسب IT', [
    { author: 'student', text: 'ملازم تنظيم ومعمارية الحاسب IT' },
    { author: 'assistant', ...previous },
  ], scope)
  assert.equal(answer.links?.length || 0, 0)
  assert.equal(resources(answer).length, 0)
})

// Render actual stored messages using isolated hooks, as in the quota regression tests.
const realReact = require('react')
let saved = [], hookIndex = 0
const hooks = {
  ...realReact,
  useEffect: () => {},
  useRef: value => ({ current: value }),
  useState: initial => {
    hookIndex++
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
}
const originalLoad = Module._load
const originalWindow = global.window
const originalStorage = global.localStorage
Module._load = function(name, ...rest) {
  return name === 'react' ? hooks : originalLoad.call(this, name, ...rest)
}
global.window = { location: { hostname: 'localhost' }, setTimeout, clearTimeout }
global.localStorage = {
  getItem: key => key === 'te-academic-chat-v5' ? JSON.stringify(saved) : null,
}
const SiteAssistant = require('../src/SiteAssistant.tsx').default
function children(node) {
  return [node?.props?.children].flat(Infinity).filter(child => child !== null && child !== undefined && child !== false)
}
function walk(node) {
  if (!node || typeof node !== 'object') return []
  if (typeof node.type === 'function') return walk(node.type(node.props))
  return [node, ...children(node).flatMap(walk)]
}
function textContent(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node !== 'object') return String(node)
  return children(node).map(textContent).join('')
}
function render(answer) {
  saved = [{ id: 1, author: 'assistant', ...answer }]
  hookIndex = 0
  const tree = SiteAssistant({ onNavigate: () => {} })
  const content = walk(tree).find(node => node.props?.className === 'te-chat-content')
  assert.ok(content)
  return content
}
function assertRenderedOwnership(answer) {
  const content = render(answer)
  const nodes = walk(content)
  const rendered = nodes.filter(node => node.props?.role === 'group')
  const populated = groups(answer).filter(group => group.resources.length)
  assert.equal(rendered.length, populated.length)
  populated.forEach((group, index) => {
    const renderedGroup = rendered[index]
    const label = renderedGroup.props['aria-label']
    for (const part of [group.courseName, group.major, 'المستوى ' + group.year, 'الفصل ' + group.semester]) {
      assert.ok(label.includes(part), 'the displayed group label must preserve its course and scope')
    }
    const groupNodes = walk(renderedGroup)
    const heading = groupNodes.find(node => node.type === 'p')
    const anchors = groupNodes.filter(node => node.type === 'a')
    assert.ok(textContent(heading).includes(group.courseName))
    assert.ok(groupNodes.indexOf(heading) < groupNodes.indexOf(anchors[0]), 'the heading must precede its resource links')
    assert.deepEqual(anchors.map(anchor => anchor.props.href), group.resources.map(resource => resource.url))
    assert.deepEqual(anchors.map(textContent), group.resources.map(resource => resource.title))
  })
  assert.equal(nodes.filter(node => node.type === 'a').length, resources(answer).length, 'group links must not also render as a separate flat list')
  const empty = groups(answer).filter(group => !group.resources.length)
  const summaries = nodes.filter(node => node.type === 'p' && textContent(node).includes('لا توجد ملفات قابلة للفتح'))
  assert.equal(summaries.length, empty.length ? 1 : 0, 'all empty courses share one summary')
  if (empty.length) {
    assert.equal(textContent(summaries[0]).includes('\n'), false, 'the missing-materials summary remains one line')
    for (const group of empty) assert.ok(textContent(summaries[0]).includes(group.courseName))
    for (const renderedGroup of rendered) {
      assert.ok(nodes.indexOf(summaries[0]) > nodes.indexOf(renderedGroup), 'missing courses must follow all groups with files')
    }
  }
  return { content, rendered }
}

function withFixtures(run) {
  const first = courses.find(course => course.year === 2 && course.semester === 1 && course.id !== archiveCourse.id)
  const second = courses.find(course => course.year === 2 && course.semester === 2 && course.id !== archiveCourse.id)
  const sharedIT = courses.find(course => csAllCourses.some(other => other.name === course.name))
  const sharedCS = csAllCourses.find(course => course.name === sharedIT?.name)
  assert.ok(first && second && sharedIT && sharedCS)
  const sharedUrl = 'https://materials.example.test/shared.pdf'
  const fixtures = [
    [first, [
      { title: 'المحاضرة الأولى', kind: 'ملزمة PDF', url: sharedUrl },
      { title: 'المحاضرة الثانية', kind: 'ملزمة نظري', url: 'https://materials.example.test/first-course.pdf' },
      { title: 'المحاضرة الأولى عملي', kind: 'ملزمة عملي', url: 'https://materials.example.test/practical.pdf' },
      { title: 'محاضرة غير قابلة للفتح', kind: 'ملزمة PDF', url: 'javascript:alert(1)' },
    ]],
    [second, [
      { title: 'المحاضرة الأولى', kind: 'ملزمة PDF', url: sharedUrl },
      { title: 'المحاضرة الثانية', kind: 'ملزمة نظري', url: 'https://materials.example.test/second-course.pdf' },
    ]],
    [sharedIT, [{ title: 'المحاضرة الأولى', kind: 'ملزمة PDF', url: sharedUrl }]],
    [sharedCS, [{ title: 'المحاضرة الأولى', kind: 'ملزمة PDF', url: sharedUrl }]],
  ]
  const originals = new Map()
  for (const [course, additions] of fixtures) {
    if (!originals.has(course.id)) originals.set(course.id, telegramMaterials[course.id])
    telegramMaterials[course.id] = [...(telegramMaterials[course.id] || []), ...additions]
  }
  try { run({ first, second, sharedIT, sharedCS, sharedUrl }) }
  finally {
    for (const [id, original] of originals) {
      if (original === undefined) delete telegramMaterials[id]
      else telegramMaterials[id] = original
    }
  }
}

try {
  test('actual restored chat renders archive links under the course and missing courses last', () =>
    assertRenderedOwnership(fromPlan()))
  test('single lecture renders directly beneath its own heading', () =>
    assertRenderedOwnership(answerAssistant('المحاضرة الأولى تنظيم ومعمارية الحاسب IT', [], scope)))
  test('a level with no files renders one compact summary and no resource links', () => {
    const answer = answerAssistant('ملازم المستوى الثاني CS', [], scope)
    assertSelection(answer, 'CS', 2)
    assert.equal(resources(answer).length, 0)
    assertRenderedOwnership(answer)
  })
  withFixtures(({ first, second, sharedIT, sharedCS, sharedUrl }) => {
    test('multi-course selection retains repeated titles and shared URLs under both course owners', () => {
      const answer = answerAssistant('ملازم المستوى الثاني IT', [], scope)
      assertSelection(answer, 'IT', 2)
      const firstGroup = groups(answer).find(group => group.courseId === first.id)
      const secondGroup = groups(answer).find(group => group.courseId === second.id)
      assert.ok(firstGroup.resources.some(resource => resource.url === sharedUrl && resource.title === 'المحاضرة الأولى'))
      assert.ok(secondGroup.resources.some(resource => resource.url === sharedUrl && resource.title === 'المحاضرة الأولى'))
      assert.ok(firstGroup.resources.some(resource => resource.url.endsWith('/first-course.pdf')))
      assert.ok(secondGroup.resources.some(resource => resource.url.endsWith('/second-course.pdf')))
      assert.equal(firstGroup.resources.some(resource => resource.url.endsWith('/second-course.pdf')), false)
      assert.equal(secondGroup.resources.some(resource => resource.url.endsWith('/first-course.pdf')), false)
      assert.equal(resources(answer).some(resource => resource.url.startsWith('javascript:')), false)
      assertRenderedOwnership(answer)
    })
    test('shared course names and URLs retain their own major and course identity', () => {
      for (const [course, major] of [[sharedIT, 'IT'], [sharedCS, 'CS']]) {
        const group = getCourseResourceGroup(course, major)
        const answer = { text: 'ملازم المادة', resourceGroups: [group] }
        assertOwnership(answer)
        assert.equal(group.courseId, course.id)
        assert.equal(group.major, major)
        assert.ok(group.resources.some(resource => resource.url === sharedUrl))
        assertRenderedOwnership(answer)
      }
    })
    test('resource type filtering still uses indexed course resources', () => {
      const group = getCourseResourceGroup(first, 'IT', 'ملازم عملي')
      assert.equal(group.resources.length, 1)
      assert.equal(group.resources[0].title, 'المحاضرة الأولى عملي')
      assert.equal(group.resources[0].sourceUrl, 'https://materials.example.test/practical.pdf')
    })
    test('multiple populated semesters remain filtered by explicit request', () => {
      const answer = answerAssistant('ملازم المستوى الثاني IT الفصل الأول', [], scope)
      assertSelection(answer, 'IT', 2, 1)
      assert.ok(groups(answer).some(group => group.courseId === first.id && group.resources.length))
      assert.equal(groups(answer).some(group => group.courseId === second.id), false)
      assertRenderedOwnership(answer)
    })
  })
  test('non-course links such as learning courses still render unchanged', () => {
    const answer = answerAssistant('عطني دورات', [], scope)
    assert.ok(answer.links?.length)
    assert.equal(answer.resourceGroups?.length || 0, 0)
    const nodes = walk(render(answer))
    assert.equal(nodes.filter(node => node.props?.role === 'group').length, 0)
    assert.deepEqual(nodes.filter(node => node.type === 'a').map(node => node.props.href), answer.links.map(link => link.url))
  })
  console.log('PASS ' + passed + ' course grouping, source ownership and chat rendering checks')
} finally {
  Module._load = originalLoad
  global.window = originalWindow
  global.localStorage = originalStorage
}
