import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowLeft, BookOpen, Bot, ExternalLink, LibraryBig, LoaderCircle, MessageCircle, Plus, Send, Sparkles } from 'lucide-react'
import './site-assistant.css'
import './site-assistant-polish.css'
import { TECH_ELITE_AI_ENDPOINT } from './tech-elite-ai-config'
import { findSiteAnswer, identifyAcademicCourse } from './site-assistant-knowledge'
import { buildWholeSiteContext, findWholeSiteAnswer } from './site-wide-knowledge'
import { findSmartAcademicAnswer } from './smart-academic-search'
import AcademicScopeControls from './AcademicScopeControls'
import { DEFAULT_SCOPE, routeAcademicQuestion, type AcademicContext, type AcademicScope } from './academic-intent'

type Destination = 'about' | 'cs' | 'plan' | 'library' | 'guide'
type LinkItem = { title: string; url: string }
type Message = {
  id: number
  author: 'student' | 'assistant'
  text: string
  links?: LinkItem[]
  destination?: Destination
  button?: string
  followups?: string[]
  courseId?: string
}
type LocalAnswer = Pick<Message, 'text' | 'links' | 'destination' | 'button' | 'followups' | 'courseId'>

const DAILY_LIMIT = 15
const STORAGE_CHAT = 'te-academic-chat-v5'
const STORAGE_LIMIT = 'te-academic-questions-v4'
const suggestions = ['عرّفني بدفعة Tech Elite', 'اشرح SQL وNoSQL', 'مواد المستوى الثاني IT', 'المحاضرة الأولى تنظيم ومعمارية الحاسب', 'الفرق بين IT وCS', 'كيف أختار تخصصي؟']
const aiEnabled = /^https:\/\/[^\s]+$/i.test(TECH_ELITE_AI_ENDPOINT.trim()) || /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(TECH_ELITE_AI_ENDPOINT.trim())
const todayKey = () => new Date().toLocaleDateString('en-CA')
const nextId = () => Date.now() * 1000 + Math.floor(Math.random() * 999)

/** Make model Markdown readable as plain text without displaying formatting markers.
 * Only used for presentation. Stored messages remain unchanged for AI follow-ups.
 * React will escape the result as text; never inject model HTML into the page.
 */
export function cleanAssistantText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*```[^\n]*$/gm, '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\*\*\*([^*\n]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}


function savedMessages(): Message[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CHAT) || '[]')
    return Array.isArray(saved) ? saved.slice(-30).filter((m: Message) => m &&
      (m.author === 'student' || m.author === 'assistant') && typeof m.text === 'string' && m.text.length <= 3200 &&
      typeof m.id === 'number') : []
  } catch { return [] }
}
function usedToday(): number {
  try {
    const obj = JSON.parse(localStorage.getItem(STORAGE_LIMIT) || 'null')
    return obj?.day === todayKey() && Number.isInteger(obj.used) ? Math.min(DAILY_LIMIT, Math.max(0, obj.used)) : 0
  } catch { return 0 }
}
function localAnswer(question: string): LocalAnswer | null {
  const q = question.toLowerCase()
  if (/\b(it|cs)\b/i.test(question) && /فرق|مقارنه|الافضل|اختيار/.test(question)) return {
    text: 'IT يميل إلى تطبيق التقنيات والشبكات والأنظمة، وCS يتعمق في أسس الحوسبة والخوارزميات. لكن الفرق الحقيقي يعتمد على خطة الجامعة. تحب أكثر بناء التطبيقات وإدارة الأنظمة، أم حل مسائل الخوارزميات والرياضيات؟',
    destination: 'plan', button: 'قارن الخطتين', followups: ['اعرض خطة IT', 'اعرض خطة CS'],
  }
  if (/مكتبه|ملازم|ملفات|محاضرات/.test(q) && !identifyAcademicCourse(question)) return {
    text: 'الملازم موجودة في المكتبة. إذا تقصد محاضرة معيّنة، اكتب اسم المادة ورقم المحاضرة، وسأبحث لك عن رابطها المسجل في الموقع. مثال: «المحاضرة الأولى تنظيم ومعمارية الحاسب».',
    destination: 'library', button: 'فتح المكتبة', followups: ['المحاضرة الأولى تنظيم ومعمارية الحاسب'],
  }
  if (/اختار تخصص|اختيار التخصص|انسب تخصص|محتار/.test(q)) return {
    text: 'خلّينا نحدد ميولك بدل أن أختار عشوائيًا: هل تستمتع أكثر بالخوارزميات والتفكير الرياضي أم ببناء تطبيقات وإدارة شبكات وأنظمة؟ جاوبني، وسأساعدك بالمقارنة. يوجد كذلك اختبار ميول استرشادي أسفل المحادثة.',
    destination: 'plan', button: 'فتح الخطة', followups: ['أحب البرمجة وبناء التطبيقات', 'أحب الخوارزميات والرياضيات'],
  }
  return null
}

/** Parse SSE tokens as they arrive. A fallback to /chat supports older deployed Workers. */
async function streamAnswer(endpoint: string, payload: object, signal: AbortSignal, onText: (text: string) => void): Promise<string> {
  const base = endpoint.replace(/\/$/, '')
  const headers = { 'Content-Type': 'application/json' }
  let response = await fetch(`${base}/chat/stream`, { method: 'POST', headers, body: JSON.stringify(payload), signal })
  if (response.status === 404) {
    response = await fetch(`${base}/chat`, { method: 'POST', headers, body: JSON.stringify(payload), signal })
  }
  if (!response.ok) {
    let error = 'تعذر الحصول على إجابة من الخدمة.'
    try { const data = await response.json() as { error?: string }; error = data.error || error } catch { /* not JSON */ }
    throw Error(error)
  }
  if (!response.headers.get('content-type')?.includes('text/event-stream')) {
    const data = await response.json() as { answer?: string }
    if (!data.answer) throw Error('لم يصل نص من الذكاء الاصطناعي.')
    onText(data.answer)
    return data.answer
  }
  if (!response.body) throw Error('المتصفح لم يستقبل بث الإجابة.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', full = ''
  function receive(block: string) {
    for (const line of block.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const json = JSON.parse(data) as { response?: string; error?: string; choices?: { delta?: { content?: string } }[] }
        if (typeof json.error === 'string') throw Error(json.error)
        const chunk = json.response || json.choices?.[0]?.delta?.content || ''
        if (chunk) { full = (full + chunk).slice(0, 16000); onText(full) }
      } catch (error) { if (error instanceof Error && error.message !== 'Unexpected token') {
        // malformed JSON chunks should not destroy an otherwise valid stream
        if (data.includes('"error"')) throw error
      } }
    }
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''
      for (const part of parts) receive(part)
    }
    buffer += decoder.decode().replace(/\r\n/g, '\n')
    if (buffer.trim()) receive(buffer)
  } finally { reader.releaseLock() }
  if (!full.trim()) throw Error('لم يرجع النموذج نصًا واضحًا.')
  return full
}

export default function SiteAssistant({ onNavigate }: { onNavigate: (destination: Destination) => void }) {
  const [messages, setMessages] = useState<Message[]>(savedMessages)
  const [used, setUsed] = useState(usedToday)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<AcademicScope>(DEFAULT_SCOPE)
  const academicContextRef = useRef<AcademicContext>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pendingRef = useRef(false)
  const started = messages.length > 0
  const remaining = Math.max(0, DAILY_LIMIT - used)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CHAT, JSON.stringify(messages.slice(-30))) } catch { /* private browsing */ }
  }, [messages])
  useEffect(() => { try { localStorage.setItem(STORAGE_LIMIT, JSON.stringify({ day: todayKey(), used })) } catch { /* private browsing */ } }, [used])
  useEffect(() => {
    const refresh = () => setUsed(usedToday())
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 60_000)
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer) }
  }, [])
  useEffect(() => { if (started) boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, started, busy])

  async function ask(value: string) {
    const question = value.trim()
    if (!question || pendingRef.current) return
    pendingRef.current = true
    setBusy(true)
    setError('')
    const prior = messages.slice(-10)
    const lastAssistant = [...prior].reverse().find(m => m.author === 'assistant')
    const lastQuestion = [...prior].reverse().find(m => m.author === 'student')?.text || ''
    // Carry a subject only from a recent file-related exchange; never from an
    // unrelated earlier message or as a substitute for a new subject name.
    // Reuse only the subject of the LAST assistant reply if it answered a
    // file question. An older lecture cannot leak into a new, unresolved topic.
    const lastWasLecture = /ملزم|محاضر|محاضره|ملف|pdf|مذكره|سلايد/i.test(lastQuestion)
    const courseContext = lastWasLecture ? lastAssistant?.courseId : undefined
    // Complete the requested subject only when we JUST asked for a clarification.
    // One-word answers like «الأولى» or «IT» should work too.
    const clarificationRequested = !!(lastAssistant && /اكتب اسم المادة|أي واحد تقصد|تقصد IT أم CS|حدد IT أو CS|أي تخصص تقصد|اختر اسم المادة|أكثر من مقرر/.test(lastAssistant.text)
      && /ملزم|محاضر|محاضره|ملف|pdf|مذكره|سلايد/i.test(lastQuestion))
    const quickAnswer = /^(?:1|2|الاولى|الاولي|الاول|الثانيه|الثانية|الثاني|it|cs)$/i.test(question.trim())
    const completingLecture = clarificationRequested && (quickAnswer || !!identifyAcademicCourse(question))
    const clarification = quickAnswer ? question.trim().replace(/^(?:الاولى|الاولي|الاول)$/i, '1').replace(/^(?:الثانيه|الثانية|الثاني)$/i, '2') : question
    const lookupQuestion = completingLecture ? `${lastQuestion} ${clarification}` : question
    const student: Message = { id: nextId(), author: 'student', text: question }
    const assistantId = nextId() + 10
    setMessages(previous => [...previous, student].slice(-40))
    setQuery('')
    try {
      // Deterministic file lookup is intentional: AI must NEVER invent lecture URLs.
      // Other questions are passed to the real model when configured, so students can ask follow-ups.
      const wantsExplanation = /(?:اشرح|فسر|فهمني|علمني|بمثال|مع مثال|لماذا|ليش|وضح|كيف يعمل|كيف اشتغل|ابي افهم)/.test(question)
      // Smart, site-grounded route: first interpret explicit course, level, term, major.
      // Missing files and non-existent courses are answered using the current plan,
      // not sent to the generative model to guess a lecture URL.
      // Factual queries about the timetable or files remain grounded in the actual site,
      // even when students use "اشرح لي". Open-ended conceptual explanations go to AI.
      const factualAcademic = /(?:المستوى|المستوي|الترم|الفصل|مقررات|مواد|ملزم|ملازم|محاضره|محاضر|ملخص|اختبار|pdf)/.test(question)
      const conceptualExplanation = /(?:اشرح\s+(?:مفهوم|معنى)|كيف\s+(?:يعمل|اشتغل)|ليش|لماذا|ما\s+الفرق\s+بين)/.test(question)
      const majorQuizRequest = /(?:اختبار|اسئله|أسئلة)\s*(?:تحديد|اختيار|ميول).*تخصص/.test(question)
      // A strong page fact (laptop specifications, guide stages, people) takes precedence.
      // Do not confuse an aptitude quiz with an exam PDF request.
      // Academic follow-ups and selected filters take precedence over broad navigation.
      // Never block general technical AI questions with the academic filters.
      const routed = !majorQuizRequest ? routeAcademicQuestion(lookupQuestion, scope, {
        ...academicContextRef.current,
        previousCourseId: courseContext || academicContextRef.current.previousCourseId,
      }) : null
      const scopedAnswer = routed?.answer || null
      const siteInfo = !scopedAnswer ? (findWholeSiteAnswer(question) || (!wantsExplanation ? findSiteAnswer(question) : null)) : null
      const grounded = !scopedAnswer && !siteInfo && !majorQuizRequest && (!wantsExplanation || (factualAcademic && !conceptualExplanation))
        ? findSmartAcademicAnswer(lookupQuestion, courseContext) : null
      const predefined = !aiEnabled ? localAnswer(question) : null
      const verified = scopedAnswer || grounded || siteInfo || predefined
      if (verified) {
        const answer = verified as LocalAnswer
        const matchedCourse = identifyAcademicCourse(lookupQuestion)
        if (routed && scopedAnswer) academicContextRef.current = routed.context
        if (answer.courseId) academicContextRef.current = { ...academicContextRef.current, previousCourseId: answer.courseId }
        setMessages(previous => [...previous, { id: assistantId, author: 'assistant', ...answer, courseId: answer.courseId || matchedCourse?.course.id }])
        return
      }
      if (!aiEnabled) {
        setMessages(previous => [...previous, {
          id: assistantId, author: 'assistant',
          text: 'هذا السؤال يحتاج نموذج ذكاء اصطناعي كي أناقشه معك بشكل تفاعلي، وليس إجابة جاهزة. خدمة AI غير متصلة حاليًا. شغّل ai-worker محليًا ثم جرّب السؤال مرة ثانية. يمكنني الآن البحث في أسماء المواد وروابط المحاضرات المسجلة فقط.',
          destination: 'library', button: 'المكتبة',
          followups: ['مواد المستوى الثاني IT', 'المحاضرة الأولى تنظيم ومعمارية الحاسب'],
        }])
        return
      }
      if (remaining <= 0) {
        setMessages(previous => [...previous, { id: assistantId, author: 'assistant', text: 'استهلكت حصة الذكاء الاصطناعي اليوم (15 سؤالًا). يمكنك الاستمرار في طلب الملازم والبحث في الخطة والدفعة مجانًا، أو الرجوع غدًا لمتابعة الشرح التفاعلي.' }])
        return
      }
      // Only remote AI questions consume the per-browser allowance; local references stay free.
      setUsed(previous => Math.min(DAILY_LIMIT, previous + 1))
      setMessages(previous => [...previous, { id: assistantId, author: 'assistant', text: '' }])
      const abort = new AbortController()
      const timeout = window.setTimeout(() => abort.abort(), 120000)
      const history = prior.map(message => ({ role: message.author === 'student' ? 'user' : 'assistant', content: message.text.slice(0, 650) }))
      try {
        const text = await streamAnswer(TECH_ELITE_AI_ENDPOINT, {
          question: question.slice(0, 350),
          history,
          siteContext: buildWholeSiteContext(question),
        }, abort.signal, (partial) => {
          setMessages(previous => previous.map(message => message.id === assistantId ? { ...message, text: partial } : message))
        })
        setMessages(previous => previous.map(message => message.id === assistantId ? { ...message, text } : message))
      } catch (failure) {
        // An unsuccessful AI call should not reduce the student's usable daily allowance.
        setUsed(previous => Math.max(0, previous - 1))
        const detail = failure instanceof Error ? failure.message : 'تعذر الاتصال.'
        setMessages(previous => previous.map(message => message.id === assistantId ? {
          ...message,
          text: `${message.text ? `${message.text}\n\n` : ''}تعذر الاتصال بنموذج AI (${detail}). إذا كنت تختبر محليًا، تأكد أن Terminal الخاص بـ ai-worker يعمل. لم أستبدل الرد بإجابة محفوظة.`,
        } : message))
        setError('تعذر إكمال طلب AI. لن ندّعي أن الإجابة المحلية هي رد الذكاء الاصطناعي.')
      } finally { clearTimeout(timeout) }
    } finally {
      pendingRef.current = false
      setBusy(false)
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void ask(query) }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(query) }
  }
  function clearChat() { if (busy) return; setMessages([]); academicContextRef.current = {}; setError(''); setQuery(''); inputRef.current?.focus() }
  const composer = <form className="te-chat-composer" onSubmit={submit}>
    <textarea ref={inputRef} rows={1} value={query} maxLength={350} onChange={event => setQuery(event.target.value)} onKeyDown={keyDown}
      aria-label="اكتب سؤالك" disabled={busy} placeholder={remaining ? 'اسأل عن مادة، محاضرة، أو أي موضوع تقني...' : 'انتهت حصة AI اليوم، ولا يزال البحث عن الملازم والمواد متاحًا'} />
    <button type="submit" aria-label="إرسال" disabled={!query.trim() || busy}><Send size={18}/></button>
  </form>

  return <section className="section te-chat-page" aria-label="مساعد Tech Elite" dir="rtl">
    <div className="container">
      <div className={`te-chat-shell ${started ? 'has-conversation' : 'is-welcome'}`}>
        {!started ? <div className="te-chat-welcome">
          <div className="te-chat-mark"><Sparkles size={25}/></div>
          <h2>كيف أقدر أساعدك اليوم؟</h2>
          <p>اسأل عن مقررات IT وCS، اطلب محاضرة من المكتبة، أو ناقش موضوعًا تقنيًا.</p>
          <AcademicScopeControls value={scope} onChange={setScope} />
          {composer}
          <div className="te-chat-suggestions" aria-label="أسئلة مقترحة">
            {suggestions.map(item => <button type="button" key={item} disabled={busy} onClick={() => void ask(item)}>{item}<ArrowLeft size={14}/></button>)}
          </div>
        </div> : <>
          <div className="te-chat-topbar"><span><Bot size={17}/> مساعد Tech Elite</span><div className="te-chat-topbar-actions"><AcademicScopeControls value={scope} onChange={setScope} /><button type="button" disabled={busy} onClick={clearChat}><Plus size={16}/> محادثة جديدة</button></div></div>
          <div className="te-chat-feed" ref={boxRef} aria-live="polite" aria-relevant="additions text">
            {messages.map(message => <div key={message.id} className={`te-chat-entry ${message.author === 'student' ? 'from-student' : 'from-bot'}`}>
              {message.author === 'assistant' && <div className="te-chat-mini-icon"><Sparkles size={16}/></div>}
              <div className="te-chat-content">
                {message.text ? <p className="te-chat-message-text" dir="auto">{message.author === 'assistant' ? cleanAssistantText(message.text) : message.text}</p> : <div className="te-chat-typing" role="status" aria-label="المساعد يكتب"><span/><span/><span/></div>}
                {!!message.links?.length && <div className="te-chat-file-links">
                  {message.links.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/>{link.title}<ExternalLink size={13}/></a>)}
                </div>}
                {message.destination && <button type="button" className="te-chat-destination" onClick={() => onNavigate(message.destination!)}>{message.button || 'فتح القسم'} <ArrowLeft size={15}/></button>}
                {message.author === 'assistant' && !!message.followups?.length && <div className="te-chat-followups">
                  {message.followups.map(prompt => <button type="button" key={prompt} disabled={busy} onClick={() => prompt === 'افتح المكتبة' ? onNavigate('library') : void ask(prompt)}>{prompt}</button>)}
                </div>}
              </div>
            </div>)}
            {busy && messages[messages.length - 1]?.author === 'student' && <div className="te-chat-status"><LoaderCircle size={15} className="te-spin"/> {aiEnabled ? 'أفكر في سؤالك...' : 'أبحث في مواد الموقع...'}</div>}
          </div>
          <div className="te-chat-fixed-composer">{composer}</div>
        </>}
        <div className="te-chat-footnote">
          <span><MessageCircle size={13}/> {remaining} من {DAILY_LIMIT} سؤال AI متبقيًا اليوم؛ البحث عن الملازم لا يُحسب</span>

          <button type="button" onClick={() => onNavigate('library')}><LibraryBig size={13}/> المكتبة</button>
        </div>
        {error && <p className="te-chat-error" role="alert">{error}</p>}
      </div>
      <p className="te-chat-disclosure">روابط المحاضرات من فهرس الموقع، ولا يقرأ المساعد نصوص PDF. لا تشارك معلومات شخصية.</p>
    </div>
  </section>
}
