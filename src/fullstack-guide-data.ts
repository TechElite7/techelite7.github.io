/**
 * Tech Elite — Full Stack roadmap data.
 * لإضافة مصدر إلى أي مرحلة: افتح المرحلة المطلوبة وأضف كائنًا إلى resources أو tools.
 * الروابط الجاهزة هي مصادر رسمية/تعليمية، وليست ملفات أو ملازم تابعة للجامعة.
 */
export type GuideLink = { title: string; url: string; note?: string }
export type GuideStage = {
  id: string
  title: string
  english: string
  duration?: string
  goal: string
  skills: string[]
  practice: string
  resources: GuideLink[]
  tools: GuideLink[]
}

export const fullstackStages: GuideStage[] = [
  {
    id: 'foundations', title: 'افهم الويب وجهّز بيئة العمل', english: 'Web Foundations',
    goal: 'تعرف كيف يتواصل المتصفح مع الخادم، وما الفرق بين الواجهة والخدمات الخلفية.',
    skills: ['HTTP و HTTPS', 'الإنترنت و DNS', 'المتصفح وأدوات المطور', 'الطرفية والمجلدات'],
    practice: 'افتح DevTools وافحص طلبات الشبكة لموقع بسيط، وأنشئ مجلدًا لأول مشروع.',
    resources: [
      { title: 'MDN — تعلّم تطوير الويب', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
      { title: 'كيف يعمل الويب — MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works' },
    ],
    tools: [
      { title: 'Visual Studio Code — محرر الأكواد', url: 'https://code.visualstudio.com/download' },
      { title: 'Chrome — متصفح وأدوات فحص', url: 'https://www.google.com/chrome/' },
    ],
  },
  {
    id: 'html-css', title: 'ابنِ الواجهات بـ HTML و CSS', english: 'HTML · CSS · Responsive',
    goal: 'تصمم صفحات صحيحة ومتجاوبة وسهلة الاستخدام قبل الدخول في الأطر البرمجية.',
    skills: ['HTML دلالي', 'Flexbox و Grid', 'Responsive Design', 'أساسيات الوصول Accessibility'],
    practice: 'اصنع صفحة تعريف شخصية تتكيف مع اللابتوب والجوال دون استخدام إطار عمل.',
    resources: [
      { title: 'MDN — HTML', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content' },
      { title: 'MDN — CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics' },
      { title: 'web.dev — التصميم المتجاوب', url: 'https://web.dev/learn/design' },
    ],
    tools: [ { title: 'Firefox Developer Edition — اختياري', url: 'https://www.mozilla.org/en-US/firefox/developer/' } ],
  },
  {
    id: 'javascript', title: 'أتقن JavaScript ثم TypeScript', english: 'JavaScript · TypeScript',
    goal: 'تحوّل الصفحات الثابتة إلى تطبيقات تفاعلية وتفهم منطق البرمجة في المتصفح.',
    skills: ['الدوال والمصفوفات والكائنات', 'DOM والأحداث', 'Promises و async/await', 'TypeScript والأنواع'],
    practice: 'ابنِ قائمة مهام تحفظ البيانات محليًا وتتحقق من المدخلات.',
    resources: [
      { title: 'MDN — JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
      { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
    ],
    tools: [ { title: 'Node.js LTS — بيئة تشغيل وأدوات npm', url: 'https://nodejs.org/en/download' } ],
  },
  {
    id: 'git', title: 'إدارة الإصدارات والعمل الجماعي', english: 'Git · GitHub',
    goal: 'تحفظ نسخ مشروعك وتوثّق التغييرات وتتعاون مع فريقك بطريقة آمنة.',
    skills: ['git init و commit', 'branches', 'Pull Requests', 'README و .gitignore'],
    practice: 'ارفع مشروعك السابق إلى مستودع GitHub واكتب README واضحًا.',
    resources: [
      { title: 'كتاب Pro Git المجاني', url: 'https://git-scm.com/book/en/v2' },
      { title: 'GitHub Skills', url: 'https://skills.github.com/' },
    ],
    tools: [
      { title: 'تحميل Git', url: 'https://git-scm.com/downloads' },
      { title: 'GitHub Desktop — اختياري', url: 'https://desktop.github.com/download/' },
    ],
  },
  {
    id: 'frontend', title: 'تطوير الواجهات الأمامية', english: 'React · Vite · UI',
    goal: 'تبني واجهات منظمة بمكونات قابلة لإعادة الاستخدام، مع التنقل وجلب البيانات.',
    skills: ['React Components', 'Props و State', 'Forms', 'Fetching APIs', 'إدارة الأخطاء'],
    practice: 'اصنع واجهة متجر أو لوحة مهام، واجلب بيانات تجريبية من API.',
    resources: [
      { title: 'React — Learn', url: 'https://react.dev/learn' },
      { title: 'Vite — Getting Started', url: 'https://vite.dev/guide/' },
      { title: 'Tailwind CSS — Documentation', url: 'https://tailwindcss.com/docs/installation' },
    ],
    tools: [ { title: 'React Developer Tools', url: 'https://react.dev/learn/react-developer-tools' } ],
  },
  {
    id: 'backend', title: 'الخلفية وواجهات API', english: 'Backend · ASP.NET Core / Node.js',
    goal: 'تكتب خادمًا يعالج الطلبات والتحقق من البيانات ويرجع نتائج منظمة عبر REST API.',
    skills: ['Controllers و Routes', 'HTTP Methods', 'Validation', 'DTOs', 'Error Handling', 'Dependency Injection'],
    practice: 'ابنِ REST API للمهام يدعم الإضافة والقراءة والتعديل والحذف (CRUD).',
    resources: [
      { title: 'Microsoft Learn — ASP.NET Core Web API', url: 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api' },
      { title: 'Node.js — Learn (بديل تقني)', url: 'https://nodejs.org/en/learn' },
      { title: 'MDN — HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
    ],
    tools: [
      { title: '.NET SDK', url: 'https://dotnet.microsoft.com/en-us/download' },
      { title: 'Postman — اختبار APIs', url: 'https://www.postman.com/downloads/' },
    ],
  },
  {
    id: 'database', title: 'قواعد البيانات وربط الخادم', english: 'SQL · EF Core',
    goal: 'تربط التطبيق بقاعدة بيانات وتتعلم تصميم الجداول والعلاقات والاستعلامات.',
    skills: ['الجداول والعلاقات', 'Primary/Foreign Keys', 'JOIN و Index', 'Migrations', 'ORM'],
    practice: 'اربط API بمخزن بيانات، وجرّب إنشاء الجداول والاستعلامات والترحيلات.',
    resources: [
      { title: 'Microsoft Learn — SQL', url: 'https://learn.microsoft.com/en-us/sql/' },
      { title: 'EF Core — Getting Started', url: 'https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app' },
      { title: 'PostgreSQL Tutorial — Official', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
    ],
    tools: [
      { title: 'SQL Server Developer', url: 'https://www.microsoft.com/en-us/sql-server/sql-server-downloads' },
      { title: 'SQL Server Management Studio', url: 'https://learn.microsoft.com/en-us/ssms/install/install' },
    ],
  },
  {
    id: 'security', title: 'الحماية والاختبار', english: 'Authentication · Security · Testing',
    goal: 'تتعلم أساسيات الحسابات والصلاحيات والاختبارات وحماية بيانات المستخدمين.',
    skills: ['Authentication / Authorization', 'JWT و Cookies', 'OWASP Top 10', 'Unit/Integration Tests', 'أسرار البيئة'],
    practice: 'أضف تسجيل دخول وصلاحيات مستخدم، مع اختبارات للعمليات الحرجة.',
    resources: [
      { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'ASP.NET Core Security', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/' },
      { title: 'Testing React Apps', url: 'https://testing-library.com/docs/react-testing-library/intro/' },
    ],
    tools: [ { title: 'OWASP ZAP — فحص تعليمي لتطبيقاتك فقط', url: 'https://www.zaproxy.org/download/' } ],
  },
  {
    id: 'integration', title: 'مشروع Full Stack متكامل', english: 'End-to-End Project',
    goal: 'توصل الواجهة بالخلفية وقاعدة البيانات وتنتقل من دروس منفصلة إلى منتج واحد.',
    skills: ['CORS', 'API Integration', 'Handling Loading/Errors', 'Pagination', 'File Uploads'],
    practice: 'اصنع نظام حجوزات أو متجرًا بسيطًا: React + ASP.NET Core + SQL Server، مع لوحة إدارة.',
    resources: [
      { title: 'Microsoft — Web API', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/' },
      { title: 'React — Escape Hatches', url: 'https://react.dev/learn/escape-hatches' },
    ],
    tools: [ { title: 'Bruno — عميل API اختياري', url: 'https://www.usebruno.com/downloads' } ],
  },
  {
    id: 'deployment', title: 'النشر والملف المهني', english: 'Deployment · CI/CD · Portfolio',
    goal: 'تنشر موقعك وخدمتك الخلفية وتتعلم تسجيل الأخطاء وتبني معرضًا لمشاريعك.',
    skills: ['Environment Variables', 'Build & Deploy', 'CI/CD', 'Logs & Monitoring', 'Portfolio & README'],
    practice: 'انشر واجهة ثابتة في استضافة مناسبة، وخدمة API في استضافة تدعمها، مع فحص الأمان والإعدادات.',
    resources: [
      { title: 'Cloudflare Pages — React Guide', url: 'https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/' },
      { title: 'GitHub Actions — Docs', url: 'https://docs.github.com/en/actions' },
      { title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/' },
    ],
    tools: [ { title: 'Docker Desktop — اختياري ومتطلباته أعلى', url: 'https://www.docker.com/products/docker-desktop/' } ],
  },
]

export const laptopTips = {
  title: 'جهاز مناسب للتعلم، لا جهاز استعراض',
  minimum: ['8GB RAM للأعمال البسيطة؛ 16GB مفضلة عند تشغيل IDE وقاعدة بيانات ومحاكي معًا', 'SSD سريع، و512GB خيار عملي إذا كنت تخزن أدوات ومشاريع كثيرة', 'معالج حديث مناسب للاستخدام البرمجي أهم من اختيار بطاقة رسومية منفصلة لكل طالب'],
  cautions: ['تأكد من إمكانية زيادة RAM والتخزين قبل الشراء', 'افحص البطارية والشاشة والحرارة والضمان، وخاصة في الأجهزة المستعملة', 'إذا ستستخدم Android Emulator أو Docker أو الذكاء الاصطناعي محليًا، راجع متطلبات هذه الأدوات أولًا'],
  links: [
    { title: 'متطلبات Android Studio', url: 'https://developer.android.com/studio/install' },
    { title: 'متطلبات Visual Studio', url: 'https://learn.microsoft.com/en-us/visualstudio/releases/2022/system-requirements' },
  ] as GuideLink[]
}
