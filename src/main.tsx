import './contribute-widget';
import './scroll-reveal';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { applyCloudMaterials } from './telegram-materials'
import './style.css'
import './themes.css'
import './mobile-hero.css'
import './student-guide.css'
import './academic-major.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function renderApp(rev = 0) {
  root.render(
    <React.StrictMode>
      <App key={rev} />
    </React.StrictMode>,
  )
}

renderApp(0)

fetch('https://tech-elite-telegram-bot.husseinthebetter.workers.dev/api/materials')
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (data?.ok && data.materials) {
      applyCloudMaterials(data.materials, Array.isArray(data.hidden) ? data.hidden : [])
      renderApp(1)
    }
  })
  .catch(() => {})

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => reg.update()).catch(() => {})
  })
}
