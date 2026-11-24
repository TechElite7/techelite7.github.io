import { useEffect, useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PROMPT_SEEN_KEY = 'te-pwa-prompt-seen-v1'
const INSTALLED_KEY = 'te-pwa-installed-v1'

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
}

export function usePwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState<boolean>(() => {
    if (detectStandalone()) return true
    try {
      return localStorage.getItem(INSTALLED_KEY) === '1'
    } catch {
      return false
    }
  })
  const [modalOpen, setModalOpen] = useState<boolean>(() => {
    if (detectStandalone()) return false
    try {
      if (localStorage.getItem(INSTALLED_KEY) === '1') return false
      return localStorage.getItem(PROMPT_SEEN_KEY) !== '1'
    } catch {
      return false
    }
  })
  const [showManualHint, setShowManualHint] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setModalOpen(false)
      setPromptEvent(null)
      try {
        localStorage.setItem(INSTALLED_KEY, '1')
        localStorage.setItem(PROMPT_SEEN_KEY, '1')
      } catch { /* ignore */ }
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismissModal() {
    setModalOpen(false)
    setShowManualHint(false)
    try {
      localStorage.setItem(PROMPT_SEEN_KEY, '1')
    } catch { /* ignore */ }
  }

  async function triggerInstall() {
    try {
      localStorage.setItem(PROMPT_SEEN_KEY, '1')
    } catch { /* ignore */ }

    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
        setModalOpen(false)
        try {
          localStorage.setItem(INSTALLED_KEY, '1')
        } catch { /* ignore */ }
      } else {
        setModalOpen(false)
      }
      setPromptEvent(null)
      return
    }

    // Fallback when browser doesn't expose beforeinstallprompt (e.g., iOS Safari or already-dismissed native banner)
    setShowManualHint(true)
    setModalOpen(true)
  }

  return {
    installed,
    modalOpen,
    showManualHint,
    isIos: detectIos(),
    hasNativePrompt: Boolean(promptEvent),
    openModal: () => {
      setShowManualHint(!promptEvent)
      setModalOpen(true)
    },
    dismissModal,
    triggerInstall,
  }
}

export function PwaInstallModal({
  open,
  showManualHint,
  isIos,
  hasNativePrompt,
  onInstall,
  onClose,
}: {
  open: boolean
  showManualHint: boolean
  isIos: boolean
  hasNativePrompt: boolean
  onInstall: () => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="te-pwa-backdrop" role="dialog" aria-modal="true" aria-labelledby="te-pwa-title" dir="rtl">
      <div className="te-pwa-modal">
        <button type="button" className="te-pwa-close" onClick={onClose} aria-label="إغلاق">
          <X size={18} />
        </button>

        <div className="te-pwa-head">
          <div className="te-pwa-icon">
            <img src="/assets/techelite7-icon.png" alt="Tech Elite" />
          </div>
          <div>
            <h3 id="te-pwa-title">ثبّت موقع Tech Elite كتطبيق</h3>
            <p>وصول أسرع للملازم، الخطة الدراسية، والشات الذكي مباشرة من شاشة جوالك دون الحاجة لفتح المتصفح كل مرة.</p>
          </div>
        </div>

        {showManualHint && !hasNativePrompt && (
          <div className="te-pwa-hint">
            <Smartphone size={17} />
            <span>
              {isIos
                ? 'في سفاري: اضغط زر المشاركة (المربع بسهم لأعلى) بالأسفل، ثم اختر «إضافة إلى الشاشة الرئيسية».'
                : 'من قائمة المتصفح (⋮) بالأعلى اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».'}
            </span>
          </div>
        )}

        <div className="te-pwa-actions">
          {(!showManualHint || hasNativePrompt) && (
            <button type="button" className="te-pwa-btn-primary" onClick={onInstall}>
              <Download size={16} /> تثبيت التطبيق
            </button>
          )}
          <button type="button" className="te-pwa-btn-secondary" onClick={onClose}>
            {showManualHint && !hasNativePrompt ? 'فهمت' : 'لاحقًا'}
          </button>
        </div>
      </div>
    </div>
  )
}
