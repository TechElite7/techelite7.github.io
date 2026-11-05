/**
 * الخطة الدراسية المنشورة من كلية الحاسبات وتقنية المعلومات، جامعة حضرموت:
 * https://hu.edu.ye/compfac/it/
 * الأسماء والرموز والفصول والساعات: من جداول المستوى في موقع الجامعة.
 * الأوصاف: تلخيص تحريري عربي لموضوعات المقررات، وليست نقلاً حرفيًا.
 * المراجع الخارجية: موارد تعلم عامة، لا تُعد ملازمًا رسمية للجامعة.
 * ملاحظة: الجداول المنشورة تختلف في بعض الأكواد والساعات؛ راجع README.
 */
export const siteConfig = {
  batchName: 'Tech Elite',
  universityName: 'جامعة حضرموت',
  facultyName: 'كلية الحاسبات وتقنية المعلومات',
  yearLabel: 'دفعة تقنية المعلومات',
  batchEmail: '',
  // ضع اسم المستخدم الحقيقي للبوت كما يظهر في BotFather (ليس الاسم الظاهر Tech_Elite7).
  // مثال للصيغة فقط: '@ExampleBot'، واتركه فارغًا حتى تتأكد منه.
  telegramBotUsername: '@TechEliteHUBot',
  officialPlanUrl: 'https://hu.edu.ye/compfac/it/',
  announcedCreditHours: 132,
}

export type Resource = {
  title: string
  kind: 'وصف رسمي للمقرر' | 'توثيق رسمي' | 'مسار تعلم' | 'مرجع إضافي' | 'ملزمة PDF' | 'ملزمة نظري' | 'ملزمة عملي' | 'ملخص' | 'فيديو' | 'برنامج' | 'اختبار' | 'تطبيق عملي'
  url: string
  description?: string
}
export type StudyTrack = 'مشترك' | 'تطوير البرمجيات' | 'شبكات الحاسب'
export type Course = {
  hasTheory?: boolean
  hasPractical?: boolean
  id: string
  name: string
  english: string
  code: string
  year: number
  semester: 1 | 2
  track: StudyTrack
  creditHours: number
  category: string
  description: string
  topics: string[]
  resources: Resource[]
}

// قائمة مختارة من المصادر الرسمية والعامة؛ يمكنك تعديلها وإضافة الملازم المصرّح بنشرها.
const resourceCatalog: Record<string, Resource> = {
  "uni": {
    "title": "الخطة الرسمية لقسم تقنية المعلومات — جامعة حضرموت",
    "kind": "وصف رسمي للمقرر",
    "url": "https://hu.edu.ye/compfac/it/",
    "description": "أسماء المقررات ورموزها وخطتها من موقع الجامعة؛ يُراجع وصف المقرر عند توفره"
  },
  "cs50": {
    "title": "CS50x — مدخل علوم الحاسوب والبرمجة",
    "kind": "مسار تعلم",
    "url": "https://cs50.harvard.edu/x/",
    "description": "دروس برمجة عامة بالإنجليزية"
  },
  "ms": {
    "title": "Microsoft Learn — التعلم التقني",
    "kind": "مسار تعلم",
    "url": "https://learn.microsoft.com/en-us/training/",
    "description": "دورات مجانية تقنية بمستويات متعددة"
  },
  "python": {
    "title": "Python — الدليل التعليمي الرسمي",
    "kind": "توثيق رسمي",
    "url": "https://docs.python.org/3/tutorial/",
    "description": "مرجع لغة Python، وليس شرطًا أن تكون لغة المقرر في الجامعة"
  },
  "vscode": {
    "title": "تحميل Visual Studio Code",
    "kind": "برنامج",
    "url": "https://code.visualstudio.com/download",
    "description": "محرر أكواد مجاني"
  },
  "csharp": {
    "title": "Microsoft Learn — البرمجة باستخدام C#",
    "kind": "مسار تعلم",
    "url": "https://learn.microsoft.com/en-us/dotnet/csharp/",
    "description": "شروحات رسمية عن البرمجة والكائنات"
  },
  "mdn": {
    "title": "MDN — تعلم تطوير الويب",
    "kind": "مسار تعلم",
    "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    "description": "HTML وCSS وJavaScript وتطوير الويب"
  },
  "sql": {
    "title": "Microsoft SQL Server — التوثيق الرسمي",
    "kind": "توثيق رسمي",
    "url": "https://learn.microsoft.com/en-us/sql/",
    "description": "قواعد البيانات وSQL Server والإدارة"
  },
  "sqlget": {
    "title": "تنزيل SQL Server للمطورين",
    "kind": "برنامج",
    "url": "https://www.microsoft.com/en-us/sql-server/sql-server-downloads",
    "description": "تحقق من الإصدار ومتطلبات الجهاز"
  },
  "flutter": {
    "title": "Flutter — دليل التعلم الرسمي",
    "kind": "توثيق رسمي",
    "url": "https://docs.flutter.dev/learn",
    "description": "بناء تطبيقات عبر المنصات"
  },
  "flutterget": {
    "title": "تثبيت Flutter",
    "kind": "برنامج",
    "url": "https://docs.flutter.dev/get-started/install",
    "description": "إرشادات Flutter الرسمية"
  },
  "android": {
    "title": "Android Developers — دورات Android",
    "kind": "مسار تعلم",
    "url": "https://developer.android.com/courses",
    "description": "تطوير تطبيقات أندرويد"
  },
  "cisco": {
    "title": "Cisco Networking Academy",
    "kind": "مسار تعلم",
    "url": "https://www.netacad.com/",
    "description": "موارد تعلّم الشبكات والأمن ومهارات الحاسب"
  },
  "owasp": {
    "title": "OWASP — إرشادات اختبار أمان تطبيقات الويب",
    "kind": "مرجع إضافي",
    "url": "https://owasp.org/www-project-web-security-testing-guide/",
    "description": "مرجع تخصصي للأمن التطبيقي"
  },
  "linux": {
    "title": "Linux — وثائق Ubuntu",
    "kind": "توثيق رسمي",
    "url": "https://documentation.ubuntu.com/",
    "description": "العمل على أنظمة Linux وإدارتها"
  },
  "git": {
    "title": "GitHub Docs — البدء بـ GitHub",
    "kind": "توثيق رسمي",
    "url": "https://docs.github.com/en/get-started",
    "description": "أدوات إدارة الإصدارات والمشاريع"
  },
  "swe": {
    "title": "SWEBOK — دليل المعرفة في هندسة البرمجيات",
    "kind": "مرجع إضافي",
    "url": "https://www.computer.org/education/bodies-of-knowledge/software-engineering",
    "description": "مرجع معرفي من IEEE Computer Society"
  },
  "ethics": {
    "title": "ميثاق أخلاقيات ACM",
    "kind": "مرجع إضافي",
    "url": "https://www.acm.org/code-of-ethics",
    "description": "مبادئ الأخلاق المهنية في الحوسبة"
  },
  "math": {
    "title": "MIT OpenCourseWare — مواد الرياضيات",
    "kind": "مسار تعلم",
    "url": "https://ocw.mit.edu/",
    "description": "مساقات جامعية مفتوحة مع محتوى ومواد تعليمية"
  },
  "openstax": {
    "title": "OpenStax — كتب رياضيات مجانية",
    "kind": "مرجع إضافي",
    "url": "https://openstax.org/subjects/math",
    "description": "كتب مفتوحة مرخصة للاستخدام التعليمي"
  },
  "english": {
    "title": "British Council — LearnEnglish",
    "kind": "مسار تعلم",
    "url": "https://learnenglish.britishcouncil.org/",
    "description": "تطوير اللغة الإنجليزية"
  },
  "purdue": {
    "title": "Purdue OWL — الكتابة الأكاديمية",
    "kind": "مرجع إضافي",
    "url": "https://owl.purdue.edu/owl/",
    "description": "كتابة وتقارير ومراجع أكاديمية"
  },
  "khan": {
    "title": "Khan Academy — Math",
    "kind": "مسار تعلم",
    "url": "https://www.khanacademy.org/math",
    "description": "شروحات وتمارين تفاعلية"
  },
  "project": {
    "title": "Atlassian Agile Coach",
    "kind": "مرجع إضافي",
    "url": "https://www.atlassian.com/agile",
    "description": "مقدمة للمنهجيات والمشاريع الرشيقة"
  },
  "webapi": {
    "title": "ASP.NET Core Web API — Microsoft",
    "kind": "توثيق رسمي",
    "url": "https://learn.microsoft.com/en-us/aspnet/core/web-api/",
    "description": "توثيق بناء خدمات الويب"
  },
  "net": {
    "title": "Wireshark — تحميل أداة تحليل الشبكات",
    "kind": "برنامج",
    "url": "https://www.wireshark.org/download.html",
    "description": "برنامج تحليل حزم الشبكات؛ استخدمه على شبكات تملك صلاحية فحصها"
  }
}

export const courses: Course[] = [
  {
    "id": "hu-it-01",
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
    "description": "أساسيات الكتابة الصحيحة والنحو والإملاء وتحسين فهم النصوص العربية.",
    "topics": [
      "النحو",
      "الإملاء",
      "مهارات القراءة"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-02",
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
    "description": "تنمية القراءة والكتابة والاستماع والمحادثة باللغة الإنجليزية مع القواعد والمفردات الأساسية.",
    "topics": [
      "القراءة",
      "الاستماع",
      "التراكيب الأساسية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["english"]]
  },
  {
    "id": "hu-it-03",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الثقافة الإسلامية 1",
    "english": "Islamic Culture I",
    "code": "سلم113",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "ثقافة عامة",
    "description": "دراسة مفاهيم الثقافة الإسلامية والحضارة والقيم والقضايا الفكرية ذات الصلة.",
    "topics": [
      "الثقافة والحضارة",
      "القيم",
      "القضايا الفكرية"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-04",
    "hasTheory": true,
    "hasPractical": false,
    "name": "حساب التفاضل",
    "english": "Differential Calculus",
    "code": "ريض115",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "التعرف على النهايات والاتصال والاشتقاق وتطبيقاته في التحليل وحل المشكلات.",
    "topics": [
      "النهايات",
      "المشتقات",
      "تطبيقات التفاضل"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["math"], resourceCatalog["openstax"]]
  },
  {
    "id": "hu-it-05",
    "hasTheory": true,
    "hasPractical": false,
    "name": "هياكل متقطعة",
    "english": "Discrete Structures",
    "code": "عال116",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "أساسيات المنطق والمجموعات والعلاقات والأشجار والمفاهيم الرياضية المرتبطة بالحوسبة.",
    "topics": [
      "المنطق الرياضي",
      "المجموعات",
      "العد والأشجار"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["math"]]
  },
  {
    "id": "hu-it-06",
    "name": "برمجة الحاسب 1",
    "english": "Computer Programming I",
    "code": "عال117",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "مدخل إلى التفكير الخوارزمي وكتابة البرامج والشروط والحلقات والمصفوفات.",
    "topics": [
      "الخوارزميات",
      "الشروط والحلقات",
      "المصفوفات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cs50"], resourceCatalog["vscode"]]
  },
  {
    "id": "hu-it-07",
    "name": "مهارات الحاسوب",
    "english": "Computer Skills",
    "code": "عال114",
    "year": 1,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مهارات أساسية",
    "description": "التعامل مع نظام التشغيل والتطبيقات المكتبية والإنترنت والبريد الإلكتروني.",
    "topics": [
      "أنظمة التشغيل",
      "تطبيقات المكتب",
      "مهارات الإنترنت"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["ms"]]
  },
  {
    "id": "hu-it-08",
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
    "description": "تنمية مهارات التعبير والكتابة الوظيفية وأساليب اللغة العربية والبحث المعجمي.",
    "topics": [
      "الكتابة الوظيفية",
      "الأساليب",
      "النصوص"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-09",
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
    "description": "استكمال المهارات اللغوية وتوسيع المفردات والتراكيب والقراءة والاستماع.",
    "topics": [
      "المحادثة",
      "القواعد",
      "القراءة والاستماع"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["english"]]
  },
  {
    "id": "hu-it-10",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الثقافة الإسلامية 2",
    "english": "Islamic Culture II",
    "code": "سلم123",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "ثقافة عامة",
    "description": "مناقشة موضوعات من الفكر الإسلامي وحقوق الإنسان وقضايا المجتمع المعاصرة.",
    "topics": [
      "الفكر الإسلامي",
      "حقوق الإنسان",
      "قضايا المجتمع"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-11",
    "hasTheory": true,
    "hasPractical": false,
    "name": "حساب التكامل",
    "english": "Integral Calculus",
    "code": "ريض125",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "المفاهيم الأساسية للتكامل المحدد وغير المحدد وطرقه وتطبيقاته الرياضية.",
    "topics": [
      "التكامل",
      "طرق التكامل",
      "تطبيقات التكامل"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["math"], resourceCatalog["openstax"]]
  },
  {
    "id": "hu-it-12",
    "name": "فيزياء عامة",
    "english": "General Physics",
    "code": "فيز126",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "مبادئ الحركة وخواص المادة وتطبيقات الرياضيات في فهم المسائل الفيزيائية.",
    "topics": [
      "الحركة",
      "خواص المادة",
      "المسائل الفيزيائية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["khan"]]
  },
  {
    "id": "hu-it-13",
    "name": "برمجة الحاسب 2",
    "english": "Computer Programming II",
    "code": "عال127",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "توسيع مهارات البرمجة بالمصفوفات متعددة الأبعاد والدوال والمؤشرات والملفات.",
    "topics": [
      "الدوال",
      "المصفوفات المتقدمة",
      "المؤشرات والملفات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cs50"], resourceCatalog["vscode"]]
  },
  {
    "id": "hu-it-14",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أساسيات تقنية المعلومات",
    "english": "Information Technology Fundamentals",
    "code": "تم124",
    "year": 1,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مهارات أساسية",
    "description": "نظرة شاملة على نظم الحاسب والبرمجيات والمعلومات والشبكات وتفاعل المستخدم مع التقنية.",
    "topics": [
      "نظم الحاسب",
      "الشبكات",
      "إدارة المعلومات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["ms"], resourceCatalog["cisco"]]
  },
  {
    "id": "hu-it-15",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 3",
    "english": "Technical English III",
    "code": "نجل211",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "تطوير الإنجليزية التقنية في الحوسبة والبرمجة والويب والعمل المهني.",
    "topics": [
      "المصطلحات التقنية",
      "القراءة التقنية",
      "التواصل المهني"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["english"]]
  },
  {
    "id": "hu-it-16",
    "name": "البرمجة الموجهة للكائنات",
    "english": "Object-Oriented Programming",
    "code": "عال212",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "المفاهيم الكائنية مثل الأصناف والوراثة والتغليف والتعددية الشكلية والاستثناءات.",
    "topics": [
      "الأصناف والكائنات",
      "الوراثة",
      "التغليف وتعدد الأشكال"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["csharp"]]
  },
  {
    "id": "hu-it-17",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أساسيات الاقتصاد",
    "english": "Economics Fundamentals",
    "code": "قصد213",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "إدارة وأعمال",
    "description": "عرض المفاهيم والمبادئ الاقتصادية الأساسية وتحليل الظواهر والمشكلات الاقتصادية.",
    "topics": [
      "الندرة",
      "الطلب والعرض",
      "السياسات الاقتصادية"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-18",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مقدمة في الإحصاء والاحتمالات",
    "english": "Introduction to Statistics and Probability",
    "code": "ريض214",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "مفاهيم الاحتمالات والمتغيرات العشوائية والتوزيعات والاستدلال الإحصائي.",
    "topics": [
      "الاحتمالات",
      "التوزيعات",
      "الإحصاء الاستدلالي"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["khan"], resourceCatalog["math"]]
  },
  {
    "id": "hu-it-19",
    "hasTheory": true,
    "hasPractical": false,
    "name": "الجبر الخطي",
    "english": "Linear Algebra",
    "code": "ريض215",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "رياضيات",
    "description": "دراسة المعادلات الخطية والمصفوفات والمحددات والمتجهات وتطبيقاتها.",
    "topics": [
      "المصفوفات",
      "المتجهات",
      "المعادلات الخطية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["math"]]
  },
  {
    "id": "hu-it-20",
    "name": "تنظيم ومعمارية الحاسب",
    "english": "Computer Organization and Architecture",
    "code": "هـ حا216",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "أنظمة الحاسب",
    "description": "دراسة تنظيم المعالج والذاكرة وأجهزة الإدخال والإخراج والبنية الداخلية للحاسب.",
    "topics": [
      "المعالج",
      "الذاكرة",
      "بنية الحاسب"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cs50"]]
  },
  {
    "id": "hu-it-21",
    "name": "هياكل البيانات",
    "english": "Data Structures",
    "code": "عال217",
    "year": 2,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "هياكل تخزين البيانات وتحليل الخوارزميات والقوائم والمكدسات والأشجار والرسوم.",
    "topics": [
      "القوائم",
      "المكدسات والطوابير",
      "الأشجار والرسوم"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cs50"]]
  },
  {
    "id": "hu-it-22",
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
    "description": "فهم الاتصال اللفظي وغير اللفظي والعمل الجماعي ومهارات التواصل المهني.",
    "topics": [
      "التواصل اللفظي",
      "التواصل المهني",
      "مهارات العرض"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-23",
    "hasTheory": true,
    "hasPractical": false,
    "name": "اللغة الإنجليزية 4",
    "english": "Technical English IV",
    "code": "نجل222",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "لغة ومهارات",
    "description": "استكمال الإنجليزية التقنية في موضوعات الإنترنت والبرمجة والتصميم والعمل في مجال التقنية.",
    "topics": [
      "المصطلحات التقنية",
      "التواصل",
      "فهم النصوص"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["english"]]
  },
  {
    "id": "hu-it-24",
    "name": "أنظمة الويب",
    "english": "Web Systems",
    "code": "تم223",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "الويب",
    "description": "تطوير صفحات الويب وتقنيات HTML وCSS والأنظمة الديناميكية وإدارة خوادم الويب.",
    "topics": [
      "HTML وCSS",
      "تطبيقات الويب",
      "خوادم الويب"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["mdn"], resourceCatalog["vscode"]]
  },
  {
    "id": "hu-it-25",
    "name": "تفاعل الإنسان والحاسب",
    "english": "Human-Computer Interaction",
    "code": "تم224",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "تطوير التطبيقات",
    "description": "تصميم واجهات الاستخدام وفحص سهولة الاستخدام وتحسين تفاعل الإنسان مع التطبيقات.",
    "topics": [
      "تصميم الواجهات",
      "قابلية الاستخدام",
      "تقييم الواجهات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["mdn"]]
  },
  {
    "id": "hu-it-26",
    "name": "مقدمة في قواعد البيانات",
    "english": "Introduction to Databases",
    "code": "تم225",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "قواعد البيانات",
    "description": "أساسيات قواعد البيانات العلائقية ونمذجة ERD واستعلامات SQL والتطبيع.",
    "topics": [
      "ERD",
      "SQL",
      "التطبيع"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["sql"], resourceCatalog["sqlget"]]
  },
  {
    "id": "hu-it-27",
    "name": "نظم التشغيل",
    "english": "Operating Systems",
    "code": "عال226",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "أنظمة الحاسب",
    "description": "مفاهيم إدارة العمليات والذاكرة والتخزين والأجهزة والحماية في نظم التشغيل.",
    "topics": [
      "العمليات",
      "إدارة الذاكرة",
      "أنظمة الملفات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["linux"]]
  },
  {
    "id": "hu-it-28",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مهارات التعلم والتفكير والبحث",
    "english": "Learning, Thinking and Research Skills",
    "code": "نهج227",
    "year": 2,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مهارات أساسية",
    "description": "استراتيجيات التعلم والتفكير وحل المشكلات وكتابة الأبحاث والتقارير؛ يظهر الاسم والرمز بصيغ مختلفة في صفحة الجامعة.",
    "topics": [
      "التعلم الذاتي",
      "التفكير",
      "البحث والتقارير"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["purdue"]]
  },
  {
    "id": "hu-it-29",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أخلاقيات المهنة",
    "english": "Professional Ethics",
    "code": "تم311",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 2,
    "category": "ثقافة عامة",
    "description": "المسؤولية المهنية وحقوق الملكية الفكرية وأخلاقيات البيانات والبرمجيات.",
    "topics": [
      "أخلاقيات الحوسبة",
      "الملكية الفكرية",
      "أمن البيانات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["ethics"]]
  },
  {
    "id": "hu-it-30",
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
    "description": "التقارير الفنية وملخصاتها والمقترحات وتنظيم الوثائق والكتابة المهنية.",
    "topics": [
      "كتابة التقارير",
      "الملخصات",
      "المقترحات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["purdue"]]
  },
  {
    "id": "hu-it-31",
    "name": "الدعم الفني في تقنية المعلومات",
    "english": "IT Technical Support",
    "code": "تم313",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "أنظمة الحاسب",
    "description": "صيانة الأجهزة والبرمجيات وتشخيص مشكلات الاستخدام وتقديم الدعم للمستخدمين.",
    "topics": [
      "تشخيص الأعطال",
      "الدعم الفني",
      "إدارة المشاكل"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["ms"]]
  },
  {
    "id": "hu-it-32",
    "name": "البرمجة المرئية",
    "english": "Visual Programming",
    "code": "تم314",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "برمجة التطبيقات الرسومية والأحداث والنوافذ مع تطبيقات عملية على .NET.",
    "topics": [
      "واجهات رسومية",
      "البرمجة بالأحداث",
      "تطبيقات .NET"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["csharp"], resourceCatalog["ms"]]
  },
  {
    "id": "hu-it-33",
    "name": "أساسيات شبكات الحاسب",
    "english": "Computer Networks Fundamentals",
    "code": "تم315",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "الشبكات",
    "description": "مبادئ شبكات الحاسب والبروتوكولات وطبقات الاتصال والشبكات اللاسلكية.",
    "topics": [
      "TCP/IP",
      "طبقات الشبكات",
      "البروتوكولات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"], resourceCatalog["net"]]
  },
  {
    "id": "hu-it-34",
    "name": "إدارة قواعد البيانات",
    "english": "Database Administration",
    "code": "تم316",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "قواعد البيانات",
    "description": "فهرسة البيانات وتحسين الاستعلامات والمعاملات والأمان وإدارة الأنظمة.",
    "topics": [
      "الفهرسة",
      "المعاملات",
      "أمان قاعدة البيانات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["sql"], resourceCatalog["sqlget"]]
  },
  {
    "id": "hu-it-35",
    "name": "هندسة البرمجيات",
    "english": "Software Engineering",
    "code": "عال317",
    "year": 3,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "مراحل تطوير البرمجيات وAgile ونمذجة الأنظمة والاختبار والصيانة.",
    "topics": [
      "دورة الحياة",
      "Agile",
      "النمذجة والاختبار"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["swe"], resourceCatalog["git"]]
  },
  {
    "id": "hu-it-36",
    "hasTheory": true,
    "hasPractical": false,
    "name": "ندوة في تقنية المعلومات",
    "english": "IT Seminar",
    "code": "تم321",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 2,
    "category": "مهارات أساسية",
    "description": "عروض ومناقشات وبحوث حول الاتجاهات والمستجدات في تقنية المعلومات.",
    "topics": [
      "عرض الأبحاث",
      "المناقشات",
      "التقنيات الناشئة"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["purdue"]]
  },
  {
    "id": "hu-it-37",
    "hasTheory": true,
    "hasPractical": false,
    "name": "أساسيات التجارة الإلكترونية",
    "english": "E-Commerce Fundamentals",
    "code": "تم322",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "إدارة وأعمال",
    "description": "نماذج التجارة الإلكترونية والخدمات الرقمية وتطبيقات البيع عبر الإنترنت.",
    "topics": [
      "نماذج التجارة الإلكترونية",
      "الدفع والتسويق",
      "المتاجر الرقمية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["mdn"]]
  },
  {
    "id": "hu-it-38",
    "name": "إدارة المشاريع",
    "english": "Project Management",
    "code": "تم323",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "إدارة وأعمال",
    "description": "التخطيط والتنفيذ والمتابعة وإدارة دورة حياة المشروعات ووثائقها.",
    "topics": [
      "تخطيط المشروع",
      "إدارة المراحل",
      "المتابعة"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["project"]]
  },
  {
    "id": "hu-it-39",
    "name": "أمن الحاسب",
    "english": "Computer Security",
    "code": "عال324",
    "year": 3,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "أمن المعلومات",
    "description": "حماية المعلومات والمصادقة والتشفير وأمن الشبكات والاتصالات.",
    "topics": [
      "التشفير",
      "المصادقة",
      "أمن الاتصالات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["owasp"], resourceCatalog["cisco"]]
  },
  {
    "id": "hu-it-40",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مشروع التخرج 1",
    "english": "Graduation Project I",
    "code": "تم411",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مشروع التخرج",
    "description": "اختيار مشكلة بحثية أو عملية، جمع المراجع وتحليل المتطلبات وإعداد مقترح المشروع.",
    "topics": [
      "مقترح المشروع",
      "المتطلبات",
      "المراجعة العلمية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["git"], resourceCatalog["purdue"]]
  },
  {
    "id": "hu-it-41",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مواضيع مختارة في تقنية المعلومات",
    "english": "Selected Topics in IT",
    "code": "تم412",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مهارات أساسية",
    "description": "دراسة موضوعات حديثة في تقنية المعلومات تختلف بحسب ما يحدده القسم.",
    "topics": [
      "التقنيات الحديثة",
      "العرض والبحث",
      "التحليل"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["ms"]]
  },
  {
    "id": "hu-it-42",
    "hasTheory": true,
    "hasPractical": false,
    "name": "ريادة الأعمال في تقنية المعلومات",
    "english": "IT Entrepreneurship",
    "code": "تم413",
    "year": 4,
    "semester": 1,
    "track": "مشترك",
    "creditHours": 3,
    "category": "إدارة وأعمال",
    "description": "تطوير أفكار تجارية تقنية وخطط الأعمال والتسويق والتمويل للمشروعات الناشئة.",
    "topics": [
      "نموذج العمل",
      "التسويق",
      "خطة المشروع"
    ],
    "resources": [resourceCatalog["uni"]]
  },
  {
    "id": "hu-it-43",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مشروع التخرج 2",
    "english": "Graduation Project II",
    "code": "تم421",
    "year": 4,
    "semester": 2,
    "track": "مشترك",
    "creditHours": 3,
    "category": "مشروع التخرج",
    "description": "استكمال تنفيذ المشروع واختباره وإعداد التقرير النهائي وتقديمه للمناقشة.",
    "topics": [
      "التنفيذ",
      "الاختبار",
      "المناقشة النهائية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["git"], resourceCatalog["swe"]]
  },
  {
    "id": "hu-it-44",
    "name": "تصميم وتطوير البرمجيات",
    "english": "Software Design and Development",
    "code": "تم برمج325",
    "year": 3,
    "semester": 2,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "التخطيط لبناء البرمجيات وتنفيذها وفق أسس التصميم والتطوير.",
    "topics": [
      "تصميم الأنظمة",
      "تنفيذ البرمجيات",
      "جودة الكود"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["swe"], resourceCatalog["git"]]
  },
  {
    "id": "hu-it-45",
    "name": "برمجة قواعد البيانات",
    "english": "Database Programming",
    "code": "تم برمج326",
    "year": 3,
    "semester": 2,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "قواعد البيانات",
    "description": "البرمجة المرتبطة بقواعد البيانات والاستعلامات وربط التطبيقات بالمخازن.",
    "topics": [
      "SQL",
      "الوصول للبيانات",
      "ربط التطبيقات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["sql"], resourceCatalog["webapi"]]
  },
  {
    "id": "hu-it-46",
    "name": "تطوير تطبيقات الموبايل",
    "english": "Mobile Application Development",
    "code": "تم برمج414",
    "year": 4,
    "semester": 1,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "تطوير التطبيقات",
    "description": "بناء تطبيقات الهاتف والتفاعل مع واجهات الأجهزة والخدمات.",
    "topics": [
      "واجهات التطبيقات",
      "تطبيقات الجوال",
      "ربط البيانات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["flutter"], resourceCatalog["android"], resourceCatalog["flutterget"]]
  },
  {
    "id": "hu-it-47",
    "name": "تصميم وتطوير البرمجيات المتقدم",
    "english": "Advanced Software Design and Development",
    "code": "تم برمج415",
    "year": 4,
    "semester": 1,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "مفاهيم متقدمة لتصميم التطبيقات وإدارة بنيتها وجودة تنفيذها.",
    "topics": [
      "هندسة الحلول",
      "اختبار البرامج",
      "أنماط التصميم"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["swe"], resourceCatalog["git"]]
  },
  {
    "id": "hu-it-48",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مواضيع مختارة في تطوير البرمجيات",
    "english": "Selected Topics in Software Development",
    "code": "تم برمج422",
    "year": 4,
    "semester": 2,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "البرمجة",
    "description": "موضوعات تطبيقية حديثة تحددها الكلية في مجال تطوير البرمجيات.",
    "topics": [
      "تقنيات حديثة",
      "حلول برمجية",
      "تجارب عملية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["git"], resourceCatalog["ms"]]
  },
  {
    "id": "hu-it-49",
    "name": "تطوير تطبيقات الموبايل المتقدم",
    "english": "Advanced Mobile App Development",
    "code": "تم برمج423",
    "year": 4,
    "semester": 2,
    "track": "تطوير البرمجيات",
    "creditHours": 3,
    "category": "تطوير التطبيقات",
    "description": "مفاهيم وتطبيقات متقدمة في بناء تطبيقات الهواتف.",
    "topics": [
      "إدارة الحالة",
      "واجهات متقدمة",
      "تكامل الخدمات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["flutter"], resourceCatalog["android"]]
  },
  {
    "id": "hu-it-50",
    "name": "الشبكات اللاسلكية",
    "english": "Wireless Networks",
    "code": "تم شبك325",
    "year": 3,
    "semester": 2,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "الشبكات",
    "description": "مبادئ الشبكات اللاسلكية وتقنياتها وبروتوكولات الاتصال والتشغيل.",
    "topics": [
      "Wi-Fi",
      "البروتوكولات",
      "الشبكات اللاسلكية"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"]]
  },
  {
    "id": "hu-it-51",
    "name": "التوجيه والتحويل في الشبكات",
    "english": "Routing and Switching",
    "code": "تم شبك326",
    "year": 3,
    "semester": 2,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "الشبكات",
    "description": "مبادئ إعداد الموجهات والمحولات وتبادل الحزم بين الشبكات.",
    "topics": [
      "Routing",
      "Switching",
      "العنونة"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"], resourceCatalog["net"]]
  },
  {
    "id": "hu-it-52",
    "name": "تصميم وإدارة الشبكات",
    "english": "Network Design and Management",
    "code": "تم شبك414",
    "year": 4,
    "semester": 1,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "الشبكات",
    "description": "تصميم الشبكات وإدارتها ومراقبة الأداء ومعالجة المشكلات.",
    "topics": [
      "التصميم",
      "الإدارة",
      "مراقبة الأداء"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"], resourceCatalog["net"]]
  },
  {
    "id": "hu-it-53",
    "name": "أمن الشبكات",
    "english": "Network Security",
    "code": "تم شبك415",
    "year": 4,
    "semester": 1,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "أمن المعلومات",
    "description": "تطبيق مفاهيم الحماية على شبكات المؤسسة وبروتوكولات الاتصال.",
    "topics": [
      "الجدران النارية",
      "حماية الشبكات",
      "التوثيق"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"], resourceCatalog["owasp"]]
  },
  {
    "id": "hu-it-54",
    "hasTheory": true,
    "hasPractical": false,
    "name": "مواضيع مختارة في شبكات الحاسب",
    "english": "Selected Topics in Networks",
    "code": "تم شبك422",
    "year": 4,
    "semester": 2,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "الشبكات",
    "description": "موضوعات تطبيقية ومستجدات في مجال شبكات الحاسب.",
    "topics": [
      "اتجاهات الشبكات",
      "دراسة حالات",
      "تطبيقات"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["cisco"]]
  },
  {
    "id": "hu-it-55",
    "name": "خدمات نظم تشغيل الشبكات",
    "english": "Network Operating System Services",
    "code": "تم شبك423",
    "year": 4,
    "semester": 2,
    "track": "شبكات الحاسب",
    "creditHours": 3,
    "category": "أنظمة الحاسب",
    "description": "إدارة أنظمة تشغيل الشبكات وخدماتها ومواردها للمستخدمين.",
    "topics": [
      "خدمات الشبكة",
      "المستخدمون",
      "إدارة الخوادم"
    ],
    "resources": [resourceCatalog["uni"], resourceCatalog["linux"], resourceCatalog["cisco"]]
  }
]

export const learningTracks = [
  { title: 'البرمجة وتطوير الأنظمة', english: 'Software Development', description: 'تحويل الأفكار إلى أنظمة وتطبيقات قابلة للاستخدام.', icon: 'code', tags: ['C#', 'Python', 'APIs'] },
  { title: 'الشبكات والبنية التحتية', english: 'Networking & Infrastructure', description: 'بناء الشبكات وإدارتها وضمان موثوقية الاتصال.', icon: 'network', tags: ['TCP/IP', 'Cloud', 'Servers'] },
  { title: 'قواعد البيانات', english: 'Data & Databases', description: 'تصميم البيانات وإدارتها وتحويلها إلى معلومات.', icon: 'database', tags: ['SQL', 'Data Modeling', 'Analytics'] },
  { title: 'الأمن السيبراني', english: 'Cybersecurity', description: 'حماية الأنظمة والخدمات من المخاطر الرقمية.', icon: 'security', tags: ['Security', 'Privacy', 'Risk'] },
  { title: 'تطبيقات الويب والجوال', english: 'Web & Mobile', description: 'صناعة تجارب رقمية تعمل أينما كان المستخدم.', icon: 'mobile', tags: ['Web', 'Flutter', 'UX'] },
] as const
