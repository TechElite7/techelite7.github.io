require('./assistant-source-loader.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { test } = require('node:test')
const { renderToStaticMarkup } = require('react-dom/server')
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

const { default: AssistantMessageText } = require('../src/AssistantMessageText.tsx')
function children(node) { return [node?.props?.children].flat(Infinity).filter(child => child != null && child !== false) }
function walk(node) {
  if (!node || typeof node !== 'object') return []
  if (typeof node.type === 'function') return walk(node.type(node.props))
  return [node, ...children(node).flatMap(walk)]
}
function textContent(node) {
  if (node == null || typeof node === 'boolean') return ''
  return typeof node === 'object' ? children(node).map(textContent).join('') : String(node)
}
const render = text => AssistantMessageText({ text })
const elements = (node, type) => walk(node).filter(item => item.type === type)

test('long Arabic paragraphs and English-first lines retain RTL blocks and line breaks', () => {
  const paragraph = 'هذه فقرة عربية طويلة عن تخصصات الحاسب وطرق التعلم والتطبيق. '.repeat(12).trim()
  const text = paragraph + '\nFull Stack ضمن السطر العربي.\n\n' + paragraph
  const root = render(text)
  assert.equal(root.props.dir, 'rtl')
  const paragraphs = elements(root, 'p')
  assert.equal(paragraphs.length, 2)
  assert.equal(textContent(paragraphs[0]), paragraph + '\nFull Stack ضمن السطر العربي.')
  assert.equal(textContent(paragraphs[1]), paragraph)
  paragraphs.forEach(node => assert.equal(node.props.dir, 'rtl'))
})

test('IT/CS paths use semantic unordered, ordered and nested lists with preserved numbering', () => {
  const root = render('## مسارات IT وCS\n• IT — Full Stack\n• CS — الخوارزميات\n\n1. البداية\n   - DevOps\n   - ASP.NET Core\n3) التطبيق\n\n١. مرحلة عربية\n٢. مرحلة ثانية\n\nالخاتمة')
  assert.equal(elements(root, 'ul').length, 2)
  assert.equal(elements(root, 'ol').length, 1)
  assert.deepEqual(elements(root, 'li').map(node => node.props.value), [undefined, undefined, 1, undefined, undefined, 3, 1, 2])
  for (const node of walk(root).filter(node => ['ul', 'ol', 'li'].includes(node.type))) assert.equal(node.props.dir, 'rtl')
  assert.equal(textContent(elements(root, 'h2')[0]), 'مسارات IT وCS')
  assert.equal(textContent(elements(root, 'p').at(-1)), 'الخاتمة')
  assert.ok(!textContent(root).includes('•'))
  assert.deepEqual(elements(render('- أول\n* ثان\n+ ثالث'), 'li').map(textContent), ['أول', 'ثان', 'ثالث'])
})

test('mixed Arabic and English names are isolated intact without changing punctuation or order', () => {
  const text = 'Full Stack وDevOps مع ASP.NET Core، ثم IT وCS وC++ و.NET 8.'
  const root = render(text)
  assert.equal(textContent(root), text)
  const emphasis = render('***عنوان Full Stack***')
  assert.equal(textContent(emphasis), 'عنوان Full Stack')
  assert.equal(elements(emphasis, 'strong').length, 1)
  assert.equal(elements(emphasis, 'em').length, 1)
  const isolated = elements(root, 'bdi')
  for (const name of ['Full Stack', 'DevOps', 'ASP.NET Core', 'IT', 'CS', 'C++', '.NET 8']) {
    assert.ok(isolated.some(node => textContent(node) === name && node.props.dir === 'auto'), name)
  }
})

test('fenced and inline code stays LTR with original indentation, markers and newlines', () => {
  const code = 'const app = "ASP.NET Core";\n  // تعليق عربي\n- literal marker\n1. literal number\n**literal**'
  const root = render('شرح عربي\n\n```js\n' + code + '\n```\n\nاستخدم `npm run build` الآن.')
  const pre = elements(root, 'pre')[0]
  assert.equal(pre.props.dir, 'ltr')
  assert.equal(textContent(pre), code)
  assert.equal(elements(root, 'li').length, 0)
  assert.equal(elements(root, 'code').length, 2)
  elements(root, 'code').forEach(node => assert.equal(node.props.dir, 'ltr'))
  assert.equal(textContent(elements(root, 'code')[1]), 'npm run build')
  assert.equal(textContent(elements(render('~~~sh\nnpm run build\n~~~'), 'pre')[0]), 'npm run build')
})

test('lecture Markdown links and bare URLs stay clickable with intact href and escaped HTML', () => {
  const url = 'https://example.test/ASP.NET_Core_(guide)?major=IT&term=2'
  const root = render('[المحاضرة الأولى Full Stack](' + url + ')\nرابط: https://example.test/lecture.pdf،ثم نص عربي\n[غير آمن](javascript:alert(1))\n<script>alert(1)</script>')
  const links = elements(root, 'a')
  assert.deepEqual(links.map(node => node.props.href), [url, 'https://example.test/lecture.pdf'])
  assert.equal(textContent(links[0]), 'المحاضرة الأولى Full Stack')
  assert.ok(textContent(root).includes('،ثم نص عربي'))
  links.forEach(node => {
    assert.equal(node.props.target, '_blank')
    assert.equal(node.props.rel, 'noopener noreferrer')
  })
  const html = renderToStaticMarkup(root)
  assert.doesNotMatch(html, /<script|href="javascript:|onclick=/i)
})

test('partial streamed replies keep code blocks and list structure safe before completion', () => {
  const root = render('مقدمة\n\n```js\n  const value = 1;\n- not a list')
  assert.equal(textContent(elements(root, 'pre')[0]), '  const value = 1;\n- not a list')
  assert.equal(elements(root, 'ul').length, 0)
  assert.equal(elements(render('• Full Stack\n• Dev'), 'li').length, 2)
})

test('restored chat preserves student rendering and lecture ownership, destinations and stored content', () => {
  const realReact = require('react')
  const originalLoad = Module._load
  const originalWindow = global.window
  const originalStorage = global.localStorage
  const source = 'مسارات:\n• IT — Full Stack\n• CS — DevOps'
  const resourceURL = 'https://example.test/lecture.pdf?major=IT'
  const saved = [
    { id: 1, author: 'student', text: 'English student message' },
    { id: 2, author: 'assistant', text: source, destination: 'guide', button: 'خارطة Full Stack', followups: ['اشرح ASP.NET Core'],
      links: [{ title: 'دليل DevOps', url: 'https://example.test/guide' }],
      resourceGroups: [{ major: 'IT', courseId: 'fixture', courseName: 'برمجة ASP.NET Core', year: 2, semester: 1,
        resources: [{ title: 'المحاضرة الأولى Full Stack', url: resourceURL, sourceUrl: resourceURL }] }] },
  ]
  const before = JSON.stringify(saved)
  Module._load = function(name, ...rest) {
    return name === 'react' ? { ...realReact, useEffect: () => {}, useRef: value => ({ current: value }),
      useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] } : originalLoad.call(this, name, ...rest)
  }
  global.window = { location: { hostname: 'localhost' }, setTimeout, clearTimeout }
  global.localStorage = { getItem: key => key === 'te-academic-chat-v5' ? before : null }
  try {
    const SiteAssistant = require('../src/SiteAssistant.tsx').default
    const tree = SiteAssistant({ onNavigate: () => {} })
    const student = walk(tree).find(node => node.props?.className === 'te-chat-entry from-student')
    const assistant = walk(tree).find(node => node.props?.className === 'te-chat-entry from-bot')
    assert.equal(elements(student, 'p')[0].props.dir, 'auto')
    assert.equal(textContent(elements(student, 'p')[0]), saved[0].text)
    assert.equal(elements(student, 'ul').length, 0)
    assert.equal(elements(assistant, 'ul').length, 1)
    const group = walk(assistant).find(node => node.props?.role === 'group')
    assert.equal(textContent(elements(group, 'strong')[0]), 'برمجة ASP.NET Core')
    assert.equal(elements(group, 'a')[0].props.href, resourceURL)
    assert.equal(textContent(elements(group, 'a')[0]), 'المحاضرة الأولى Full Stack')
    assert.ok(elements(group, 'bdi').some(node => textContent(node) === 'ASP.NET Core'))
    assert.equal(JSON.stringify(saved), before)
  } finally {
    Module._load = originalLoad
    global.window = originalWindow
    global.localStorage = originalStorage
  }
})

test('all new CSS rules are confined to assistant message content', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/assistant-message-content.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const rule of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    for (const selector of rule[1].split(/,(?![^()]*\))/)) {
      assert.ok(selector.trim().startsWith('.te-chat-page .te-chat-entry.from-bot .te-chat-content'), selector)
    }
  }
  assert.doesNotMatch(css, /!important|(?:^|[;{])\s*(?:color|background|height|width)\s*:/m)
})
