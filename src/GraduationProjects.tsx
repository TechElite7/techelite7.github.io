import { ArrowUpLeft, BookOpenText, FileText, GraduationCap, Send, Users } from 'lucide-react'
import { graduationProjects, graduationProjectBotUrl, publishedProjectDocuments } from './graduation-projects-data.js'
import './graduation-projects.css'

export default function GraduationProjects({ botUsername }: { botUsername?: string }) {
  return (
    <section className="te-projects section" id="graduation-projects" aria-labelledby="te-projects-heading">
      <div className="container">
        <div className="te-projects-intro">
          <div>
            <span className="te-projects-kicker"><GraduationCap size={17} /> TECH ELITE · BATCH 07</span>
            <h2 id="te-projects-heading">مشاريع <span>تخرج دفعتنا</span></h2>
            <p>هنا نوثّق مشاريع تخرج الدفعة السابعة وفرقها، ونتيح مستنداتها من خلال بوت الدفعة على تيليجرام.</p>
          </div>
          <span className="te-projects-counter">{graduationProjects.length} مشروع</span>
        </div>
        {graduationProjects.length === 0 ? (
          <div className="te-projects-soon">
            <div className="te-projects-soon-icon"><BookOpenText size={34} /></div>
            <h3>مشاريع التخرج قريبًا 🎓</h3>
            <p>سنضيف المشاريع ومستنداتها عند الانتهاء منها بنهاية المستوى الرابع إن شاء الله.</p>
            <span>لا توجد مستندات منشورة حاليًا</span>
          </div>
        ) : (
          <div className="te-projects-grid">
            {graduationProjects.map(project => {
              const link = graduationProjectBotUrl(botUsername, project.id)
              const documents = publishedProjectDocuments(project)
              return (
                <article className="te-project-card" key={project.id}>
                  <span className="te-project-card-icon"><GraduationCap size={25} /></span>
                  <h3>{project.title}</h3>
                  <p className="te-project-card-description">{project.summary}</p>
                  <p className="te-project-team"><Users size={16}/>{project.team.join(' · ') || 'سيُضاف الفريق لاحقًا'}</p>
                  <span className="te-project-doc-count"><FileText size={15}/>{documents.length} مستند منشور</span>
                  {link && documents.length > 0 ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="te-project-bot-link">
                      <Send size={17}/> استلام المستندات عبر البوت <ArrowUpLeft size={16}/>
                    </a>
                  ) : (
                    <span className="te-project-bot-pending">{documents.length === 0 ? 'المستندات ستُضاف قريبًا' : 'رابط البوت سيتوفر قريبًا'}</span>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
