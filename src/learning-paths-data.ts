/* Tech Elite learning resources. Verified against official provider pages 2026-11-03.
 * Free training is not the same as a free certificate; status is explicit below.
 */
export type CourseCategory = 'تطوير الويب' | 'أساسيات البرمجة' | 'قواعد البيانات' | 'الأمن السيبراني' | 'الشبكات' | 'الذكاء الاصطناعي' | 'الحوسبة السحابية' | 'تطوير الخوادم'
export type CourseLevel = 'مبتدئ' | 'متوسط' | 'متقدم'
export type Credential = 'شهادة مجانية' | 'شارة رقمية مجانية' | 'إنجاز تعليمي' | 'بدون شهادة' | 'شهادة مدفوعة أو دعم مالي'
export type LearningCourse = {
  id: string
  title: string
  provider: string
  providerKey: 'freecodecamp' | 'cs50' | 'cisco' | 'ibm' | 'aws' | 'microsoft' | 'odin' | 'satr' | 'udemy' | 'coursera'
  category: CourseCategory
  level: CourseLevel
  language: string
  duration: string
  credential: Credential
  credentialNote: string
  accessNote?: string
  description: string
  practice: string
  url: string
  sourceUrl: string
}

export const coursesVerifiedOn = '4 نوفمبر 2026'
export const learningCourses: LearningCourse[] = [
  {
    id: 'fcc-fullstack', title: 'Certified Full-Stack Developer', provider: 'freeCodeCamp', providerKey: 'freecodecamp', category: 'تطوير الويب', level: 'متوسط', language: 'الإنجليزية', duration: 'تعلم ذاتي', credential: 'شهادة مجانية',
    credentialNote: 'الحصول على شهادة المسار يتطلب إنهاء شهادات المراحل والاختبار وفق شروط المنصة.',
    description: 'مسار متكامل لتطوير المواقع من الواجهات إلى قواعد البيانات وواجهات API.',
    practice: 'ابنِ موقعًا شخصيًا ثم مشروع Full Stack موثقًا على GitHub.',
    url: 'https://www.freecodecamp.org/learn/full-stack-developer-v9', sourceUrl: 'https://www.freecodecamp.org/learn/full-stack-developer-v9',
  },
  {
    id: 'cs50x', title: 'CS50: Introduction to Computer Science', provider: 'Harvard CS50', providerKey: 'cs50', category: 'أساسيات البرمجة', level: 'مبتدئ', language: 'الإنجليزية', duration: '11 أسبوعًا من المواد', credential: 'شهادة مجانية',
    credentialNote: 'شهادة CS50 مجانية بعد استيفاء متطلبات المسائل والمشروع؛ شهادة edX الموثقة مدفوعة.',
    description: 'مدخل قوي للتفكير الخوارزمي والبرمجة وعلوم الحاسوب مع مشروع نهائي.',
    practice: 'احتفظ بمشروع CS50 النهائي مع README يشرح عمله.',
    url: 'https://cs50.harvard.edu/x/2026/', sourceUrl: 'https://cs50.harvard.edu/x/certificate/',
  },
  {
    id: 'cisco-cyber', title: 'Introduction to Cybersecurity', provider: 'Cisco Networking Academy', providerKey: 'cisco', category: 'الأمن السيبراني', level: 'مبتدئ', language: 'العربية والإنجليزية', duration: '6 ساعات', credential: 'شارة رقمية مجانية',
    credentialNote: 'تتيح المنصة شارة إتمام عند استيفاء متطلبات الدورة؛ ليست شهادة مهنية CCST.',
    description: 'تعرف إلى التهديدات الرقمية وأساليب الحماية ومجالات الأمن السيبراني.',
    practice: 'اكتب قائمة تحقق لحماية حساباتك وأجهزتك.',
    url: 'https://www.netacad.com/ar/courses/introduction-to-cybersecurity', sourceUrl: 'https://www.netacad.com/ar/courses/introduction-to-cybersecurity',
  },
  {
    id: 'cisco-network', title: 'Networking Basics', provider: 'Cisco Networking Academy', providerKey: 'cisco', category: 'الشبكات', level: 'مبتدئ', language: 'العربية والإنجليزية', duration: '22 ساعة', credential: 'شارة رقمية مجانية',
    credentialNote: 'شارة تعلم رقمية عند إتمام شروط الدورة؛ لا تعادل شهادة CCNA المهنية.',
    description: 'أساسيات البروتوكولات والعناوين وأجهزة الشبكات مع مختبرات تطبيقية.',
    practice: 'ارسم شبكة صغيرة واشرح الفرق بين الراوتر والسويتش.',
    url: 'https://www.netacad.com/courses/networking-basics', sourceUrl: 'https://www.netacad.com/courses/networking-basics/how-routers-work',
  },
  {
    id: 'ibm-ai', title: 'Artificial Intelligence Fundamentals', provider: 'IBM SkillsBuild', providerKey: 'ibm', category: 'الذكاء الاصطناعي', level: 'مبتدئ', language: 'العربية والإنجليزية', duration: '10 ساعات فأكثر', credential: 'شارة رقمية مجانية',
    credentialNote: 'اعتماد رقمي من SkillsBuild بعد استكمال أنشطة وشروط المسار.',
    description: 'مفاهيم تعلم الآلة ومعالجة اللغة والذكاء الاصطناعي المسؤول.',
    practice: 'صمّم فكرة تطبيق ذكاء اصطناعي وحدد مخاطره وحدوده.',
    url: 'https://skillsbuild.org/ar/digital-credentials', sourceUrl: 'https://skillsbuild.org/ar/digital-credentials',
  },
  {
    id: 'aws-educate', title: 'AWS Educate: Cloud Skills', provider: 'AWS Educate', providerKey: 'aws', category: 'الحوسبة السحابية', level: 'مبتدئ', language: 'الإنجليزية (حسب الوحدة)', duration: 'تعلم ذاتي', credential: 'شارة رقمية مجانية',
    credentialNote: 'تتوفر شارات لبعض أنشطة AWS Educate المؤهلة؛ ليست شهادة AWS Certification.',
    description: 'تعلّم أساسيات الحوسبة السحابية ومفاهيم التخزين والشبكات من خلال وحدات تطبيقية.',
    practice: 'وثّق تصميمًا مبسطًا لنشر موقع على الخدمات السحابية.',
    url: 'https://aws.amazon.com/education/awseducate/', sourceUrl: 'https://aws.amazon.com/education/awseducate/',
  },
  {
    id: 'ms-csharp', title: 'اكتب تعليماتك البرمجية الأولى باستخدام C#', provider: 'Microsoft Learn', providerKey: 'microsoft', category: 'أساسيات البرمجة', level: 'مبتدئ', language: 'العربية', duration: '35 دقيقة', credential: 'إنجاز تعليمي',
    credentialNote: 'إنجاز في ملف Microsoft Learn بعد التقييم؛ ليس شهادة Microsoft Certification.',
    description: 'ابدأ كتابة برامج C# وفهم الجمل الأساسية وإصلاح الأخطاء الشائعة.',
    practice: 'انشر برنامج Console صغيرًا مع طريقة تشغيله.',
    url: 'https://learn.microsoft.com/ar-sa/training/modules/csharp-write-first/', sourceUrl: 'https://learn.microsoft.com/ar-sa/training/modules/csharp-write-first/',
  },
  {
    id: 'cs50-sql', title: 'CS50: Introduction to Databases with SQL', provider: 'Harvard CS50', providerKey: 'cs50', category: 'قواعد البيانات', level: 'مبتدئ', language: 'الإنجليزية', duration: 'تعلم ذاتي', credential: 'شهادة مجانية',
    credentialNote: 'شهادة CS50 مجانية بعد اجتياز التمارين والمشروع النهائي؛ شهادة edX الموثقة مدفوعة.',
    description: 'مدخل عملي للاستعلامات وتصميم قواعد البيانات والعلاقات.',
    practice: 'صمّم قاعدة بيانات لنظام طلاب مع استعلامات موثقة.',
    url: 'https://cs50.harvard.edu/sql/', sourceUrl: 'https://cs50.harvard.edu/sql/certificate/',
  },
  {
    id: 'odin', title: 'Full Stack JavaScript Path', provider: 'The Odin Project', providerKey: 'odin', category: 'تطوير الويب', level: 'مبتدئ', language: 'الإنجليزية', duration: 'تعلم ذاتي', credential: 'بدون شهادة',
    credentialNote: 'التعليم والمشاريع مجانيان؛ لا نعتمد وجود شهادة إتمام رسمية.',
    description: 'تعلّم تطوير الويب ببناء تطبيقات حقيقية ومشاريع قابلة للعرض.',
    practice: 'أنشئ معرض أعمال صغيرًا واجعل كل مشروع قابلًا للتجربة.',
    url: 'https://www.theodinproject.com/paths/full-stack-javascript', sourceUrl: 'https://www.theodinproject.com/',
  },
  {
    id: 'cisco-packet', title: 'Exploring Networking with Cisco Packet Tracer', provider: 'Cisco Networking Academy', providerKey: 'cisco', category: 'الشبكات', level: 'مبتدئ', language: 'الإنجليزية', duration: '3 ساعات', credential: 'شارة رقمية مجانية',
    credentialNote: 'شارة رقمية عند استيفاء متطلبات الدورة.',
    description: 'تجربة إعداد شبكة مكتب صغير ومراقبة حركة الاتصال باستخدام Packet Tracer.',
    practice: 'احتفظ بملف محاكاة الشبكة ولقطات إعداداتها.',
    url: 'https://www.netacad.com/courses/exploring-networking-cisco-packet-tracer', sourceUrl: 'https://www.netacad.com/courses/exploring-networking-cisco-packet-tracer',
  },
  {
    id: 'ibm-it-basics', title: 'أساسيات تكنولوجيا المعلومات', provider: 'IBM SkillsBuild', providerKey: 'ibm', category: 'أساسيات البرمجة', level: 'مبتدئ', language: 'العربية', duration: '11 ساعة', credential: 'شارة رقمية مجانية',
    credentialNote: 'مسار IBM SkillsBuild يمنح إثباتًا رقميًا للمؤهلين بعد استيفاء متطلبات التعلم.',
    description: 'مدخل مبسط للأجهزة والشبكات والبرمجيات وأساسيات دعم المستخدم وحل المشكلات.',
    practice: 'اكتب دليلًا مصغرًا لتشخيص أعطال جهاز أو شبكة محلية.',
    url: 'https://skillsbuild.org/ar/digital-credentials', sourceUrl: 'https://skillsbuild.org/ar/digital-credentials',
  },
  {
    id: 'ibm-web-basics', title: 'أساسيات تطوير الويب', provider: 'IBM SkillsBuild', providerKey: 'ibm', category: 'تطوير الويب', level: 'مبتدئ', language: 'العربية', duration: '12 ساعة فأكثر', credential: 'شارة رقمية مجانية',
    credentialNote: 'الإثبات الرقمي مرتبط بإكمال أنشطة الاعتماد لدى IBM، ولا يعادل شهادة احترافية.',
    description: 'فهم هيكل صفحات HTML وCSS وJavaScript ومبادئ تطوير المواقع واختبارها.',
    practice: 'أنشئ صفحة سيرة ذاتية متجاوبة وارفع كودها إلى GitHub.',
    url: 'https://skillsbuild.org/ar/digital-credentials', sourceUrl: 'https://skillsbuild.org/ar/digital-credentials',
  },
  {
    id: 'satr-python-101', title: 'Python 101 — أساسيات بايثون', provider: 'منصة سطر', providerKey: 'satr', category: 'أساسيات البرمجة', level: 'مبتدئ', language: 'العربية', duration: 'تعلم ذاتي', credential: 'شهادة مجانية',
    credentialNote: 'دورة عربية مجانية بالكامل مع شهادة إتمام مجانية من منصة سطر (أكاديمية طويق).',
    description: 'تعلّم أساسيات لغة Python وتجهيز بيئة العمل والتعامل مع المتغيرات وأنواع البيانات.',
    practice: 'اكتب برنامجًا يحسب الدرجات والمتوسطات من مدخلات المستخدم.',
    url: 'https://satr.tuwaiq.edu.sa/course/rRUQyVDkwQ/view', sourceUrl: 'https://satr.tuwaiq.edu.sa/course/rRUQyVDkwQ/view',
  },
  {
    id: 'cisco-python-1', title: 'Python Essentials 1', provider: 'Cisco Networking Academy', providerKey: 'cisco', category: 'أساسيات البرمجة', level: 'مبتدئ', language: 'الإنجليزية', duration: '30 ساعة', credential: 'شارة رقمية مجانية',
    credentialNote: 'شارة رقمية مجانية من Cisco عند اجتياز الاختبار النهائي؛ تؤهلك لاختبار PCEP.',
    description: 'تأسيس برمجي عملي في بايثون وهياكل البيانات والدوال وحل المشكلات الخوارزمية.',
    practice: 'ابنِ مشروعًا تفاعليًا ببايثون وارفعه على GitHub.',
    url: 'https://www.netacad.com/courses/python-essentials-1', sourceUrl: 'https://www.netacad.com/courses/python-essentials-1',
  },
  {
    id: 'ms-aspnet-core', title: 'تطوير الويب والخوادم باستخدام ASP.NET Core', provider: 'Microsoft Learn', providerKey: 'microsoft', category: 'تطوير الخوادم', level: 'متوسط', language: 'الإنجليزية', duration: 'تعلم ذاتي', credential: 'إنجاز تعليمي',
    credentialNote: 'إنجاز رسمي في ملف Microsoft Learn بعد إتمام التقييم؛ مناسب لمسار تطوير البرمجيات.',
    description: 'مدخل عملي لبناء تطبيقات الويب وواجهات الخوادم باستخدام .NET وC#.',
    practice: 'أنشئ خدمة API بسيطة تربط بين واجهة ويب وقاعدة بيانات.',
    url: 'https://learn.microsoft.com/en-us/training/modules/introduction-to-aspnet-core/', sourceUrl: 'https://learn.microsoft.com/en-us/training/modules/introduction-to-aspnet-core/',
  },
]
