import { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { AcademicScope } from './academic-intent'
import './academic-scope.css'

type Props = { value: AcademicScope; onChange: (value: AcademicScope) => void }
export default function AcademicScopeControls({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const active = value.major !== 'all' || value.year !== 'all' || value.semester !== 'all'
  const chosen = [value.major !== 'all' ? value.major : '', value.year !== 'all' ? `م${value.year}` : '', value.semester !== 'all' ? `ف${value.semester}` : ''].filter(Boolean).join(' · ')
  return <div className="te-scope-wrap" dir="rtl">
    <button type="button" className={`te-scope-trigger${active ? ' is-active' : ''}`} aria-expanded={open} aria-controls="te-scope-popover" onClick={() => setOpen(v => !v)}>
      <SlidersHorizontal size={15}/><span>{active ? chosen : 'تخصيص البحث'}</span><ChevronDown size={13}/>
    </button>
    {open && <div id="te-scope-popover" className="te-scope-popover" role="group" aria-label="خيارات البحث الأكاديمي">
      <div className="te-scope-head"><strong>نطاق المقررات</strong><span>لا يقيّد الأسئلة العامة</span></div>
      <div className="te-scope-fields">
        <label>التخصص<select value={value.major} onChange={e=>onChange({...value, major:e.target.value as AcademicScope['major']})}>
          <option value="all">الكل</option><option value="IT">IT</option><option value="CS">CS</option>
        </select></label>
        <label>المستوى<select value={value.year} onChange={e=>onChange({...value,year:e.target.value === 'all' ? 'all' : Number(e.target.value) as AcademicScope['year']})}>
          <option value="all">الكل</option><option value="1">الأول</option><option value="2">الثاني</option><option value="3">الثالث</option><option value="4">الرابع</option>
        </select></label>
        <label>الفصل<select value={value.semester} onChange={e=>onChange({...value,semester:e.target.value === 'all' ? 'all' : Number(e.target.value) as AcademicScope['semester']})}>
          <option value="all">الكل</option><option value="1">الأول</option><option value="2">الثاني</option>
        </select></label>
      </div>
      <div className="te-scope-actions"><button type="button" onClick={()=>onChange({major:'all',year:'all',semester:'all'})}>إعادة الضبط</button><button type="button" onClick={()=>setOpen(false)}>تم</button></div>
    </div>}
  </div>
}
