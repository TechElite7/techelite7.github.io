import { useState } from "react";
import {
  Code2,
  GraduationCap,
  UserRoundCheck,
  Users,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cohortMembers } from "./cohort-members-data";
import type { CohortPerson } from "./cohort-members-data";
import "./cohort-members.css";

function PersonCard({ person }: { person: CohortPerson }) {
  return (
    <article className="te-person-card">
      <div className="te-person-avatar" aria-hidden="true">
        {person.photo ? (
          <img src={person.photo} alt="" loading="lazy" />
        ) : (
          <span>{person.name.trim().charAt(0)}</span>
        )}
      </div>
      <div className="te-person-copy">
        <h4>{person.name}</h4>
        {person.role && <p>{person.role}</p>}
      </div>
      {person.url && (
        <a
          className="te-person-link"
          href={person.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`رابط ${person.name}`}
        >
          <ExternalLink size={17} />
        </a>
      )}
    </article>
  );
}

function MembersSection({
  title,
  description,
  icon: Icon,
  items,
  empty,
  limit,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: CohortPerson[];
  empty: string;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand =
    typeof limit === "number" && limit > 0 && items.length > limit;
  const shownItems = canExpand && !expanded ? items.slice(0, limit) : items;

  return (
    <div className="te-members-block">
      <div className="te-members-heading">
        <span className="te-members-icon">
          <Icon size={22} />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {items.length > 0 && (
          <span className="te-members-count">{items.length}</span>
        )}
      </div>
      {items.length ? (
        <>
          <div className="te-members-grid">
            {shownItems.map((p, i) => (
              <PersonCard key={`${p.name}-${i}`} person={p} />
            ))}
          </div>
          {canExpand && (
            <div className="te-students-show-more">
              <span className="te-students-show-count">
                عرض {shownItems.length} من أصل {items.length} طالب
              </span>
              <button
                type="button"
                className="te-students-show-more-btn"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded
                  ? "عرض أول 6 طلاب"
                  : `عرض جميع الطلاب (${items.length})`}
                <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="te-members-empty">{empty}</p>
      )}
    </div>
  );
}

/** All names are sourced from src/cohort-members-data.ts, never invented or inferred. */
export default function CohortMembers() {
  return (
    <section
      className="section te-cohort-members"
      aria-labelledby="te-cohort-members-title"
    >
      <div className="container">
        <div className="section-head">
          <span className="kicker">
            <span className="kicker-line" />
            وجوه صنعت الحكاية
          </span>
          <h2 id="te-cohort-members-title">
            أعضاء <span>الدفعة السابعة</span>
          </h2>
          <p>
            أسماء طلاب Tech Elite ومندوب الدفعة والفريق الذي ساهم في تطوير هذا
            الموقع، مع توثيق الأسماء بعد اعتمادها.
          </p>
        </div>
        <div className="te-members-panel">
          <MembersSection
            title="طلاب دفعتنا"
            description="الأسماء التي وافق أصحابها على نشرها"
            icon={Users}
            items={cohortMembers.students}
            limit={6}
            empty="لم تُضف قائمة الطلاب بعد. سنعرض الأسماء هنا عند استلام القائمة المعتمدة."
          />
          <MembersSection
            title="مندوب الدفعة"
            description="ممثل الدفعة والمسؤول عن التنسيق"
            icon={UserRoundCheck}
            items={cohortMembers.representatives}
            empty="اسم المندوب لم يُضف بعد."
          />
          <MembersSection
            title="الفريق المطور للموقع"
            description="شكر خاص لمن عملوا على بناء Tech Elite وتطويره"
            icon={Code2}
            items={cohortMembers.developers}
            empty="لم تُضف أسماء مطوري الموقع بعد."
          />
        </div>
        <p className="te-members-note">
          <GraduationCap size={16} /> لإضافة الأسماء لاحقًا، عدّل ملف{" "}
          <code>src/cohort-members-data.ts</code> فقط.
        </p>
      </div>
    </section>
  );
}
