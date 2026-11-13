/**
 * Assistant adapters over canonical site data and private literals embedded in pages.
 * Raw imports are bundled by Vite; no runtime network, filesystem access or eval.
 * Page content stays in its original files. Required-field checks expose source refactors.
 */
import trackSource from './TrackCollections.tsx?raw'
import identitySource from './CohortIdentity.tsx?raw'
import appSource from './App.tsx?raw'
import csSource from './CsOverview.tsx?raw'
import logoSource from './LogoPhilosophy.tsx?raw'
import { courses, learningTracks, siteConfig } from './data'
import { csAllCourses, csProgram } from './cs-plan-data'
import { learningCourses } from './learning-paths-data'
import { fullstackStages } from './fullstack-guide-data'
import { laptopTiers } from './laptop-buying-data'
import { cohortMembers } from './cohort-members-data'
import { graduationProjects, graduationProjectBotUrl, publishedProjectDocuments } from './graduation-projects-data.js'
import { getAllCourseResources, archiveMessageId } from './telegram-materials'
import { getBotUrl, getMaterialBotUrl } from './telegram-links'

type StaticValue = string | number | boolean | null | undefined | StaticValue[] | { [key: string]: StaticValue }
type Token = { kind: 'string' | 'word' | 'punct' | 'end'; value: string }
/** Read only static literals. Identifiers such as icon names are opaque, never executed. */
export function readSourceLiteral(source: string, name: string): StaticValue {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const declaration = new RegExp(`^\\s*(?:export\\s+)?const\\s+${safeName}\\s*(?::[^=]+)?=\\s*`, 'm').exec(source)
  if (!declaration) throw new Error(`Missing source declaration: ${name}`)
  let at = declaration.index + declaration[0].length
  const fail = (): never => { throw new Error(`Unsupported or malformed ${name} source near ${at}`) }
  function lex(): Token {
    while (at < source.length) {
      if (/\s/.test(source[at])) { at++; continue }
      if (source.startsWith('//', at)) { const end = source.indexOf('\n', at + 2); at = end < 0 ? source.length : end + 1; continue }
      if (source.startsWith('/*', at)) { const end = source.indexOf('*/', at + 2); if (end < 0) fail(); at = end + 2; continue }
      break
    }
    if (at >= source.length) return { kind: 'end', value: '' }
    const quote = source[at]
    if (quote === "'" || quote === '"' || quote === '`') {
      at++; let value = ''
      while (at < source.length) {
        const char = source[at++]
        if (char === quote) return { kind: 'string', value }
        if (quote === '`' && char === '$' && source[at] === '{') fail()
        if (char !== '\\') { value += char; continue }
        if (at >= source.length) fail()
        const escaped = source[at++]
        if (escaped === '\n') continue
        if (escaped === '\r') { if (source[at] === '\n') at++; continue }
        if (escaped === 'u' || escaped === 'x') {
          const brace = escaped === 'u' && source[at] === '{'
          const end = brace ? source.indexOf('}', ++at) : at + (escaped === 'u' ? 4 : 2)
          const hex = source.slice(at, end)
          if (end < at || !/^[\da-f]+$/i.test(hex) || (!brace && hex.length !== (escaped === 'u' ? 4 : 2))) fail()
          const point = Number.parseInt(hex, 16); if (point > 0x10ffff) fail()
          value += String.fromCodePoint(point); at = end + (brace ? 1 : 0); continue
        }
        const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' }
        value += escapes[escaped] ?? escaped
      }
      return fail()
    }
    const word = /^[\p{L}\p{N}_$]+/u.exec(source.slice(at))
    if (word) { at += word[0].length; return { kind: 'word', value: word[0] } }
    return { kind: 'punct', value: source[at++] }
  }
  let pending: Token | undefined
  const peek = () => pending ??= lex()
  const take = () => { const token = peek(); pending = undefined; return token }
  const expect = (value: string) => { if (take().value !== value) fail() }
  function read(): StaticValue {
    const token = take()
    if (token.kind === 'string') return token.value
    if (token.value === '[') {
      const rows: StaticValue[] = []
      while (peek().value !== ']') { rows.push(read()); if (peek().value !== ',') break; take() }
      expect(']'); return rows
    }
    if (token.value === '{') {
      const row: Record<string, StaticValue> = Object.create(null)
      while (peek().value !== '}') {
        const key = take(); if (!['word', 'string'].includes(key.kind)) fail()
        expect(':'); row[key.value] = read()
        if (peek().value !== ',') break; take()
      }
      expect('}'); return row
    }
    if (token.kind !== 'word') return fail()
    if (/^\d+$/.test(token.value)) return Number(token.value)
    if (token.value === 'true' || token.value === 'false') return token.value === 'true'
    if (token.value === 'null') return null
    return undefined
  }
  return read()
}
export function sourceRecords(source: string, name: string, required: string[]) {
  const literal = readSourceLiteral(source, name)
  const rows = Array.isArray(literal) ? literal : [literal]
  return rows.map(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Expected ${name} source object`)
    for (const key of required) if (typeof value[key] !== 'string' || !(value[key] as string).trim()) throw new Error(`Missing ${name}.${key}`)
    return value
  })
}
const plain = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
export const sourceParagraphs = (source: string) => [...source.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
  .filter(match => !/[{}]/.test(match[1])).map(match => plain(match[1])).filter(Boolean)
const paragraphs = sourceParagraphs
export function sourceRegion(source: string, marker: string): string {
  const index = source.indexOf(marker)
  if (index < 0) throw new Error('Missing source region: ' + marker)
  return source.slice(index)
}
export type SiteRecordKind = 'identity' | 'section' | 'major' | 'learning_track' | 'curriculum_course' | 'course_resource' | 'learning_course' | 'roadmap_stage' | 'member' | 'graduation_project' | 'laptop_tier' | 'logo' | 'bot'
export type SiteRecord = {
  id: string; kind: SiteRecordKind; title: string; body: string; source: string
  major?: 'IT' | 'CS'; year?: number; semester?: 1 | 2; parentId?: string
  tags?: string[]; links?: { title: string; url: string }[]
}
const tracks = (major: 'IT' | 'CS', rows: readonly { title: string; description: string; english?: unknown; tags?: unknown }[], source: string): SiteRecord[] =>
  rows.map((row, index) => ({ id: `track:${major}:${index}`, kind: 'learning_track', major, title: row.title, body: row.description, source, tags: [String(row.english || ''), ...(Array.isArray(row.tags) ? row.tags.map(String) : [])] }))
const embeddedTracks = (name: string) => sourceRecords(trackSource, name, ['title', 'description']).map(row => ({ title: String(row.title), description: String(row.description), english: row.english, tags: row.tags }))
const routes = sourceRecords(appSource, 'routes', ['id', 'label'])
const botUrl = getBotUrl(siteConfig.telegramBotUsername)
const curriculum = [...courses.map(course => ({ course, major: 'IT' as const })), ...csAllCourses.map(course => ({ course, major: 'CS' as const }))]
export const siteSourceFiles: Partial<Record<SiteRecordKind, string[]>> = {
  learning_track: ['src/data.ts#learningTracks', 'src/TrackCollections.tsx#extraIt', 'src/TrackCollections.tsx#csTracks'],
  graduation_project: ['src/graduation-projects-data.js#graduationProjects'],
  learning_course: ['src/learning-paths-data.ts#learningCourses'],
  roadmap_stage: ['src/fullstack-guide-data.ts#fullstackStages'],
}
export const siteRecords: SiteRecord[] = [
  { id: 'identity:batch', kind: 'identity', title: siteConfig.batchName, body: `${paragraphs(identitySource)[0]} ${siteConfig.facultyName}.`, source: 'src/CohortIdentity.tsx + src/data.ts#siteConfig' },
  ...routes.map(row => ({ id: 'section:' + String(row.id), kind: 'section' as const, title: String(row.label), body: String(row.label), source: 'src/App.tsx#routes' })),
  { id: 'major:IT', kind: 'major', major: 'IT', title: String(routes.find(row => row.id === 'about')?.label), body: `${paragraphs(sourceRegion(appSource, 'ABOUT INFORMATION TECHNOLOGY')).slice(0, 2).join(' ')} الساعات المعلنة: ${siteConfig.announcedCreditHours}.`, source: 'src/App.tsx#about + src/data.ts#siteConfig' },
  { id: 'major:CS', kind: 'major', major: 'CS', title: csProgram.name, body: `${paragraphs(sourceRegion(csSource, 'ABOUT COMPUTER SCIENCE')).slice(0, 2).join(' ')} الساعات المعلنة: ${csProgram.announcedHours}، منها ${csProgram.electiveHours} اختيارية. ${csProgram.discrepancy}`, source: 'src/CsOverview.tsx + src/cs-plan-data.ts#csProgram' },
  ...tracks('IT', learningTracks, 'src/data.ts#learningTracks'),
  ...tracks('IT', embeddedTracks('extraIt'), 'src/TrackCollections.tsx#extraIt').map(row => ({ ...row, id: row.id + ':extra' })),
  ...tracks('CS', embeddedTracks('csTracks'), 'src/TrackCollections.tsx#csTracks'),
  ...learningCourses.map(course => ({ id: 'learning:' + course.id, kind: 'learning_course' as const, title: course.title, body: `${course.description} — ${course.provider}؛ ${course.credential}: ${course.credentialNote}${course.accessNote ? ' ' + course.accessNote : ''}`, tags: [course.category, course.provider, course.level], source: 'src/learning-paths-data.ts#learningCourses', links: [{ title: course.title, url: course.url }] })),
  ...fullstackStages.map(stage => ({ id: 'roadmap:' + stage.id, kind: 'roadmap_stage' as const, title: stage.title, body: `${stage.goal} المهارات: ${stage.skills.join('، ')}. التطبيق: ${stage.practice}`, tags: [stage.english], source: 'src/fullstack-guide-data.ts#fullstackStages', links: [...stage.resources, ...stage.tools].map(link => ({ title: link.title, url: link.url })) })),
  ...laptopTiers.map(tier => ({ id: 'laptop:' + tier.id, kind: 'laptop_tier' as const, title: tier.label, body: `${tier.specs.map(spec => spec.label + ': ' + spec.value).join('، ')}. ${tier.advice}`, source: 'src/laptop-buying-data.ts#laptopTiers' })),
  ...Object.entries(cohortMembers).flatMap(([role, members]) => members.map((person, index) => ({ id: `member:${role}:${index}`, kind: 'member' as const, title: person.name, body: person.role || '', tags: [role], source: 'src/cohort-members-data.ts#cohortMembers' }))),
  ...graduationProjects.map(project => {
    const url = graduationProjectBotUrl(siteConfig.telegramBotUsername, project.id)
    return { id: 'project:' + project.id, kind: 'graduation_project' as const, title: project.title, body: `${project.summary} — الفريق: ${project.team.join('، ')}`, source: 'src/graduation-projects-data.js#graduationProjects', links: url && publishedProjectDocuments(project).length ? [{ title: project.title, url }] : [] }
  }),
  { id: 'logo:philosophy', kind: 'logo', title: plain(logoSource.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] || ''), body: paragraphs(logoSource).join('\n'), source: 'src/LogoPhilosophy.tsx' },
  { id: 'bot:cohort', kind: 'bot', title: siteConfig.telegramBotUsername, body: botUrl ? `بوت الدفعة المسجل في الموقع: ${siteConfig.telegramBotUsername}. الملفات المسجلة من الأرشيف تُستلم من خلال البوت.` : 'رابط بوت الدفعة غير مسجل حاليًا في الموقع.', source: 'src/data.ts#siteConfig.telegramBotUsername', links: botUrl ? [{ title: 'فتح بوت الدفعة', url: botUrl }] : [] },
  ...curriculum.flatMap(({ course, major }): SiteRecord[] => {
    const id = `${major}:${course.id}`
    const source = major === 'IT' ? 'src/data.ts#courses' : 'src/cs-plan-data.ts#csAllCourses'
    return [
      { id, kind: 'curriculum_course', title: course.name, body: `${course.code}؛ ${major}، المستوى ${course.year}، الفصل ${course.semester}؛ ${course.creditHours} ساعات. ${course.description}`, major, year: course.year, semester: course.semester, tags: [course.english, ...course.topics], source },
      ...getAllCourseResources(course).map((resource, index): SiteRecord => {
        const message = archiveMessageId(resource.url)
        const url = message ? getMaterialBotUrl(siteConfig.telegramBotUsername, course.id, message) : /^https:\/\//i.test(resource.url) && !/^https:\/\/t\.me\/c\//i.test(resource.url) ? resource.url : null
        return { id: `${id}:resource:${index}`, kind: 'course_resource', parentId: id, major, year: course.year, semester: course.semester, title: resource.title, body: resource.kind, source: `${source} + src/telegram-materials.ts#getAllCourseResources`, links: url ? [{ title: resource.title, url }] : [] }
      }),
    ]
  }),
]
