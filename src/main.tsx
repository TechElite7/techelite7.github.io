import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import './themes.css'
import './mobile-hero.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
import './student-guide.css'
import './academic-major.css'

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
