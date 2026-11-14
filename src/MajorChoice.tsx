import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Compass,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import SiteAssistant from "./SiteAssistant";
import "./te-major-quiz.css";
import "./te-chat-viewport-fix.css";
import "./chat-dark-home-quiz.css";

type Major = "IT" | "CS";
type Question = { prompt: string; it: string; cs: string };

const QUESTIONS: Question[] = [
  {
    prompt: "أي مشكلة تحب أن تحلها أكثر؟",
    cs: "مشكلة منطقية: أبتكر خوارزمية وأحسّن طريقة حلها.",
    it: "شبكة أو خدمة متوقفة: أشخّص السبب وأعيد تشغيلها بكفاءة.",
  },
  {
    prompt: "أي مشروع تختار لو أعطوك أسبوعًا؟",
    it: "تطبيق متكامل يربط الواجهة والخادم وقاعدة البيانات.",
    cs: "برنامج ذكي يحلل بيانات أو يبحث فيها بطريقة فعالة.",
  },
  {
    prompt: "أي مادة تشد انتباهك غالبًا؟",
    it: "الشبكات وقواعد البيانات والخوادم والتطبيقات.",
    cs: "الخوارزميات وهياكل البيانات والرياضيات الحاسوبية.",
  },
  {
    prompt: "عندما تواجه تقنية جديدة، ما السؤال الأول عندك؟",
    cs: "كيف تعمل من الداخل، وهل يمكن ابتكار طريقة أفضل؟",
    it: "كيف أستخدمها وأربطها بحل يخدم أشخاصًا حقيقيين؟",
  },
  {
    prompt: "أي نوع من المهام تستمتع به أكثر؟",
    cs: "تحليل المشكلة وتقسيمها إلى خطوات وبناء حل منطقي لها.",
    it: "إعداد الأنظمة وربط الخدمات والتأكد من أنها تعمل بشكل صحيح.",
  },
  {
    prompt: "أي نتيجة تشعرك بالإنجاز أكثر؟",
    it: "نظام أو تطبيق يعمل بشكل فعلي ويسهّل مهمة على المستخدم.",
    cs: "حل خوارزمي أو برمجي يعمل بكفاءة ويعالج مشكلة معقدة.",
  },
];

export default function MajorChoice({
  onMajor,
  onPlan,
  onNavigate,
  quizOnly = false,
}: {
  onMajor: (major: Major) => void;
  onPlan: (major: Major) => void;
  onNavigate: (page: "about" | "cs" | "plan" | "library" | "guide") => void;
  quizOnly?: boolean;
}) {
  // Match the chat page to the actual header height, not a guessed pixel offset.
  useEffect(() => {
    if (quizOnly) return;

    document.body.classList.add("te-chat-viewport-route");

    const main = document.getElementById("main-content");

    const update = () => {
      const top = Math.max(0, main?.getBoundingClientRect().top ?? 0);
      document.documentElement.style.setProperty(
        "--te-chat-top-offset",
        top + "px",
      );
    };

    update();

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;

    const header = document.querySelector(".site-header");
    const announcement = document.querySelector(".announcement-bar");

    if (header) observer?.observe(header);
    if (announcement) observer?.observe(announcement);

    window.addEventListener("resize", update);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      document.body.classList.remove("te-chat-viewport-route");
      document.documentElement.style.removeProperty("--te-chat-top-offset");
    };
  }, [quizOnly]);

  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<Major[]>([]);
  const quizRef = useRef<HTMLDivElement>(null);

  const count = answers.length;
  const totalQuestions = QUESTIONS.length;
  const done = count === totalQuestions;

  const itCount = answers.filter((answer) => answer === "IT").length;
  const csCount = answers.filter((answer) => answer === "CS").length;

  const outcome: Major | "BOTH" =
    itCount > csCount ? "IT" : csCount > itCount ? "CS" : "BOTH";

  // نسبة التقدم تعتمد على عدد الأسئلة المجابة من إجمالي الأسئلة
  const progress = Math.round((count / totalQuestions) * 100);

  function toggleQuiz() {
    setExpanded((current) => !current);

    if (!expanded) {
      window.setTimeout(
        () =>
          quizRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        60,
      );
    }
  }

  function choose(value: Major) {
    if (done) return;

    setAnswers((current) => [...current, value]);
  }

  return quizOnly ? (
    <section className="te-quiz-spot" aria-label="اختبار اختيار التخصص">
      <div className="te-quiz-invitation">
        <span className="te-quiz-invitation-icon">
          <Compass size={19} />
        </span>

        <div className="te-quiz-invitation-copy">
          <strong>هل تريد اختبار تحديد تخصصك؟</strong>
          <small>ستة أسئلة سريعة تساعدك تستكشف ميولك بين IT وCS</small>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="te-inline-quiz"
          onClick={toggleQuiz}
          className={`te-quiz-toggle ${expanded ? "expanded" : ""}`}
        >
          {expanded ? "إخفاء" : "ابدأ الاختبار"}
          <ChevronDown size={16} />
        </button>
      </div>

      {expanded && (
        <div id="te-inline-quiz" className="te-quiz-inline" ref={quizRef}>
          <div className="te-quiz-inline-head">
            <span>
              <Sparkles size={16} /> اختبار ميولك
            </span>

            <button
              type="button"
              aria-label="إغلاق الاختبار"
              title="إغلاق الاختبار"
              onClick={() => setExpanded(false)}
            >
              <X size={17} />
            </button>
          </div>

          {!done ? (
            <>
              <div className="te-quiz-progress-label">
                <span>
                  السؤال {count + 1} من {totalQuestions}
                </span>

                <span>{progress}%</span>
              </div>

              <div
                className="te-quiz-progress"
                role="progressbar"
                aria-label="التقدم في الاختبار"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={totalQuestions}
              >
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <h3>{QUESTIONS[count].prompt}</h3>

              <div className="te-quiz-answer-list">
                {(["IT", "CS"] as const).map((major) => (
                  <button
                    type="button"
                    key={major}
                    onClick={() => choose(major)}
                  >
                    {/* تم حذف IT / CS من الواجهة */}
                    <span>
                      {QUESTIONS[count][major === "IT" ? "it" : "cs"]}
                    </span>

                    <ArrowLeft size={17} />
                  </button>
                ))}
              </div>

              {count > 0 && (
                <button
                  type="button"
                  className="te-quiz-back"
                  onClick={() => setAnswers((current) => current.slice(0, -1))}
                >
                  الرجوع للسؤال السابق
                </button>
              )}
            </>
          ) : (
            <div className="te-quiz-outcome" role="status">
              <span className="te-quiz-complete">
                <Check size={16} /> اكتمل الاختبار
              </span>

              <h3>
                {outcome === "IT"
                  ? "ميولك تميل أكثر إلى IT"
                  : outcome === "CS"
                    ? "ميولك تميل أكثر إلى CS"
                    : "ميولك متقاربة بين IT وCS"}
              </h3>

              <p>
                هذه نتيجة استرشادية من ستة اختيارات، وليست حكمًا على قدراتك.
                القرار الأفضل يعتمد على المواد التي تحبها والمشاريع التي
                تجرّبها.
              </p>

              <div className="te-quiz-actions">
                {outcome === "BOTH" ? (
                  <>
                    <button type="button" onClick={() => onMajor("IT")}>
                      تعرف على IT <ArrowLeft size={15} />
                    </button>

                    <button type="button" onClick={() => onMajor("CS")}>
                      تعرف على CS <ArrowLeft size={15} />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => onMajor(outcome)}>
                    تعرف على {outcome} <ArrowLeft size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onPlan(outcome === "BOTH" ? "IT" : outcome)}
                >
                  عرض الخطة الدراسية <ArrowLeft size={15} />
                </button>

                <button
                  type="button"
                  className="te-quiz-reset"
                  onClick={() => setAnswers([])}
                >
                  <RotateCcw size={15} />
                  إعادة الاختبار
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  ) : (
    <main className="te-assistant-only" dir="rtl">
      <SiteAssistant onNavigate={onNavigate} />
    </main>
  );
}
