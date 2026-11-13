/** Serializable assistant state. ALL is an explicit range; undefined is a missing slot. */
import type { SiteConversationState } from './assistant-intent'
export type Major = 'IT' | 'CS'
export type Level = 1 | 2 | 3 | 4
export type Semester = 1 | 2
export type Range<T> = T | 'ALL'
export type AcademicIntent = 'ListCourses' | 'CountCourses' | 'GetResources' | 'GetLecture' | 'CountResources' | 'CourseDetails'
export type CourseReference = { courseId: string; courseName: string; major: Major; year: number; semester: Semester }
export type AcademicConversationState = {
  version: 1
  major?: Range<Major>
  level?: Range<Level>
  semester?: Range<Semester>
  course?: CourseReference
  courseQuery?: string
  courseCandidates?: CourseReference[]
  includeAllCourseMatches?: boolean
  target: 'selection' | 'course'
  intent: AcademicIntent
  lectureNumber?: number
  resourceType?: 'lecture' | 'notes' | 'summary' | 'exam' | 'practical' | 'theory' | 'link'
  pendingRequest?: { intent: AcademicIntent; missing: 'major' | 'level' | 'course'; lectureNumber?: number }
  lastResults?: { kind: 'courses' | 'resources'; courses: CourseReference[]; resourceCount?: number }
}
export type AcademicTurn = { author: 'student' | 'assistant'; text: string; courseId?: string; academicState?: AcademicConversationState | null; siteState?: SiteConversationState | null }
