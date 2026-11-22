import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowLeft, BookOpen, Bot, ExternalLink, LibraryBig, LoaderCircle, MessageCircle, Plus, Send, Sparkles } from 'lucide-react'
import './site-assistant.css'
import './site-assistant-polish.css'
import './assistant-message-content.css'
import AssistantMessageText, { assistantInlineText } from './AssistantMessageText'
import type { AcademicConversationState } from './academic-conversation-state'
import type { SiteConversationState } from './assistant-intent'
import type { CourseResourceGroup, SmartAnswer } from './smart-academic-search'
import { streamAnswer, aiFailureMessage } from './assistant-transport'
import { TECH_ELITE_AI_ENDPOINT } from './tech-elite-ai-config'
import { siteConfig } from './data'
import { getCourseAllMaterialsBotUrl } from './telegram-links'
import { archiveMessageId } from './telegram-materials'
import { answerAssistant, assistantContext, isSiteQuestion, usableAIEndpoint } from './assistant-router'
import AcademicScopeControls from './AcademicScopeControls'
import { DEFAULT_SCOPE, type AcademicScope } from './academic-intent'

type Destination = 'about' | 'cs' | 'plan' | 'library' | 'guide'
type LinkItem = { title: string; url: string }
type Message = {
  id: number
  author: 'student' | 'assistant'
  text: string
  links?: LinkItem[]
  resourceGroups?: CourseResourceGroup[]
  destination?: Destination
  button?: string
  followups?: string[]
  courseId?: string
  academicState?: AcademicConversationState | null
  siteState?: SiteConversationState | null
  retrieval?: SmartAnswer['retrieval']
}
type LocalAnswer = Pick<Message, 'text' | 'links' | 'resourceGroups' | 'destination' | 'button' | 'followups' | 'courseId' | 'academicState' | 'siteState' | 'retrieval'>

const DAILY_LIMIT = 15
const STORAGE_CHAT = 'te-academic-chat-v5'
const STORAGE_LIMIT = 'te-academic-questions-v4'
const suggestions = ['عرّفني بدفعة Tech Elite', 'اشرح SQL وNoSQL', 'مواد المستوى الثاني IT', 'المحاضرة الأولى تنظيم ومعمارية الحاسب', 'الفرق بين IT وCS', 'كيف أختار تخصصي؟']
const resolvedEndpoint = window.location.hostname.endsWith('.vercel.app')
  ? `${window.location.origin}/api/ai`
  : TECH_ELITE_AI_ENDPOINT.trim()
const aiEndpoint = usableAIEndpoint(resolvedEndpoint, window.location.hostname)
const aiEnabled = !!aiEndpoint
const todayKey = () => new Date().toLocaleDateString('en-CA')
const nextId = () => Date.now() * 1000 + Math.floor(Math.random() * 999)

function savedMessages(): Message[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CHAT) || '[]')
    return Array.isArray(saved) ? saved.slice(-30).filter((m: Message) => m &&
      (m.author === 'student' || m.author === 'assistant') && typeof m.text === 'string' && m.text.length <= 64000 &&
      typeof m.id === 'number') : []
  } catch { return [] }
}
function usedToday(): number {
  try {
    const obj = JSON.parse(localStorage.getItem(STORAGE_LIMIT) || 'null')
    return obj?.day === todayKey() && Number.isInteger(obj.used) ? Math.min(DAILY_LIMIT, Math.max(0, obj.used)) : 0
  } catch { return 0 }
}
export default function SiteAssistant({ onNavigate }: { onNavigate: (destination: Destination) => void }) {
  const [messages, setMessages] = useState<Message[]>(savedMessages)
  const [used, setUsed] = useState(usedToday)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<AcademicScope>(DEFAULT_SCOPE)
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
    const prior = messages.slice(-12)
    const student: Message = { id: nextId(), author: 'student', text: question }
    const assistantId = nextId() + 10
    setMessages(previous => [...previous, student].slice(-40))
    setQuery('')
    try {
      const verified = answerAssistant(question, messages, scope)
      if (verified) {
        const answer = verified as LocalAnswer
        setMessages(previous => [...previous, { id: assistantId, author: 'assistant', ...answer, courseId: answer.courseId }])
        return
      }
      if (!aiEnabled) {
        setMessages(previous => [...previous, {
          id: assistantId, author: 'assistant',
          text: 'هذا السؤال يحتاج نموذج ذكاء اصطناعي كي أناقشه معك بشكل تفاعلي، وليس إجابة جاهزة. خدمة AI غير متصلة حاليًا. تعذر تفعيل اتصال AI لهذه البيئة؛ معلومات الموقع وروابط الملفات تظل متاحة. يمكنني الآن البحث في أسماء المواد وروابط المحاضرات المسجلة فقط.',
          destination: 'library', button: 'المكتبة',
          followups: ['مواد المستوى الثاني IT', 'المحاضرة الأولى تنظيم ومعمارية الحاسب'],
        }])
        return
      }
      // Site-related questions stay completely free; only general external AI questions count toward the 15-question limit.
      const consumesQuota = !isSiteQuestion(question, messages, scope)
      if (consumesQuota && remaining <= 0) {
        setMessages(previous => [...previous, { id: assistantId, author: 'assistant', text: 'استهلكت حصة الأسئلة العامة اليوم (15 سؤالًا). يمكنك الاستمرار في سؤال البوت عن الدفعة والموقع والملازم والتخصصات مجانًا بلا حدود، أو الرجوع غدًا للأسئلة العامة.' }])
        return
      }
      if (consumesQuota) {
        setUsed(previous => Math.min(DAILY_LIMIT, previous + 1))
      }
      setMessages(previous => [...previous, { id: assistantId, author: 'assistant', text: '' }])
      const abort = new AbortController()
      const timeout = window.setTimeout(() => abort.abort(), 120000)
      const history = prior.map(message => { const resSummary = message.resourceGroups?.length ? ' [' + message.resourceGroups.map(g => g.courseName + ': ' + (g.resources.map(r => r.title).join('، ') || 'لا توجد ملفات')).join(' | ') + ']' : ''; return { role: message.author === 'student' ? 'user' : 'assistant', content: (message.text + resSummary).slice(0, 1200) } })
      try {
        const text = await streamAnswer(aiEndpoint, {
          question: question.slice(0, 500),
          history,
          siteContext: assistantContext(question, messages, scope),
        }, abort.signal, (partial) => {
          setMessages(previous => previous.map(message => message.id === assistantId ? { ...message, text: partial } : message))
        })
        setMessages(previous => previous.map(message => message.id === assistantId ? { ...message, text } : message))
      } catch (failure) {
        if (consumesQuota) {
          setUsed(previous => Math.max(0, previous - 1))
        }
        setMessages(previous => previous.map(message => message.id === assistantId ? {
          ...message,
          text: `${message.text ? `${message.text}\n\n` : ''}${aiFailureMessage(failure)}`,
        } : message))
        setError('تعذر إكمال طلب AI. معلومات الموقع وروابط الملفات متاحة محليًا.')
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
  function clearChat() { if (busy) return; setMessages([]); setError(''); setQuery(''); inputRef.current?.focus() }
  const composer = <form className="te-chat-composer" onSubmit={submit}>
    <textarea ref={inputRef} rows={1} value={query} maxLength={500} onChange={event => setQuery(event.target.value)} onKeyDown={keyDown}
      aria-label="اكتب سؤالك" disabled={busy} placeholder={remaining ? 'اسأل عن مادة، محاضرة، أو أي موضوع تقني...' : 'انتهت حصة الأسئلة العامة اليوم، وأسئلة الموقع والملازم لا تزال متاحة مجانًا'} />
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
              <div className="te-chat-content" dir={message.author === 'assistant' ? 'rtl' : undefined}>
                {message.text ? (message.author === 'assistant' ? <AssistantMessageText text={message.text}/> : <p className="te-chat-message-text" dir="auto">{message.text}</p>) : <div className="te-chat-typing" role="status" aria-label="المساعد يكتب"><span/><span/><span/></div>}
                {message.resourceGroups?.filter(group => group.resources.length > 0).map(group => <div
                  key={`${group.major}:${group.courseId}:${group.year}:${group.semester}`}
                  role="group" aria-label={`${group.courseName}، ${group.major}، المستوى ${group.year}، الفصل ${group.semester}`}>
                  <p className="te-chat-message-text"><strong>{assistantInlineText(group.courseName)}</strong><br/><bdi dir="auto">{group.major}</bdi>، المستوى {group.year}، الفصل {group.semester}</p>
                  <div className="te-chat-file-links">
                    {group.resources.map((resource,index) => <a href={resource.url} key={`${resource.sourceUrl}:${index}`} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/><span className="te-chat-link-label">{assistantInlineText(resource.title)}</span><ExternalLink size={13}/></a>)}
                    {group.resources.length > 1 && group.resources.some(r => archiveMessageId(r.sourceUrl) !== null) && (() => { const allUrl = getCourseAllMaterialsBotUrl(siteConfig.telegramBotUsername, group.courseId); return allUrl ? <a href={allUrl} target="_blank" rel="noopener noreferrer"><Send size={15}/><span className="te-chat-link-label">إرسال جميع الملازم</span><ExternalLink size={13}/></a> : null })()}
                  </div>
                </div>)}
                {message.resourceGroups?.some(group => group.resources.length === 0) && <p className="te-chat-message-text">
                  لا توجد ملفات قابلة للفتح مسجلة حاليًا لبقية المواد: {assistantInlineText(message.resourceGroups.filter(group => group.resources.length === 0).map(group => group.courseName).join('، '))}.
                </p>}
                {!!message.links?.length && <div className="te-chat-file-links">
                  {message.links.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer"><BookOpen size={15}/><span className="te-chat-link-label">{assistantInlineText(link.title)}</span><ExternalLink size={13}/></a>)}
                </div>}
                {message.destination && <button type="button" className="te-chat-destination" onClick={() => onNavigate(message.destination!)}>{assistantInlineText(message.button || 'فتح القسم')} <ArrowLeft size={15}/></button>}
                {message.author === 'assistant' && !!message.followups?.length && <div className="te-chat-followups">
                  {message.followups.map(prompt => <button type="button" key={prompt} disabled={busy} onClick={() => prompt === 'افتح المكتبة' ? onNavigate('library') : void ask(prompt)}>{assistantInlineText(prompt)}</button>)}
                </div>}
              </div>
            </div>)}
            {busy && messages[messages.length - 1]?.author === 'student' && <div className="te-chat-status"><LoaderCircle size={15} className="te-spin"/> {aiEnabled ? 'أفكر في سؤالك...' : 'أبحث في مواد الموقع...'}</div>}
          </div>
          <div className="te-chat-fixed-composer">{composer}</div>
        </>}
        <div className="te-chat-footnote">
          <span><MessageCircle size={13}/> {remaining} من {DAILY_LIMIT} سؤال AI عام متبقيًا اليوم؛ أسئلة الموقع والملازم مجانية</span>

          <button type="button" onClick={() => onNavigate('library')}><LibraryBig size={13}/> المكتبة</button>
        </div>
        {error && <p className="te-chat-error" role="alert">{error}</p>}
      </div>
      <p className="te-chat-disclosure">روابط المحاضرات من فهرس الموقع، ولا يقرأ المساعد نصوص PDF. لا تشارك معلومات شخصية.</p>
    </div>
  </section>
}
