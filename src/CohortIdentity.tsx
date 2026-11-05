import { GraduationCap, MapPin, Sparkles } from 'lucide-react'
import './cohort-identity.css'

/** بطاقة هوية الدفعة السابعة داخل صفحة «دفعتنا» */
export default function CohortIdentity() {
  return (
    <section className="section cohort-identity-section" aria-labelledby="cohort-identity-title">
      <div className="container">
        <div className="cohort-identity-card">
          <div className="cohort-identity-copy">
            <span className="cohort-identity-label"><Sparkles size={17} /> هويتنا · Tech Elite</span>
            <h2 id="cohort-identity-title">نحن <span>الدفعة السابعة</span></h2>
            <p>دفعة Tech Elite، الدفعة السابعة في تخصص تقنية المعلومات بجامعة حضرموت. جمعنا شغف التقنية، وتركنا هذا المرجع المعرفي أثرًا يخدم طلاب التخصص والأجيال القادمة.</p>
            <div className="cohort-identity-tags">
              <span><GraduationCap size={17} /> تخصص تقنية المعلومات IT</span>
              <span><MapPin size={17} /> جامعة حضرموت</span>
            </div>
          </div>
          <div className="cohort-identity-number" aria-label="الدفعة رقم سبعة">
            <span>SEVENTH BATCH</span>
            <strong dir="ltr">07</strong>
            <small>TECH ELITE</small>
          </div>
        </div>
      </div>
    </section>
  )
}
