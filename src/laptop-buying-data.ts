/**
 * Tech Elite: إرشادات اختيار اللابتوب قبل بدء تعلم Full Stack.
 * المواصفات نصائح عملية وليست متطلبات رسمية لبرنامج واحد.
 * راجع دائمًا متطلبات البرامج من الروابط الرسمية أدناه.
 */
export type LaptopTier = {
  id: 'starter' | 'balanced' | 'heavy'
  label: string
  bestFor: string
  chip: string
  specs: { label: string; value: string }[]
  advice: string
}

export const laptopTiers: LaptopTier[] = [
  {
    id: 'starter', label: 'للبداية والميزانية المحدودة', chip: 'اقتصادي',
    bestFor: 'HTML وCSS وJavaScript وVS Code والمشاريع الخفيفة',
    specs: [
      { label: 'المعالج', value: 'معالج من الفئة المتوسطة، ويفضّل 4 أنوية فعلية أو أكثر' },
      { label: 'الجيل المقترح', value: 'Intel Core i5 من الجيل العاشر فأحدث أو Ryzen 5 من سلسلة 4000 فأحدث، بشرط تقييم الحالة والسعر والأداء' },
      { label: 'الذاكرة RAM', value: '8GB حد عملي للتعلم الخفيف، مع قابلية الترقية إلى 16GB' },
      { label: 'التخزين', value: 'SSD لا يقل عن 256GB، والأفضل 512GB' },
      { label: 'الشاشة', value: 'Full HD بدقة 1920×1080 ويفضّل IPS' },
    ],
    advice: 'يمكن البدء بهذا المستوى دون شراء جهاز جديد إذا كان الموجود يفي بالغرض. لا يُنصح به لتشغيل المحاكيات وأدوات كثيرة معًا.',
  },
  {
    id: 'balanced', label: 'الخيار المتوازن لطلاب IT وCS', chip: 'موصى به',
    bestFor: 'React وASP.NET Core وSQL Server ومشاريع Full Stack يومية',
    specs: [
      { label: 'المعالج', value: 'Intel Core i5 / Ryzen 5 أو ما يعادلهما' },
      { label: 'الجيل المقترح', value: 'Intel Core i5 من الجيل 12 فأحدث، أو Core Ultra 5 (Series 1 فأحدث)، أو Ryzen 5 من سلسلة 5000 فأحدث' },
      { label: 'الذاكرة RAM', value: '16GB، ويفضّل أن تكون قابلة للترقية' },
      { label: 'التخزين', value: 'SSD NVMe بحجم 512GB على الأقل' },
      { label: 'الشاشة', value: '14 إلى 16 بوصة، FHD أو أعلى، ويفضّل IPS' },
      { label: 'البطارية', value: 'بطارية بحالة جيدة + شاحن أصلي + تبريد مستقر' },
    ],
    advice: 'هذا توازن جيد عند مقارنة السعر والأداء. بطاقة الرسوميات المنفصلة ليست ضرورية لتطوير الويب المعتاد.',
  },
  {
    id: 'heavy', label: 'للبرامج الثقيلة والمحاكيات', chip: 'متقدم',
    bestFor: 'Android Emulator وDocker وعدة مشاريع وقواعد بيانات في الوقت نفسه',
    specs: [
      { label: 'المعالج', value: 'معالج قوي متعدد الأنوية يدعم Virtualization' },
      { label: 'الجيل المقترح', value: 'Intel Core i7 من الجيل 13 فأحدث أو Core Ultra 7 (Series 1 فأحدث)، أو Ryzen 7 من سلسلة 7000 فأحدث، مع مقارنة الموديل نفسه' },
      { label: 'الذاكرة RAM', value: '32GB مريحة للعمل الثقيل؛ متطلبات Android Studio الموصى بها تصل إلى 32GB' },
      { label: 'التخزين', value: '1TB NVMe SSD مناسب لتعدد SDKs والمحاكيات والمشاريع' },
      { label: 'الشاشة', value: 'FHD أو أعلى، مع دقة ألوان وراحة للعين' },
      { label: 'بطاقة الرسوميات', value: 'تُقيّم حسب الاستخدام: الألعاب/التصميم/التعلم الآلي المحلي، لا لمجرد Full Stack' },
    ],
    advice: 'لا تدفع ثمن مواصفات عالية لمجرد الاسم؛ حدد الأدوات التي تحتاجها فعلًا ثم راجع متطلباتها.',
  },
]

export const laptopChecks = [
  { title: 'اختبر حرارة الجهاز', text: 'شغّل مهامًا فعلية وراقب الحرارة، المراوح، والهبوط المفاجئ للأداء.' },
  { title: 'افحص حالة البطارية', text: 'اطلب تقرير Battery Health، وجرب الجهاز على البطارية ثم مع الشاحن.' },
  { title: 'تحقق من الذاكرة والتخزين', text: 'اقرأ مواصفات RAM الحقيقية وعدد الشقوق، وتأكد من سلامة SSD وإمكانية ترقيته.' },
  { title: 'جرّب الشاشة والمنافذ', text: 'افحص البكسلات والسطوع والمفصلات وUSB وHDMI وWi-Fi ولوحة المفاتيح.' },
  { title: 'افحص الافتراضية Virtualization', text: 'مهمة للمحاكيات وبيئات العمل الافتراضية، وقد تحتاج تفعيلها من BIOS/UEFI.' },
  { title: 'لا تنس خدمة ما بعد البيع', text: 'اسأل عن الضمان، وتوفر القطع، وتكلفة صيانة المروحة والبطارية والشاحن.' },
]

export const laptopReferences = [
  { title: 'كيف تتعرف على جيل معالج Intel؟', url: 'https://www.intel.com/content/www/us/en/processors/processor-numbers.html' },
  { title: 'متطلبات Android Studio الرسمية', url: 'https://developer.android.com/studio/install' },
  { title: 'متطلبات Visual Studio 2022', url: 'https://learn.microsoft.com/en-us/visualstudio/releases/2022/system-requirements' },
  { title: 'متطلبات Docker Desktop', url: 'https://docs.docker.com/desktop/setup/install/windows-install/' },
]
