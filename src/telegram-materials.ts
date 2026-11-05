/**
 * Tech Elite | روابط الملازم والنماذج التي تحتفظ بها الدفعة في تيليجرام.
 *
 * كل مادة لها id مستقل في src/data.ts. ابحث عن المادة، وخذ قيمة id.
 * ارفع الملف إلى قناة تيليجرام، ثم انسخ رابط الرسالة نفسها، وليس رابط القناة.
 * الصق الرابط هنا داخل مصفوفة المادة المناسبة. لا حاجة إلى قاعدة بيانات.
 *
 * مثال توضيحي فقط: احذف علامات التعليق وأضف رابط رسالتك الحقيقي.
 *
 * 'hu-it-26': [
 *   {
 *     title: 'ملزمة المحاضرة الأولى - مقدمة في قواعد البيانات',
 *     kind: 'ملزمة PDF',
 *     url: 'https://t.me/ACTUAL_CHANNEL/123',
 *     description: 'ملزمة الفصل الدراسي، PDF',
 *   },
 *   {
 *     title: 'نموذج اختبار سابق - مقدمة في قواعد البيانات',
 *     kind: 'اختبار',
 *     url: 'https://t.me/ACTUAL_CHANNEL/124',
 *     description: 'نموذج للمراجعة',
 *   },
 * ],
 *
 * رابط ACTUAL_CHANNEL هنا مجرد مثال في تعليق ولن يظهر في الموقع.
 * تذكير: انشر فقط الملفات المسموح بمشاركتها.
 */
import type { Course, Resource } from './data'
export { archiveMessageId } from './telegram-archive.js'

export const telegramMaterials: Record<string, Resource[]> = {
  'hu-it-20': [
    {
      title: 'المحاضرة الأولى',
      kind: 'ملزمة نظري',
      url: 'https://t.me/c/4300869581/2',
    },
    {
      title: 'المحاضرة الثانية',
      kind: 'ملزمة نظري',
      url: 'https://t.me/c/4300869581/4',
    },
  ],
  // ضع روابط المواد هنا عندما تتوفر بالفعل.
}

export function getAllCourseResources(course: Course): Resource[] {
  return [...course.resources, ...(telegramMaterials[course.id] ?? [])]
}
