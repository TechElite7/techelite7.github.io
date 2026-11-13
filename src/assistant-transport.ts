/** Parse SSE tokens as they arrive. A fallback to /chat supports older deployed Workers. */
export async function streamAnswer(endpoint: string, payload: object, signal: AbortSignal, onText: (text: string) => void): Promise<string> {
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


/** Connection diagnostics are distinct from a knowledge answer; do not expose raw errors. */
export function aiFailureMessage(failure: unknown): string {
  return failure instanceof Error && failure.name === 'AbortError'
    ? 'انتهت مهلة انتظار نموذج AI. حاول مرة أخرى لاحقًا؛ معلومات الموقع وروابط الملفات متاحة محليًا.'
    : 'تعذر الاتصال بنموذج AI حاليًا. حاول مرة أخرى لاحقًا؛ معلومات الموقع وروابط الملفات متاحة محليًا.'
}
