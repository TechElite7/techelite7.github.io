/**
 * علوم الحاسوب CS - خطة جامعة حضرموت الرسمية:
 * https://hu.edu.ye/compfac/cs/
 * المقررات (الرموز، الفصول، الساعات) من جداول المستويات الرسمية.
 * تتضمن صفحة الجامعة 17 خيارًا اختياريًا؛ المطلوب دراسته منها 12 ساعة فقط، لا جميعها.
 * جدول المستوى الرابع يعرض أربعة خيارات اختيارية ضمن مثال توزيع الخطة.
 * يوجد اختلاف في فصل مقرر "التنقيب عن البيانات" (عال418) بين جدول الاختيارات (الأول)
 * وجدول المستوى الرابع (الثاني)؛ استخدمنا الثاني للعرض، مع تنبيه الطالب للتحقق.
 * تعريفات المقررات المختصرة صياغة تحريرية وليست أوصافًا رسمية من الجامعة.
 * مصادر التعلم الخارجية ليست ملازم رسمية.
 */
import type { Course, Resource } from './data'

export const csProgram = {
  name: 'علوم الحاسوب CS',
  announcedHours: 133,
  electiveHours: 12,
  officialUrl: 'https://hu.edu.ye/compfac/cs/',
  discrepancy: 'تنبيه: جدول الاختيارات يضع «التنقيب عن البيانات» في الفصل الأول، بينما جدول المستوى الرابع يضعه في الفصل الثاني. اعتمدنا جدول المستوى الرابع للعرض، ويُرجع إلى القسم عند التعارض.',
} as const

const resourceMap: Record<string, Resource> = {
  university: { title: 'الخطة الأكاديمية الرسمية لقسم علوم الحاسوب', kind: 'وصف رسمي للمقرر', url: csProgram.officialUrl, description: 'للاطلاع على الجداول والأوصاف المعتمدة' },
  cs50: { title: 'CS50x — مدخل علوم الحاسوب', kind: 'مسار تعلم', url: 'https://cs50.harvard.edu/x/', description: 'دورة عامة للتعلم وليست ملزمة جامعية' },
  db: { title: 'Microsoft Learn — قواعد البيانات وSQL', kind: 'توثيق رسمي', url: 'https://learn.microsoft.com/en-us/sql/', description: 'مصدر تقني إضافي' },
  mdn: { title: 'MDN — تطوير الويب', kind: 'مسار تعلم', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development', description: 'مصدر إضافي لتعلم تطوير الويب' },
  owasp: { title: 'OWASP — أمن التطبيقات', kind: 'مرجع إضافي', url: 'https://owasp.org/www-project-web-security-testing-guide/', description: 'مرجع خارجي للأمن' },
  github: { title: 'GitHub Docs', kind: 'توثيق رسمي', url: 'https://docs.github.com/en/get-started', description: 'إدارة المشاريع البرمجية' },
}

type RawCourse = Omit<Course, 'resources'> & { resources: (keyof typeof resourceMap)[] }
const fromRaw = (rows: RawCourse[]): Course[] => rows.map(row => ({ ...row, resources: row.resources.map(key => resourceMap[key]) }))
// الجداول المعروضة في صفحات المستوى الأول إلى الرابع؛ أربعة مقررات اختيارية ظاهرة ضمن جدول المستوى الرابع.
export const csPlanCourses: Course[] = fromRaw([
  {
    "id": "hu-cs-001",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة العربية 1",
    "english": "Arabic Language I",
    "code": "عرب111",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "تنمية مهارات القراءة والكتابة العربية والقواعد اللغوية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-002",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 1",
    "english": "English I",
    "code": "نجل112",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "تعلم الأساسيات اللغوية والقراءة والاستماع والتعبير.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-003",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الثقافة الإسلامية 1",
    "english": "Islamic Culture I",
    "code": "سلم113",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مقرر تخصصي",
    "description": "مفاهيم الثقافة الإسلامية والقيم والقضايا الفكرية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-004",
    "name": "مهارات الحاسوب",
    "english": "Computer Skills",
    "code": "عال114",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "مكونات الحاسب وأنظمة التشغيل وبرامج المكتب والإنترنت.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-005",
    "hasTheory": true,
    "hasPractical": false,
    "name": "حساب التفاضل",
    "english": "Differential Calculus",
    "code": "ريض115",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "المشتقات وتطبيقاتها في الرياضيات وحل المشكلات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-006",
    "hasTheory": true,
    "hasPractical": false,
    "name": "هياكل متقطعة",
    "english": "Discrete Structures",
    "code": "عال116",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "المنطق والمجموعات والعلاقات والأسس الرياضية للحوسبة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-007",
    "name": "برمجة الحاسب 1",
    "english": "Computer Programming I",
    "code": "عال117",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "مقدمة في البرمجة وبناء الخوارزميات وهياكل التحكم.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-008",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة العربية 2",
    "english": "Arabic Language II",
    "code": "عرب121",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "استكمال مهارات اللغة العربية والتعبير والتحليل.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-009",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 2",
    "english": "English II",
    "code": "نجل122",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "تطوير مهارات الإنجليزية والقواعد والمفردات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-010",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الثقافة الإسلامية 2",
    "english": "Islamic Culture II",
    "code": "سلم123",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مقرر تخصصي",
    "description": "موضوعات من الثقافة الإسلامية والقضايا المعاصرة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-011",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أساسيات علوم الحاسب",
    "english": "Fundamentals of Computer Science",
    "code": "عال124",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مقرر تخصصي",
    "description": "مقدمة للحوسبة والخوارزميات والبرمجيات والأنظمة والشبكات.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-012",
    "hasTheory": true,
    "hasPractical": false,
    "name": "حساب التكامل",
    "english": "Integral Calculus",
    "code": "ريض125",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "التكامل وقواعده وتطبيقاته الرياضية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-013",
    "name": "فيزياء عامة",
    "english": "General Physics",
    "code": "فيز126",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "مفاهيم الفيزياء العامة وتطبيقاتها الأساسية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-014",
    "name": "برمجة الحاسب 2",
    "english": "Computer Programming II",
    "code": "عال127",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "المصفوفات والدوال والملفات والمفاهيم البرمجية المتقدمة.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-015",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 3",
    "english": "English III",
    "code": "نجل211",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "اللغة الإنجليزية التقنية المرتبطة بالحاسوب وتقنيات المعلومات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-016",
    "name": "البرمجة الموجهة للكائنات",
    "english": "Object-Oriented Programming",
    "code": "عال212",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "الكائنات والفئات والوراثة والتغليف والتصميم البرمجي.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-017",
    "hasTheory": true,
    "hasPractical": false,
    "name": "نظرية الحوسبة",
    "english": "Theory of Computation",
    "code": "عال213",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "النماذج الرياضية للحوسبة واللغات الشكلية والآلات.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-018",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مقدمة في الإحصاء والاحتمالات",
    "english": "Introduction to Statistics and Probability",
    "code": "ريض214",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "أساسيات الاحتمالات والإحصاء وتحليل البيانات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-019",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الجبر الخطي",
    "english": "Linear Algebra",
    "code": "ريض215",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "المصفوفات والمتجهات والتحويلات الخطية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-020",
    "name": "تنظيم ومعمارية الحاسب",
    "english": "Computer Organization and Architecture",
    "code": "هـ حا216",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "تنظيم المكونات الداخلية للحاسوب وبنية المعالج والذاكرة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-021",
    "name": "هياكل البيانات",
    "english": "Data Structures",
    "code": "عال217",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "القوائم والمكدسات والطوابير والأشجار وبنى تخزين البيانات.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-022",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مهارات الاتصال",
    "english": "Communication Skills",
    "code": "اجت221",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "الاتصال الفعّال والعمل الجماعي وتقديم المعلومات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-023",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 4",
    "english": "English IV",
    "code": "نجل222",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "استكمال الإنجليزية التقنية والكتابة والتواصل في الحوسبة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-024",
    "name": "أنظمة الويب",
    "english": "Web Systems",
    "code": "تم223",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "أساسيات تطبيقات الويب وتقنيات المتصفح والخادم.",
    "topics": [],
    "resources": [
      "university",
      "mdn"
    ]
  },
  {
    "id": "hu-cs-025",
    "name": "تصميم وتحليل الخوارزميات",
    "english": "Algorithm Design and Analysis",
    "code": "عال224",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "تصميم الخوارزميات وتحليل كفاءتها وتعقيدها.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-026",
    "name": "مقدمة في قواعد البيانات",
    "english": "Introduction to Databases",
    "code": "تم225",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "النموذج العلائقي وSQL وتصميم قواعد البيانات.",
    "topics": [],
    "resources": [
      "university",
      "db"
    ]
  },
  {
    "id": "hu-cs-027",
    "name": "نظم التشغيل",
    "english": "Operating Systems",
    "code": "عال226",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "إدارة العمليات والذاكرة والملفات وموارد الحاسب.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-028",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أسس البحث العلمي",
    "english": "Scientific Research Methods",
    "code": "عال227",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "منهجيات البحث وصياغة المشكلات وإعداد التقارير.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-029",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أخلاقيات المهنة",
    "english": "Professional Ethics",
    "code": "تم311",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مقرر تخصصي",
    "description": "القيم المهنية والملكية الفكرية وأخلاقيات التقنية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-030",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الكتابة الفنية",
    "english": "Technical Writing",
    "code": "نجل312",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "إعداد التقارير التقنية وصياغتها وعرض نتائجها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-031",
    "name": "الذكاء الاصطناعي",
    "english": "Artificial Intelligence",
    "code": "عال313",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "مبادئ الذكاء الاصطناعي والبحث وتمثيل المعرفة.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-032",
    "name": "البرمجة المرئية",
    "english": "Visual Programming",
    "code": "تم314",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "إنشاء تطبيقات ذات واجهات رسومية والتعامل مع الأحداث.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-033",
    "name": "أساسيات شبكات الحاسب",
    "english": "Computer Networks Fundamentals",
    "code": "تم315",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "مفاهيم الشبكات وبروتوكولات الاتصال وأجهزتها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-034",
    "name": "إدارة قواعد البيانات",
    "english": "Database Administration",
    "code": "تم316",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "إدارة قواعد البيانات وصلاحياتها وأمنها وأدائها.",
    "topics": [],
    "resources": [
      "university",
      "db"
    ]
  },
  {
    "id": "hu-cs-035",
    "name": "هندسة البرمجيات",
    "english": "Software Engineering",
    "code": "عال317",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "تحليل المتطلبات والتصميم والتطوير والاختبار.",
    "topics": [],
    "resources": [
      "university",
      "github"
    ]
  },
  {
    "id": "hu-cs-036",
    "hasTheory": true,
    "hasPractical": false,
    "name": "ندوة في علوم الحاسب",
    "english": "Computer Science Seminar",
    "code": "عال321",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مقرر تخصصي",
    "description": "عرض ومناقشة موضوعات بحثية وتطبيقية في علوم الحاسوب.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-037",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مواضيع مختارة في علوم الحاسب",
    "english": "Selected Topics in Computer Science",
    "code": "عال322",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "موضوعات متقدمة أو مستجدة يحددها وصف المقرر المعتمد.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-038",
    "name": "رسومات الحاسب",
    "english": "Computer Graphics",
    "code": "عال323",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "تمثيل الصور والأشكال ومعالجتها بالحاسوب.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-039",
    "name": "أمن الحاسب",
    "english": "Computer Security",
    "code": "عال324",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "التهديدات الأمنية وآليات حماية الأنظمة والبيانات.",
    "topics": [],
    "resources": [
      "university",
      "owasp"
    ]
  },
  {
    "id": "hu-cs-040",
    "name": "تصميم وتطوير البرمجيات",
    "english": "Software Design and Development",
    "code": "تم برمج325",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "تصميم حلول برمجية وتنفيذها وفق منهجيات تطوير منظمة.",
    "topics": [],
    "resources": [
      "university",
      "github"
    ]
  },
  {
    "id": "hu-cs-041",
    "name": "نظم التشغيل المتقدمة",
    "english": "Advanced Operating Systems",
    "code": "عال326",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "موضوعات متقدمة في جدولة العمليات والتزامن وإدارة الموارد.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-042",
    "hasTheory": true,
    "hasPractical": false,
    "name": "التحليل العددي",
    "english": "Numerical Analysis",
    "code": "ريض327",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "طرق عددية لحل المعادلات والتقريب وتقدير الخطأ.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-043",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مشروع التخرج 1",
    "english": "Graduation Project I",
    "code": "عال411",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مشروع تخرج",
    "description": "اختيار مشروع التخرج وتحليل متطلباته وإعداد تصميمه.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-044",
    "name": "أنظمة اتخاذ القرارات والأعمال الذكية",
    "english": "Decision Support and Business Intelligence",
    "code": "عال412",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مقرر تخصصي",
    "description": "دعم القرار وتحليل البيانات ومفاهيم ذكاء الأعمال.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-045",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مشروع التخرج 2",
    "english": "Graduation Project II",
    "code": "عال421",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مشروع تخرج",
    "description": "تنفيذ مشروع التخرج واختباره وتوثيقه ومناقشته.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-046",
    "name": "تطوير تطبيقات الموبايل",
    "english": "Mobile Application Development",
    "code": "تم برمج414",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تصميم وبناء تطبيقات للأجهزة المحمولة.",
    "topics": [],
    "resources": [
      "university",
      "mdn"
    ]
  },
  {
    "id": "hu-cs-047",
    "name": "تصميم وتطوير البرمجيات المتقدم",
    "english": "Advanced Software Design and Development",
    "code": "تم برمج415",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تقنيات متقدمة لتصميم الأنظمة البرمجية وتطويرها.",
    "topics": [],
    "resources": [
      "university",
      "github"
    ]
  },
  {
    "id": "hu-cs-048",
    "hasTheory": true,
    "hasPractical": false,
    "name": "التنقيب عن البيانات",
    "english": "Data Mining",
    "code": "عال418",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "اكتشاف الأنماط والمعرفة من مجموعات البيانات.",
    "topics": [],
    "resources": [
      "university",
      "db"
    ]
  },
  {
    "id": "hu-cs-049",
    "name": "تطوير تطبيقات الموبايل المتقدم",
    "english": "Advanced Mobile Application Development",
    "code": "تم برمج423",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "بناء تطبيقات جوال أكثر تعقيدًا وتكاملًا.",
    "topics": [],
    "resources": [
      "university",
      "mdn"
    ]
  }
])
// كافة المقررات الاختيارية المنشورة في جدول المتطلبات. لا تعني وجوب أخذها جميعًا.
export const csElectiveCourses: Course[] = fromRaw([
  {
    "id": "hu-cs-050",
    "name": "معالجة اللغات الطبيعية",
    "english": "Natural Language Processing",
    "code": "عال328",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تحليل النصوص واللغة الطبيعية باستخدام الأساليب الحاسوبية.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-051",
    "name": "نظم موزعة",
    "english": "Distributed Systems",
    "code": "عال329",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تصميم الأنظمة التي تتوزع مكوناتها عبر عدة أجهزة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-052",
    "name": "شبكات لاسلكية",
    "english": "Wireless Networks",
    "code": "شبك325",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تقنيات الاتصال اللاسلكي وبروتوكولاتها وتطبيقاتها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-046",
    "name": "تطوير تطبيقات الموبايل",
    "english": "Mobile Application Development",
    "code": "تم برمج414",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تصميم وبناء تطبيقات للأجهزة المحمولة.",
    "topics": [],
    "resources": [
      "university",
      "mdn"
    ]
  },
  {
    "id": "hu-cs-047",
    "name": "تصميم وتطوير البرمجيات المتقدم",
    "english": "Advanced Software Design and Development",
    "code": "تم برمج415",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تقنيات متقدمة لتصميم الأنظمة البرمجية وتطويرها.",
    "topics": [],
    "resources": [
      "university",
      "github"
    ]
  },
  {
    "id": "hu-cs-053",
    "name": "تصميم وإدارة الشبكات",
    "english": "Network Design and Management",
    "code": "تم شبك414",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تخطيط الشبكات وتهيئتها وإدارتها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-054",
    "name": "نظرية وإدارة نظم المعلومات",
    "english": "Information Systems Theory and Management",
    "code": "عال416",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "مفاهيم نظم المعلومات وإدارتها داخل المؤسسات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-055",
    "name": "الحوسبة السحابية",
    "english": "Cloud Computing",
    "code": "عال417",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "الخدمات والبنى السحابية ونماذج نشر التطبيقات.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-048",
    "name": "التنقيب عن البيانات",
    "english": "Data Mining",
    "code": "عال418",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "اكتشاف الأنماط والمعرفة من مجموعات البيانات.",
    "topics": [],
    "resources": [
      "university",
      "db"
    ]
  },
  {
    "id": "hu-cs-056",
    "name": "تقنيات المعالجة المتوازية",
    "english": "Parallel Processing Techniques",
    "code": "هـ حا423",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تنفيذ المهام المتوازية على عدة معالجات أو أنوية.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-057",
    "name": "معالجة الصور الرقمية",
    "english": "Digital Image Processing",
    "code": "هـ حا413",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "عمليات تحسين الصور الرقمية وتحليلها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-058",
    "name": "معالجة الرؤية بالحاسب",
    "english": "Computer Vision Processing",
    "code": "هـ حا422",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "استخلاص المعلومات من الصور ومقاطع الفيديو.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-059",
    "name": "تقنيات الوسائط المتعددة",
    "english": "Multimedia Technologies",
    "code": "هـ حا414",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تنسيقات الوسائط الرقمية ومعالجتها وتطبيقاتها.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-049",
    "name": "تطوير تطبيقات الموبايل المتقدم",
    "english": "Advanced Mobile Application Development",
    "code": "تم برمج423",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "بناء تطبيقات جوال أكثر تعقيدًا وتكاملًا.",
    "topics": [],
    "resources": [
      "university",
      "mdn"
    ]
  },
  {
    "id": "hu-cs-060",
    "name": "تعليم الآلة",
    "english": "Machine Learning",
    "code": "عال424",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "نماذج تعلم الآلة والتدريب والتقييم.",
    "topics": [],
    "resources": [
      "university",
      "cs50"
    ]
  },
  {
    "id": "hu-cs-061",
    "name": "نظم خبيرة",
    "english": "Expert Systems",
    "code": "عال425",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "تمثيل المعرفة ومحركات الاستنتاج في النظم الخبيرة.",
    "topics": [],
    "resources": [
      "university"
    ]
  },
  {
    "id": "hu-cs-062",
    "name": "الأمن الإلكتروني",
    "english": "Cybersecurity",
    "code": "عال426",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "اختياري",
    "description": "التهديدات والحماية في البيئات والخدمات الرقمية.",
    "topics": [],
    "resources": [
      "university",
      "owasp"
    ]
  }
])
export const csAllCourses: Course[] = Array.from(new Map([...csPlanCourses, ...csElectiveCourses].map(course => [course.code, course])).values())
