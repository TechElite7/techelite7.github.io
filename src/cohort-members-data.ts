/**
 * Tech Elite - الدفعة السابعة
 * اكتب الأسماء التي وافق أصحابها على ظهورها علنًا في الموقع.
 * يمكنك إضافة عدد غير محدود من الطلاب أو المطورين.
 *
 * مثال للهيكل فقط (احذف التعليق واستبدل الاسم عند توفره):
 * students: [{ name: 'الاسم الحقيقي للطالب' }]
 * representatives: [{ name: 'اسم مندوب الدفعة', role: 'مندوب الدفعة' }]
 * developers: [{ name: 'اسم المطور', role: 'تطوير الواجهة', url: 'https://github.com/...' }]
 */
export type CohortPerson = {
  name: string
  role?: string
  url?: string
  photo?: string
}

export const cohortMembers: {
  students: CohortPerson[]
  representatives: CohortPerson[]
  developers: CohortPerson[]
} = {
  representatives: [
    { name: 'محمد نجيب العطاس' , },
  ],
  students: [
    { name: 'ناصر الجريري' },//,photo: '/assets/ahmed.jpg'//
    { name: 'احمد خميس باجحاو' },
    { name: 'زيد التميمي' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
    { name: 'علي سعيد عميَر' },
  ],

  developers: [
    { name: 'حسين فهمي محمد بن عمر' },
    { name: 'عبدالرحمن زكي دغيش' },
  ],
}
