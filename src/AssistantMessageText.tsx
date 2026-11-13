import { Fragment, createElement, type ReactNode } from 'react'

// Presentation only: never alter the stored reply or interpret model HTML.
function isolateText(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const latin = /[@.]?[A-Za-z][A-Za-z0-9_+#]*(?:[./:@-][A-Za-z0-9_+#]+)*(?:[ \t]+[A-Za-z0-9][A-Za-z0-9_+#]*(?:[./:@-][A-Za-z0-9_+#]+)*)*/g
  let end = 0
  for (const match of text.matchAll(latin)) {
    nodes.push(text.slice(end, match.index))
    nodes.push(<bdi dir="auto" key={match.index}>{match[0]}</bdi>)
    end = match.index + match[0].length
  }
  nodes.push(text.slice(end))
  return nodes
}

export { isolateText as assistantInlineText }

function inline(text: string, depth = 0): ReactNode[] {
  if (depth > 8) return isolateText(text)
  const nodes: ReactNode[] = []
  const tokens = /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/(?:[^()\s<>]|\([^()\s<>]*\))+)\)|(\*{2,3}|__)([^\n]+?)\4|(?<!\w)\*([^*\n]+)\*(?!\w)|https?:\/\/[^\s<>`،؛؟]+/g
  let end = 0
  for (const match of text.matchAll(tokens)) {
    const key = match.index
    nodes.push(<Fragment key={'text:' + key}>{isolateText(text.slice(end, key))}</Fragment>)
    if (match[1]) nodes.push(<code dir="ltr" key={key}>{match[1]}</code>)
    else if (match[3]) nodes.push(<a key={key} href={match[3]} target="_blank" rel="noopener noreferrer">{isolateText(match[2])}</a>)
    else if (match[5]) nodes.push(<strong key={key}>{match[4] === '***' ? <em>{inline(match[5], depth + 1)}</em> : inline(match[5], depth + 1)}</strong>)
    else if (match[6]) nodes.push(<em key={key}>{inline(match[6], depth + 1)}</em>)
    else {
      let url = match[0]
      while (/[.,!?;:،؛؟]$/.test(url) ||
        (url.endsWith(')') && url.split(')').length > url.split('(').length) ||
        (url.endsWith(']') && url.split(']').length > url.split('[').length)) url = url.slice(0, -1)
      nodes.push(<a dir="auto" key={key} href={url} target="_blank" rel="noopener noreferrer"><bdi dir="auto">{url}</bdi></a>)
      nodes.push(<Fragment key={'suffix:' + key}>{isolateText(match[0].slice(url.length))}</Fragment>)
    }
    end = key + match[0].length
  }
  nodes.push(<Fragment key="tail">{isolateText(text.slice(end))}</Fragment>)
  return nodes
}

function listItem(line: string) {
  const match = /^([ \t]*)(?:([-*+•‣▪])|([0-9٠-٩۰-۹]+)[.)،])\s+(.+)$/.exec(line)
  if (!match) return null
  const digits = match[3]?.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) - (digit <= '٩' ? 0x660 : 0x6f0)))
  return {
    indent: match[1].length, ordered: !!digits, number: digits ? Number(digits) : undefined,
    offset: match[0].length - match[4].length, text: match[4],
  }
}

const fence = (line: string) => /^\s{0,3}(`{3,}|~{3,})[^`]*$/.exec(line)
const heading = (line: string) => /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/.exec(line)
const divider = (line: string) => /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)
const indent = (line: string) => /^[ \t]*/.exec(line)![0].length

function blocks(lines: string[], prefix = 'reply'): ReactNode[] {
  const nodes: ReactNode[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    const key = prefix + ':' + index
    if (!line.trim() || divider(line)) { index++; continue }
    const codeFence = fence(line)
    if (codeFence) {
      const code: string[] = []
      const marker = codeFence[1]
      const closing = new RegExp('^\\s{0,3}' + marker[0] + '{' + marker.length + ',}\\s*$')
      index++
      while (index < lines.length && !closing.test(lines[index])) code.push(lines[index++])
      if (index < lines.length) index++
      nodes.push(<pre dir="ltr" key={key}><code dir="ltr">{code.join('\n')}</code></pre>)
      continue
    }
    const title = heading(line)
    if (title) {
      nodes.push(createElement('h' + title[1].length, { key, dir: 'rtl' }, inline(title[2])))
      index++
      continue
    }
    const first = listItem(line)
    if (first) {
      const items: ReactNode[] = []
      while (index < lines.length) {
        const entry = listItem(lines[index])
        if (!entry || entry.indent !== first.indent || entry.ordered !== first.ordered) break
        const itemKey = key + ':' + index
        const body = [entry.text]
        index++
        while (index < lines.length) {
          if (!lines[index].trim()) {
            let next = index + 1
            while (next < lines.length && !lines[next].trim()) next++
            const following = listItem(lines[next] || '')
            if (following?.indent === first.indent && following.ordered === first.ordered) { index = next; break }
            if (next < lines.length && indent(lines[next]) > first.indent) { body.push(''); index++; continue }
            break
          }
          const padding = indent(lines[index])
          if (padding <= first.indent) break
          body.push(lines[index].slice(Math.min(entry.offset, padding)))
          index++
        }
        items.push(<li key={itemKey} dir="rtl" value={entry.number}>{blocks(body, itemKey)}</li>)
      }
      nodes.push(first.ordered
        ? <ol key={key} dir="rtl" start={first.number}>{items}</ol>
        : <ul key={key} dir="rtl">{items}</ul>)
      continue
    }
    const paragraph: string[] = []
    do {
      paragraph.push(lines[index++].replace(/^\s{0,3}>\s?/, '').trim())
    } while (index < lines.length && lines[index].trim() && !listItem(lines[index]) &&
      !fence(lines[index]) && !heading(lines[index]) && !divider(lines[index]))
    nodes.push(<p dir="rtl" key={key}>{inline(paragraph.join('\n'))}</p>)
  }
  return nodes
}

export default function AssistantMessageText({ text }: { text: string }) {
  return <div className="te-chat-message-text te-chat-rich-text" dir="rtl">
    {blocks(text.replace(/\r\n?/g, '\n').split('\n'))}
  </div>
}
