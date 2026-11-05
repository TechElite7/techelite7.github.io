import './logo-philosophy.css'

/** فلسفة الشعار كما وردت في الصفحة الرابعة من ملف هوية دفعة Tech Elite. */
export default function LogoPhilosophy() {
  return (
    <section className="section te-logo-story-section" aria-labelledby="te-logo-story-title" dir="rtl">
      <div className="container">
        <div className="te-logo-story-head">
          <span className="te-logo-story-kicker"><span aria-hidden="true">✦</span> الهوية التي تجمعنا</span>
          <h2 id="te-logo-story-title">فلسفة <span>شعارنا</span></h2>
          <p>لم يُصمَّم شعار Tech Elite ليكون اسمًا فقط؛ بل ليجمع اسم الدفعة ورمزًا من عالم البرمجة وتخصص تقنية المعلومات في علامة واحدة.</p>
        </div>
        <div className="te-logo-story-layout">
          <figure className="te-logo-story-figure">
            <a href="/assets/tech-elite-philosophy.webp" target="_blank" rel="noopener noreferrer" title="عرض صفحة فلسفة الشعار بالحجم الكامل">
              <img
                src="/assets/tech-elite-philosophy.webp"
                alt="صفحة فلسفة شعار Tech Elite الأصلية: توضيح اسم النخبة التقنية، نقطة الفاصلة، الفاصلة المنقوطة، واختصار IT"
                loading="lazy"
                width="1620"
                height="912"
              />
            </a>
            <figcaption>الصفحة الأصلية من دليل شعار الدفعة · اضغط على الصورة لتكبيرها</figcaption>
          </figure>
          <div className="te-logo-story-points">
            <div className="te-logo-story-point">
              <span className="te-logo-story-number">01</span>
              <div><h3>Tech Elite</h3><p>اسم الدفعة باللغة الإنجليزية، ومعناه <strong>النخبة التقنية</strong>.</p></div>
            </div>
            <div className="te-logo-story-point">
              <span className="te-logo-story-number">02</span>
              <div><h3>الفاصلة المنقوطة <span dir="ltr">;</span></h3><p>رمز مشهور في كتابة الأكواد البرمجية، وهو أساس الفكرة البصرية للشعار.</p></div>
            </div>
            <div className="te-logo-story-point">
              <span className="te-logo-story-number">03</span>
              <div><h3>نقطة الفاصلة</h3><p>تظهر أعلى الرمز لتُكمل تكوين علامة الفاصلة المنقوطة.</p></div>
            </div>
            <div className="te-logo-story-point">
              <span className="te-logo-story-number">04</span>
              <div><h3>IT · Information Technology</h3><p>اختصار لتخصص <strong>تقنية المعلومات</strong>، المجال الذي يجمع أفراد دفعتنا.</p></div>
            </div>
          </div>
        </div>
        <div className="te-logo-story-colors" aria-label="ألوان الشعار الأصلية الواردة في ملف الهوية">
          <span>ألوان الهوية الأصلية</span>
          <span className="te-logo-story-swatch"><i style={{backgroundColor:'#1b1464'}} /> #1b1464</span>
          <span className="te-logo-story-swatch"><i style={{backgroundColor:'#662d91'}} /> #662d91</span>
        </div>
      </div>
    </section>
  )
}
