export interface ProjectDocument {
  title: string
  messageId: number
}
export interface GraduationProject {
  id: string
  title: string
  team: string[]
  summary: string
  documents: ProjectDocument[]
}
export const graduationProjects: GraduationProject[]
export function getGraduationProject(id: string): GraduationProject | undefined
export function publishedProjectDocuments(project: GraduationProject | undefined): ProjectDocument[]
export function graduationProjectBotUrl(botUsername: string | undefined, projectId: string): string | null
