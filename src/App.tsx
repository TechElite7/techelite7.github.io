import MajorChoice from "./MajorChoice";
import { itTrackDetails } from "./major-details-data";
import GraduationProjects from "./GraduationProjects";
import CohortMembers from "./CohortMembers";
import {
  csPlanCourses,
  csAllCourses,
  csElectiveCourses,
  csProgram,
} from "./cs-plan-data";
import CsOverview from "./CsOverview";
import TrackCollections from "./TrackCollections";
import LearningPathsPage from "./LearningPathsPage";
import { Instagram } from "lucide-react";
import CohortIdentity from "./CohortIdentity";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowUpLeft,
  Award,
  BookOpen,
  BookMarked,
  Braces,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  ExternalLink,
  Filter,
  Globe2,
  GraduationCap,
  Layers3,
  LibraryBig,
  Lightbulb,
  Menu,
  MonitorSmartphone,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Compass,
  Clock3,
  BookCopy,
  FolderOpen,
  MessageCircle,
  Bot,
  LucideIcon,
  Sun,
  Moon,
} from "lucide-react";
import {
  courses,
  learningTracks,
  siteConfig,
  Course,
  StudyTrack,
} from "./data";
import CourseResourceTabs from "./CourseResourceTabs";
import LogoPhilosophy from "./LogoPhilosophy";
import { getAllCourseResources } from "./telegram-materials";
import { getBotUrl } from "./telegram-links";

type Theme = "dark" | "light";
type AcademicMajor = "IT" | "CS";
type Page =
  | "home"
  | "about"
  | "plan"
  | "library"
  | "batch"
  | "legacy"
  | "cs"
  | "guide";
const routes: { id: Page; label: string }[] = [
  { id: "home", label: "الرئيسية" },
  { id: "about", label: "عن تخصص IT" },
  { id: "cs", label: "عن تخصص CS" },
  { id: "guide", label: "مسارات التعلم" },
  { id: "plan", label: "الخطة الدراسية" },
  { id: "library", label: "المكتبة" },
  { id: "batch", label: "دفعتنا" },
  { id: "legacy", label: "مساعد Tech Elite" },
];
const trackIcons: Record<string, LucideIcon> = {
  code: Code2,
  network: Network,
  database: Database,
  security: ShieldCheck,
  mobile: MonitorSmartphone,
};
const validPages = routes.map((r) => r.id);

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("tech-elite-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0b0616" : "#f4f9ff");
    try {
      localStorage.setItem("tech-elite-theme", theme);
    } catch {
      /* Private mode */
    }
  }, [theme]);
  const botUrl = getBotUrl(siteConfig.telegramBotUsername);
  const logoSrc =
    theme === "dark"
      ? "/assets/tech-elite-dark.png"
      : "/assets/tech-elite-light.png";
  const heroSrc =
    theme === "dark" ? "/assets/student-3d.webp" : "/assets/student-day.webp";
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace("#", "") as Page;
    return validPages.includes(hash) ? hash : "home";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHomeQuiz, setShowHomeQuiz] = useState(false);
  const [expandedItTrack, setExpandedItTrack] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [academicMajor, setAcademicMajor] = useState<AcademicMajor>("IT");
  const [showOtherElectives, setShowOtherElectives] = useState(false);
  const [studyTrack, setStudyTrack] =
    useState<Exclude<StudyTrack, "مشترك">>("تطوير البرمجيات");
  const [libraryTrack, setLibraryTrack] = useState("الكل");
  const [query, setQuery] = useState("");
  const [libraryYear, setLibraryYear] = useState(0);
  const [librarySemester, setLibrarySemester] = useState(0);
  const [libraryCategory, setLibraryCategory] = useState("الكل");

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace("#", "") as Page;
      setPage(validPages.includes(hash) ? hash : "home");
      setActiveCourse(null);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeCourse ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeCourse]);

  function navigate(next: Page) {
    setPage(next);
    setMobileOpen(false);
    setActiveCourse(null);
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeCourses = academicMajor === "IT" ? courses : csAllCourses;
  const selectedCourses =
    academicMajor === "IT"
      ? courses.filter(
          (c) =>
            c.year === year &&
            c.semester === semester &&
            (c.track === "مشترك" || c.track === studyTrack),
        )
      : csPlanCourses.filter((c) => c.year === year && c.semester === semester);
  // Other elective options from the requirements catalog, not additional compulsory courses.
  const csOtherElectives =
    academicMajor === "CS"
      ? csElectiveCourses.filter(
          (c) =>
            c.year === year &&
            c.semester === semester &&
            !csPlanCourses.some((p) => p.code === c.code),
        )
      : [];
  const switchAcademicMajor = (next: AcademicMajor) => {
    setAcademicMajor(next);
    setLibraryCategory("الكل");
    setLibraryTrack("الكل");
    setQuery("");
    setShowOtherElectives(false);
    setActiveCourse(null);
  };
  const categories = [
    "الكل",
    ...Array.from(new Set(activeCourses.map((c) => c.category))),
  ];
  const filteredCourses = useMemo(
    () =>
      activeCourses.filter((course) => {
        const s =
          `${course.name} ${course.english} ${course.code} ${course.category}`.toLowerCase();
        return (
          (!query || s.includes(query.toLowerCase())) &&
          (!libraryYear || course.year === libraryYear) &&
          (!librarySemester || course.semester === librarySemester) &&
          (libraryCategory === "الكل" || course.category === libraryCategory) &&
          (academicMajor === "CS" ||
            libraryTrack === "الكل" ||
            course.track === "مشترك" ||
            course.track === libraryTrack)
        );
      }),
    [
      academicMajor,
      query,
      libraryYear,
      librarySemester,
      libraryCategory,
      libraryTrack,
    ],
  );

  const openLibrary = (search = "") => {
    setQuery(search);
    setLibraryYear(0);
    setLibrarySemester(0);
    setLibraryCategory("الكل");
    setLibraryTrack("الكل");
    navigate("library");
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        تجاوز إلى المحتوى
      </a>
      <div className="announcement-bar">
        <Sparkles size={15} /> مشروع طلابي من Tech Elite{" "}
        <span className="dot-separator">•</span> علم نشاركه، وأثر يبقى
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <button
            className="brand"
            onClick={() => navigate("home")}
            aria-label="العودة للرئيسية"
          >
            <img
              className="brand-image"
              src={logoSrc}
              alt="شعار دفعة Tech Elite"
            />
          </button>
          <nav
            className={`primary-nav ${mobileOpen ? "is-open" : ""}`}
            aria-label="التنقل الرئيسي"
          >
            {routes.map((route) => (
              <button
                key={route.id}
                className={page === route.id ? "nav-link active" : "nav-link"}
                onClick={() => navigate(route.id)}
              >
                {route.label}
              </button>
            ))}
            {botUrl && (
              <a
                className="nav-link nav-bot-mobile"
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                <Bot size={15} /> بوت الدفعة
              </a>
            )}
          </nav>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                const nextTheme = theme === "dark" ? "light" : "dark";
                const doc = document as Document & {
                  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
                };
                if (
                  !doc.startViewTransition ||
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ) {
                  setTheme(nextTheme);
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const endRadius = Math.hypot(
                  Math.max(x, window.innerWidth - x),
                  Math.max(y, window.innerHeight - y)
                );
                const transition = doc.startViewTransition(() => {
                  flushSync(() => {
                    document.documentElement.dataset.theme = nextTheme;
                    setTheme(nextTheme);
                  });
                });
                transition.ready.then(() => {
                  document.documentElement.animate(
                    {
                      clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                      ],
                    },
                    {
                      duration: 550,
                      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                      pseudoElement: "::view-transition-new(root)",
                    }
                  );
                });
              }}
              title={
                theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"
              }
              aria-label={
                theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"
              }
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {botUrl && (
              <a
                className="header-bot-link"
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bot size={17} /> زيارة البوت <ExternalLink size={14} />
              </a>
            )}

            <button
              className="menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-glow" />
              <div className="container hero-grid">
                <div className="hero-content">
                  <span className="hero-eyebrow">
                    <span className="live-dot" /> TECH ELITE • إرث الدفعة
                    السابعة لتقنية المعلومات
                  </span>
                  <h1>
                    تخصص اليوم
                    <br />
                    لصنّاع <span className="highlight-word">المستقبل.</span>
                  </h1>
                  <p>
                    تقنية المعلومات أكثر من مجرد تخصص جامعي، إنها لغة المستقبل.
                    من هنا صنعت دفعة <b>Tech Elite</b> بوابة تجمع تعريف تخصص IT
                    وخطة البكالوريوس والملازم ومصادر كل مادة، لتبقى المعرفة في
                    متناول الأجيال القادمة.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="btn btn-mint"
                      onClick={() => navigate("plan")}
                    >
                      استكشف الموقع <ArrowLeft size={19} />
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => navigate("batch")}
                    >
                      تعرّف على دفعتنا <ArrowUpLeft size={17} />
                    </button>
                    {botUrl ? (
                      <a
                        className="btn btn-bot"
                        href={botUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Bot size={19} /> زيارة بوت الدفعة{" "}
                        <ExternalLink size={16} />
                      </a>
                    ) : (
                      <span
                        className="bot-awaiting"
                        title="أدخل اسم مستخدم البوت الحقيقي في src/data.ts ليتفعّل الرابط"
                      >
                        <Bot size={18} /> بوت الدفعة: أضف رابط التفعيل
                      </span>
                    )}
                  </div>
                  <div className="hero-micro">
                    <span className="micro-avatar">TE</span>
                    <span>من طلاب IT إلى طلاب IT</span>
                    <i /> <span>معرفة متاحة للجميع</span>
                  </div>
                </div>
                <div
                  className="hero-art"
                  aria-label="رسم ثلاثي الأبعاد لطالب تقنية معلومات يعمل على الحاسوب"
                >
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <div className="hero-photo-wrap">
                    <img
                      className="hero-student-photo"
                      src={heroSrc}
                      alt="طالب تقنية المعلومات يعمل أمام شاشات البرمجة في مساحة عمل عصرية"
                    />
                  </div>
                  <div className="floating-square float-a">
                    <Code2 size={23} />
                  </div>
                  <div className="floating-square float-b">
                    <Database size={22} />
                  </div>
                  <div className="floating-square float-c">
                    <GraduationCap size={24} />
                  </div>
                  <div className="hero-float-note">
                    <span className="note-light" />
                    <span>
                      <strong>Tech Elite</strong>
                      <small>Learn · Build · Inspire</small>
                    </span>
                    <Sparkles size={19} />
                  </div>
                  <div className="art-caption">
                    <span className="diamond" /> THE FUTURE STARTS HERE
                  </div>
                </div>
              </div>
              <div className="hero-bottom-pattern" />
            </section>
            <div className="stats-strip">
              <div className="container stats-inner">
                <div>
                  <strong>IT</strong>
                  <span>جامعة حضرموت · تقنية المعلومات</span>
                </div>
                <div>
                  <strong>01</strong>
                  <span>خطة دراسية في مكان واحد</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>مصادر تصنع الفارق</span>
                </div>
                <div>
                  <strong>TE</strong>
                  <span>أثر دفعة Tech Elite</span>
                </div>
              </div>
            </div>
            <section className="section space-large">
              <div className="container">
                <SectionHead
                  eyebrow="كل ما تحتاجه في مكان واحد"
                  title={
                    <>
                      بوابتك إلى عالم <span>تقنية المعلومات</span>
                    </>
                  }
                  desc="الموقع مصمم ليرافقك في جميع مراحل الرحلة، من فهم التخصص إلى الوصول للمصادر والمشاريع."
                />
                <div className="feature-grid">
                  <FeatureCard
                    icon={Compass}
                    number="01"
                    title="اكتشف تخصصك"
                    desc="تعرف على طبيعة IT والمجالات التي يمكنك التعمق فيها."
                    onClick={() => navigate("about")}
                    color="cyan"
                  />
                  <FeatureCard
                    icon={Layers3}
                    number="02"
                    title="خطة البكالوريوس"
                    desc="رتّب رحلتك الأكاديمية حسب المستوى والفصل والمقرر."
                    onClick={() => navigate("plan")}
                    color="violet"
                  />
                  <FeatureCard
                    icon={BookOpen}
                    number="03"
                    title="مكتبة المواد"
                    desc="مصادر موثوقة وروابط للتعلم منظمة لكل مقرر."
                    onClick={() => openLibrary()}
                    color="orange"
                  />
                  <FeatureCard
                    icon={Users}
                    number="04"
                    title="ذاكرة Tech Elite"
                    desc="رحلتنا وإنجازاتنا ووصيتنا للدفعات القادمة."
                    onClick={() => navigate("batch")}
                    color="blue"
                  />
                </div>
              </div>
            </section>
            <section className="section track-section">
              <div className="container">
                <div className="split-section-heading">
                  <SectionHead
                    eyebrow="اعرف مجالك"
                    title={
                      <>
                        IT عالم واسع، <span>اكتشف مسارك</span>
                      </>
                    }
                    desc="لمحة سريعة عن بعض المجالات المهنية التي يفتحها تخصص تقنية المعلومات."
                  />
                  <button
                    className="text-link"
                    onClick={() => navigate("about")}
                  >
                    المزيد عن التخصص <ArrowLeft size={18} />
                  </button>
                </div>
                <TrackCollections
                  onGuide={() => navigate("guide")}
                  onCs={() => navigate("cs")}
                />
                <div className="te-home-quiz-entry">
                  <button
                    type="button"
                    className="te-home-quiz-entry-button"
                    aria-expanded={showHomeQuiz}
                    onClick={() => setShowHomeQuiz((v) => !v)}
                  >
                    <Compass size={18} /> حدد تخصصك أو ميولك{" "}
                    <ChevronDown size={16} />
                  </button>
                </div>
                {showHomeQuiz && (
                  <div className="te-home-quiz-panel">
                    <MajorChoice
                      quizOnly
                      onMajor={(major) =>
                        navigate(major === "IT" ? "about" : "cs")
                      }
                      onPlan={(major) => {
                        switchAcademicMajor(major);
                        navigate("plan");
                      }}
                      onNavigate={navigate}
                    />
                  </div>
                )}
              </div>
            </section>
            <section className="section">
              <div className="container home-library">
                <div className="home-library-text">
                  <span className="kicker light">
                    <BookMarked size={15} /> المكتبة التعليمية
                  </span>
                  <h2>
                    مادة واحدة،
                    <br />
                    <span>كل المصادر أمامك.</span>
                  </h2>
                  <p>
                    بدل البحث كل مرة بين المجموعات والروابط القديمة، نرتب
                    المصادر حسب اسم المادة لتصل إلى ما تحتاجه بسهولة.
                  </p>
                  <button
                    className="btn btn-mint"
                    onClick={() => openLibrary()}
                  >
                    تصفح مكتبة المواد <ArrowLeft size={18} />
                  </button>
                </div>
                <div className="library-preview">
                  <div className="mock-search">
                    <Search size={17} /> ابحث عن مادة أو مقرر ...
                  </div>
                  {courses.slice(1, 4).map((c, index) => (
                    <button
                      className="mini-course"
                      key={c.id}
                      onClick={() => {
                        openLibrary();
                        setActiveCourse(c);
                      }}
                    >
                      <span className={`mini-icon mini-${index}`}>
                        <BookOpen size={18} />
                      </span>
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.english}</small>
                      </span>
                      <ArrowUpLeft size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <LegacyCta
              onClick={() => navigate("legacy")}
              title="عندك سؤال عن IT أو CS؟"
              desc="اسأل مساعد Tech Elite عن أقسام الموقع والمقررات والفرق بين التخصصين، وتعرّف على خياراتك قبل القرار."
              button="اسأل مساعد Tech Elite"
            />
          </>
        )}

        {page === "guide" && <LearningPathsPage />}
        {page === "cs" && (
          <CsOverview
            onPlan={() => {
              switchAcademicMajor("CS");
              navigate("plan");
            }}
          />
        )}

        {page === "about" && (
          <>
            <PageHeading
              eyebrow="تخصص المستقبل يبدأ بالفهم"
              title={
                <>
                  ما هو تخصص <span>تقنية المعلومات IT؟</span>
                </>
              }
              desc="دليل مبسط لكل طالب جديد أو مهتم بدخول عالم تقنية المعلومات."
              icon={Globe2}
            />
            <section className="section">
              <div className="container">
                <div className="about-intro">
                  <div>
                    <span className="kicker">ABOUT INFORMATION TECHNOLOGY</span>
                    <h2>
                      التكنولوجيا ليست أجهزة فقط.
                      <br />
                      <span>بل حلول تصنع فرقًا.</span>
                    </h2>
                    <p>
                      تقنية المعلومات (Information Technology) مجال يهتم بتوظيف
                      الحاسوب والبرمجيات والشبكات وقواعد البيانات لتطوير الخدمات
                      وحل المشكلات وإدارة المعلومات داخل المؤسسات والمجتمع.
                    </p>
                    <p>
                      أثناء الدراسة يكتسب الطالب أساسًا تقنيًا واسعًا، ثم يستطيع
                      التعمق في المسار الذي يناسب اهتماماته وقدراته.
                    </p>
                  </div>
                  <div className="about-visual">
                    <div className="about-grid-cell">
                      <Code2 />
                      <span>Software</span>
                    </div>
                    <div className="about-grid-cell">
                      <Database />
                      <span>Data</span>
                    </div>
                    <div className="about-grid-cell">
                      <Network />
                      <span>Networks</span>
                    </div>
                    <div className="about-grid-cell">
                      <ShieldCheck />
                      <span>Security</span>
                    </div>
                    <div className="about-grid-center">IT</div>
                  </div>
                </div>
              </div>
            </section>
            <section className="section track-section">
              <div className="container">
                <SectionHead
                  eyebrow="تخصصات ومهارات"
                  title={
                    <>
                      ماذا ستتعلم <span>خلال البكالوريوس؟</span>
                    </>
                  }
                  desc="هذه مجالات معرفية من تخصص IT؛ تفاصيل المقررات في صفحة الخطة الدراسية الرسمية لجامعة حضرموت."
                />
                <div className="tracks-grid about-tracks">
                  {learningTracks.map((t) => {
                    const Icon = trackIcons[t.icon];
                    return (
                      <div className="track-card" key={t.title}>
                        <div className="track-icon">
                          <Icon size={23} />
                        </div>
                        <strong>{t.title}</strong>
                        <p>{t.description}</p>
                        {itTrackDetails[t.title] && (
                          <>
                            <button
                              type="button"
                              className="major-detail-toggle"
                              aria-expanded={expandedItTrack === t.title}
                              onClick={() =>
                                setExpandedItTrack((v) =>
                                  v === t.title ? null : t.title,
                                )
                              }
                            >
                              {expandedItTrack === t.title
                                ? "إخفاء الشرح"
                                : "شرح أكثر"}{" "}
                              <ChevronDown size={16} />
                            </button>
                            {expandedItTrack === t.title && (
                              <div className="major-detail-content">
                                <p>{itTrackDetails[t.title].detail}</p>
                                <p>
                                  <b>مثال للتطبيق:</b>{" "}
                                  {itTrackDetails[t.title].example}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            <section className="section">
              <div className="container">
                <SectionHead
                  eyebrow="اختيار التخصص"
                  title={
                    <>
                      IT وCS، <span>ما الفرق بينهما؟</span>
                    </>
                  }
                  desc="البرنامجان يتداخلان في الأساسيات، لكن لكل منهما تركيز أكاديمي شائع."
                />
                <div className="compare-grid">
                  <div className="compare-card">
                    <span className="compare-short">IT</span>
                    <h3>تقنية المعلومات</h3>
                    <p>
                      يركز غالبًا على تطبيق التقنيات وإدارة الأنظمة والشبكات
                      والبيانات والخدمات لتلبية احتياجات المؤسسات.
                    </p>
                  </div>
                  <div className="compare-card">
                    <span className="compare-short compare-purple">CS</span>
                    <h3>علوم الحاسوب</h3>
                    <p>
                      يركز غالبًا على الأسس النظرية للحوسبة والخوارزميات وهياكل
                      البيانات وطرق تصميم البرمجيات.
                    </p>
                  </div>
                </div>
                <p className="source-note">
                  للاطلاع على الأطر الأكاديمية:{" "}
                  <a
                    href="https://www.acm.org/binaries/content/assets/education/curricula-recommendations/cc2020.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Computing Curricula 2020 من ACM <ExternalLink size={13} />
                  </a>
                  . التوصيف هنا عام وليس حكمًا على خطة جامعة بعينها.
                </p>
              </div>
            </section>
            <LegacyCta
              onClick={() => navigate("plan")}
              title="جاهز تبدأ رحلتك؟"
              desc="اكتشف شكل المسار الدراسي، وابدأ بناء خطتك التعليمية خطوة بخطوة."
              button="استعرض الخطة"
            />
          </>
        )}

        {page === "plan" && (
          <>
            <PageHeading
              eyebrow="الرحلة الأكاديمية"
              title={
                <>
                  خارطة طريق <span>البكالوريوس</span>
                </>
              }
              desc="تصفح مقررات البكالوريوس حسب التخصص والمستوى والفصل الدراسي. الملازم والمصادر تجدها في المكتبة فقط."
              icon={Layers3}
            />
            <section className="section">
              <div className="container">
                <div
                  className="academic-major-picker"
                  role="group"
                  aria-label="اختر تخصص البكالوريوس"
                >
                  <div className="academic-major-caption">
                    <GraduationCap size={19} />
                    <span>اختر التخصص الدراسي</span>
                    <small></small>
                  </div>
                  <div className="academic-major-actions">
                    <button
                      type="button"
                      className={academicMajor === "IT" ? "selected" : ""}
                      aria-pressed={academicMajor === "IT"}
                      onClick={() => switchAcademicMajor("IT")}
                    >
                      تقنية المعلومات <b>IT</b>
                    </button>
                    <button
                      type="button"
                      className={academicMajor === "CS" ? "selected" : ""}
                      aria-pressed={academicMajor === "CS"}
                      onClick={() => switchAcademicMajor("CS")}
                    >
                      علوم الحاسوب <b>CS</b>
                    </button>
                  </div>
                </div>
                <div className="sample-note">
                  <CheckCircle2 size={21} />
                  <p>
                    <b>
                      الخطة المنشورة بجامعة حضرموت –{" "}
                      {academicMajor === "IT"
                        ? "تقنية المعلومات"
                        : "علوم الحاسوب"}
                      :
                    </b>{" "}
                    مقررات الخطة من{" "}
                    <a
                      href={
                        academicMajor === "IT"
                          ? siteConfig.officialPlanUrl
                          : csProgram.officialUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      المصدر الرسمي للكلية
                    </a>
                    .{" "}
                    {academicMajor === "IT" ? (
                      "الخطة تعلن 132 ساعة معتمدة، مع اختلافات في بعض جداول المقررات؛ المرجع النهائي كشوف القسم."
                    ) : (
                      <>
                        الخطة تعلن 133 ساعة معتمدة، منها 12 ساعة اختيارية.{" "}
                        <strong>
                          المقررات الاختيارية خيارات، وليست جميعها إلزامية.
                        </strong>{" "}
                        {csProgram.discrepancy}
                      </>
                    )}
                  </p>
                </div>
                <div className="plan-layout">
                  <aside className="year-sidebar">
                    <h3>المستويات الدراسية</h3>
                    <p>حدد المستوى الذي تريد استعراضه.</p>
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        className={
                          year === n ? "year-pill active" : "year-pill"
                        }
                        onClick={() => {
                          setYear(n);
                          setSemester(1);
                        }}
                      >
                        <span className="year-index">0{n}</span>
                        <span>
                          المستوى{" "}
                          {["الأول", "الثاني", "الثالث", "الرابع"][n - 1]}
                          <small>
                            {n === 4
                              ? "المشروع والتخرج"
                              : n === 1
                                ? "بناء الأساس"
                                : n === 2
                                  ? "توسيع المعرفة"
                                  : "التطبيق والتخصص"}
                          </small>
                        </span>
                        <ArrowLeft size={17} />
                      </button>
                    ))}
                  </aside>
                  <div className="plan-main">
                    <div className="plan-main-top">
                      <div>
                        <span className="kicker">LEVEL 0{year}</span>
                        <h2>
                          المستوى{" "}
                          {["الأول", "الثاني", "الثالث", "الرابع"][year - 1]}
                        </h2>
                      </div>
                      <div className="term-toggle">
                        <button
                          className={semester === 1 ? "selected" : ""}
                          onClick={() => setSemester(1)}
                        >
                          الفصل الأول
                        </button>
                        <button
                          className={semester === 2 ? "selected" : ""}
                          onClick={() => setSemester(2)}
                        >
                          الفصل الثاني
                        </button>
                      </div>
                    </div>
                    {academicMajor === "IT" && year >= 3 && (
                      <div
                        className="track-switch"
                        role="group"
                        aria-label="اختر مسار التخصص"
                      >
                        <span>مسار التخصص:</span>
                        <button
                          className={
                            studyTrack === "تطوير البرمجيات" ? "selected" : ""
                          }
                          onClick={() => setStudyTrack("تطوير البرمجيات")}
                        >
                          تطوير البرمجيات
                        </button>
                        <button
                          className={
                            studyTrack === "شبكات الحاسب" ? "selected" : ""
                          }
                          onClick={() => setStudyTrack("شبكات الحاسب")}
                        >
                          شبكات الحاسب
                        </button>
                      </div>
                    )}
                    <div className="plan-list">
                      {selectedCourses.map((course, index) => (
                        <div className="plan-course" key={course.id}>
                          <span className="plan-course-no">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="plan-course-content">
                            <strong>{course.name}</strong>
                            <small dir="ltr">{course.english}</small>
                          </span>
                          <span className="plan-course-meta">
                            <small>{course.creditHours} ساعات معتمدة</small>
                            <span>
                              {course.category === "اختياري"
                                ? "اختياري (غير إلزامي)"
                                : course.category}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {academicMajor === "CS" && year >= 3 && (
                      <div className="cs-elective-info">
                        <strong>المقررات الاختيارية في CS</strong>
                        <p>
                          المطلوب 12 ساعة اختيارية في البرنامج ككل. أي مقرر
                          معلّم «اختياري» أعلاه ليس إلزاميًا بذاته.
                        </p>
                        {csOtherElectives.length > 0 && (
                          <>
                            <button
                              className="cs-elective-expand"
                              type="button"
                              onClick={() => setShowOtherElectives((v) => !v)}
                              aria-expanded={showOtherElectives}
                            >
                              {showOtherElectives
                                ? "إخفاء البدائل الاختيارية"
                                : "عرض بدائل اختيارية أخرى لهذا الفصل"}{" "}
                              <ChevronDown size={15} />
                            </button>
                            {showOtherElectives && (
                              <div className="cs-extra-electives">
                                {csOtherElectives.map((course) => (
                                  <div key={course.id}>
                                    <span>
                                      <b>{course.name}</b>
                                      <small>
                                        {course.code} · {course.creditHours}{" "}
                                        ساعات · اختياري
                                      </small>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <div className="plan-footer">
                      <span>
                        <BookOpen size={17} /> {selectedCourses.length} مقررات
                        في هذا الفصل
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === "library" && (
          <>
            <PageHeading
              eyebrow="مكتبة Tech Elite"
              title={
                <>
                  مصادرك التعليمية، <span>مرتبة لك.</span>
                </>
              }
              desc="ابحث عن أي مقرر واستكشف روابط تعلم موثوقة تساعدك على الفهم والتطبيق."
              icon={LibraryBig}
            />
            <section className="section">
              <div className="container">
                <div className="sample-note">
                  <Lightbulb size={21} />
                  <p>
                    <b>
                      مكتبة{" "}
                      {academicMajor === "IT"
                        ? "تقنية المعلومات"
                        : "علوم الحاسوب"}
                      :
                    </b>{" "}
                    المقررات مرتبة حسب{" "}
                    <a
                      href={
                        academicMajor === "IT"
                          ? siteConfig.officialPlanUrl
                          : csProgram.officialUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      الخطة الرسمية بجامعة حضرموت
                    </a>
                    . المصادر الخارجية مستقلة عن ملازم الجامعة.{" "}
                    {academicMajor === "CS" &&
                      "الاختيارات المسجلة ضمن الخطة ليست كلها إلزامية."}{" "}
                    الملازم والنماذج الخاصة بالجامعة تُضاف عند توفر إذن
                    مشاركتها.
                  </p>
                </div>
                <div
                  className="academic-major-picker"
                  role="group"
                  aria-label="اختر تخصص البكالوريوس"
                >
                  <div className="academic-major-caption">
                    <GraduationCap size={19} />
                    <span>اختر التخصص الدراسي</span>
                    <small></small>
                  </div>
                  <div className="academic-major-actions">
                    <button
                      type="button"
                      className={academicMajor === "IT" ? "selected" : ""}
                      aria-pressed={academicMajor === "IT"}
                      onClick={() => switchAcademicMajor("IT")}
                    >
                      تقنية المعلومات <b>IT</b>
                    </button>
                    <button
                      type="button"
                      className={academicMajor === "CS" ? "selected" : ""}
                      aria-pressed={academicMajor === "CS"}
                      onClick={() => switchAcademicMajor("CS")}
                    >
                      علوم الحاسوب <b>CS</b>
                    </button>
                  </div>
                </div>
                <div className="library-toolbar">
                  <label className="search-field">
                    <Search size={21} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ابحث باسم المادة، رمزها أو مجالها..."
                      aria-label="ابحث عن مادة"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        aria-label="مسح البحث"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </label>
                  <label className="filter-field">
                    <Filter size={17} />
                    <select
                      value={libraryYear}
                      onChange={(e) => setLibraryYear(Number(e.target.value))}
                      aria-label="تصفية حسب المستوى"
                    >
                      <option value={0}>جميع المستويات</option>
                      {[1, 2, 3, 4].map((n) => (
                        <option value={n} key={n}>
                          المستوى{" "}
                          {["الأول", "الثاني", "الثالث", "الرابع"][n - 1]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </label>
                  <label className="filter-field">
                    <Filter size={17} />
                    <select
                      value={librarySemester}
                      onChange={(e) =>
                        setLibrarySemester(Number(e.target.value))
                      }
                      aria-label="تصفية حسب الفصل الدراسي"
                    >
                      <option value={0}>كل الفصول</option>
                      <option value={1}>الترم الأول</option>
                      <option value={2}>الترم الثاني</option>
                    </select>
                    <ChevronDown size={15} />
                  </label>
                </div>
                {academicMajor === "IT" && (
                  <div
                    className="track-switch library-tracks"
                    role="group"
                    aria-label="تصفية حسب المسار"
                  >
                    <span>المسار:</span>
                    {["الكل", "تطوير البرمجيات", "شبكات الحاسب"].map((t) => (
                      <button
                        key={t}
                        className={libraryTrack === t ? "selected" : ""}
                        onClick={() => setLibraryTrack(t)}
                      >
                        {t === "الكل" ? "جميع المسارات" : t}
                      </button>
                    ))}
                  </div>
                )}
                <div className="category-tabs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={cat === libraryCategory ? "active" : ""}
                      onClick={() => setLibraryCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="result-bar">
                  <b>المقررات المتاحة</b>
                  <span>{filteredCourses.length} نتيجة</span>
                </div>
                {filteredCourses.length ? (
                  <div className="course-grid">
                    {filteredCourses.map((course) => (
                      <button
                        className="course-card"
                        key={course.id}
                        onClick={() => setActiveCourse(course)}
                      >
                        <div className="course-card-top">
                          <span className="course-tag">{course.category}</span>
                          <span className="course-code">{course.code}</span>
                        </div>
                        <div className="course-card-icon">
                          <BookCopy size={26} />
                        </div>
                        <h3>{course.name}</h3>
                        <small dir="ltr" className="course-english">
                          {course.english}
                        </small>
                        <p>{course.description}</p>
                        <div className="course-card-bottom">
                          <span>
                            <FolderOpen size={17} />
                            {getAllCourseResources(course).length} مصادر تعليمية
                          </span>
                          <span className="course-link">
                            <ArrowUpLeft size={18} />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Search size={33} />
                    <h3>لا توجد مواد مطابقة</h3>
                    <p>جرب كلمة أخرى أو أزل بعض عوامل التصفية.</p>
                    <button
                      className="btn btn-dark"
                      onClick={() => {
                        setQuery("");
                        setLibraryCategory("الكل");
                        setLibraryYear(0);
                        setLibrarySemester(0);
                        setLibraryTrack("الكل");
                      }}
                    >
                      مسح التصفية
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {page === "batch" && (
          <>
            <PageHeading
              eyebrow="WHO WE ARE"
              title={
                <>
                  نحن دفعة <span>Tech Elite</span>
                </>
              }
              desc="أصدقاء جمعتهم المقاعد الدراسية، وصارت المعرفة والمشاريع والتحديات جزءًا من حكايتهم."
              icon={Users}
            />
            <CohortIdentity />
            <CohortMembers />
            <section className="section">
              <div className="container">
                <div className="batch-story">
                  <div className="batch-story-text">
                    <span className="kicker">قصتنا</span>
                    <h2>
                      لسنا مجرد أسماء
                      <br />
                      <span>في كشف الخريجين.</span>
                    </h2>
                    <p>
                      نحن دفعة من طلاب تقنية المعلومات آمنت بأن أجمل ما يمكن أن
                      نغادر به الجامعة ليس الذكريات وحدها، بل شيء ينفع من يأتي
                      بعدنا.
                    </p>
                    <p>
                      من هنا جاءت Tech Elite: مساحة تجمع ما تعلمناه، وتوثق ما
                      أنجزناه، وتترك باب المعرفة مفتوحًا لكل طالب جديد.
                    </p>
                    <div className="batch-quote">
                      <MessageCircle size={22} />
                      <blockquote>
                        قد تنتهي سنوات دراستنا، لكن أثر المعرفة التي نشاركها لا
                        ينتهي.
                      </blockquote>
                    </div>
                  </div>
                  <div className="batch-canvas">
                    <div className="batch-big-icon">
                      <img
                        src="/assets/tech-elite-logo.webp"
                        alt="شعار الدفعة"
                      />
                    </div>
                    <span>TECH ELITE</span>
                    <small>ONE BATCH. ONE LEGACY.</small>
                    <div className="canvas-corners top-right" />
                    <div className="canvas-corners bottom-left" />
                  </div>
                </div>
              </div>
            </section>
            <LogoPhilosophy />
            <GraduationProjects botUsername={siteConfig.telegramBotUsername} />
            <section className="section track-section">
              <div className="container">
                <SectionHead
                  eyebrow="محطات رحلتنا"
                  title={
                    <>
                      من البدايات إلى <span>الأثر</span>
                    </>
                  }
                  desc="محطات سردية قابلة للاستبدال بصور وأحداث الدفعة الحقيقية."
                />
                <div className="milestones">
                  <div>
                    <span>01</span>
                    <h3>البداية</h3>
                    <p>دخلنا عالم تقنية المعلومات بشغف وأسئلة كثيرة.</p>
                  </div>
                  <div>
                    <span>02</span>
                    <h3>التعلّم والتحديات</h3>
                    <p>برمجة ومشاريع وتجارب صقلت مهاراتنا.</p>
                  </div>
                  <div>
                    <span>03</span>
                    <h3>العمل كفريق</h3>
                    <p>تشاركنا الحلول والخبرات والتعاون.</p>
                  </div>
                  <div>
                    <span>04</span>
                    <h3>إرث الدفعة</h3>
                    <p>نضع المعرفة في متناول الأجيال القادمة.</p>
                  </div>
                </div>
              </div>
            </section>
            <section className="section">
              <div className="container">
                <SectionHead
                  eyebrow="الأرشيف المنتظر"
                  title={
                    <>
                      ذكريات تستحق <span>أن تُحفظ</span>
                    </>
                  }
                  desc="مساحات جاهزة لإضافة صور الدفعة وإنجازاتها بموافقة أصحابها."
                />
                <div className="memories-grid">
                  <div className="memory-placeholder mem-one">
                    <Users size={39} />
                    <strong>الصورة الجماعية</strong>
                    <small>أضف صورة الدفعة</small>
                  </div>
                  <div className="memory-placeholder mem-two">
                    <Award size={39} />
                    <strong>إنجازاتنا</strong>
                    <small>جوائز ومشاركات</small>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === "legacy" && (
          <MajorChoice
            onMajor={(major) => navigate(major === "IT" ? "about" : "cs")}
            onPlan={(major) => {
              switchAcademicMajor(major);
              navigate("plan");
            }}
            onNavigate={navigate}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="footer-brand">
              <img
                className="footer-logo"
                src={logoSrc}
                alt="شعار Tech Elite"
              />
            </div>
            <p>
              من طلاب تقنية المعلومات، لكل من يريد أن يبدأ رحلته بثقة ويكملها
              بشغف.
            </p>
          </div>
          <div>
            <h4>استكشف</h4>
            {routes
              .filter((r) =>
                ["about", "cs", "guide", "plan", "library"].includes(r.id),
              )
              .map((r) => (
                <button key={r.id} onClick={() => navigate(r.id)}>
                  {r.label}
                </button>
              ))}
          </div>
          <div>
            <h4>عن الدفعة</h4>
            {routes
              .filter((r) => ["batch", "legacy"].includes(r.id))
              .map((r) => (
                <button key={r.id} onClick={() => navigate(r.id)}>
                  {r.label}
                </button>
              ))}
          </div>
          <div>
            <h4>رسالتنا</h4>
            <p>معرفة تُشارك. خبرة تُورث. أثر يستمر.</p>
            {botUrl && (
              <a
                className="footer-bot-link"
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bot size={17} /> زيارة بوت الدفعة <ExternalLink size={14} />
              </a>
            )}
            <a
              className="footer-instagram-link"
              href="https://www.instagram.com/tech_elite7/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تابع دفعة Tech Elite السابعة على إنستقرام"
            >
              <Instagram size={19} aria-hidden="true" /> إنستقرام الدفعة
              @tech_elite7 <ExternalLink size={14} aria-hidden="true" />
            </a>
            <span className="footer-chip">
              <CheckCircle2 size={16} /> مبادرة تعليمية طلابية
            </span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Tech Elite. صُنِع بحب ليبقى أثرًا.
          </span>
          <span>
            {siteConfig.universityName} <span className="foot-dot">•</span>{" "}
            النسخة التجريبية
          </span>
        </div>
      </footer>

      {activeCourse && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveCourse(null);
          }}
        >
          <section
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`تفاصيل ${activeCourse.name}`}
          >
            <div className="modal-header">
              <span>
                <BookOpen size={19} /> تفاصيل المقرر
              </span>
              <button
                aria-label="إغلاق التفاصيل"
                onClick={() => setActiveCourse(null)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="modal-content">
              <span className="course-tag">{activeCourse.category}</span>
              <h2>{activeCourse.name}</h2>
              <span className="modal-en">{activeCourse.english}</span>
              <div className="modal-badges">
                <span>
                  <Layers3 size={15} /> المستوى {activeCourse.year}
                </span>
                <span>
                  <Clock3 size={15} /> {activeCourse.creditHours} ساعات معتمدة
                </span>
                <span>{activeCourse.code}</span>
                <span>
                  {activeCourse.category === "اختياري"
                    ? "مقرر اختياري"
                    : activeCourse.track === "مشترك"
                      ? "مقرر مشترك"
                      : activeCourse.track}
                </span>
              </div>
              <p>{activeCourse.description}</p>
              <h3>محاور المقرر</h3>
              <div className="topic-tags">
                {activeCourse.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <CourseResourceTabs key={activeCourse.id} course={activeCourse} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
}) {
  return (
    <div className="section-head">
      <span className="kicker">
        <span className="kicker-line" />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}
function FeatureCard({
  icon: Icon,
  number,
  title,
  desc,
  onClick,
  color,
}: {
  icon: LucideIcon;
  number: string;
  title: string;
  desc: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button className={`feature-card feature-${color}`} onClick={onClick}>
      <div className="feature-top">
        <span className="feature-icon">
          <Icon size={26} />
        </span>
        <small>{number}</small>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="feature-bottom">
        استكشف القسم <ArrowUpLeft size={19} />
      </span>
    </button>
  );
}
function PageHeading({
  eyebrow,
  title,
  desc,
  icon: Icon,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
  icon: LucideIcon;
}) {
  return (
    <div className="page-heading">
      <div className="page-heading-glow" />
      <div className="container">
        <span className="page-eyebrow">
          <Icon size={18} />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{desc}</p>
        <div className="page-head-decoration">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
function LegacyCta({
  onClick,
  title = "حكايتنا لم تنتهِ بالتخرج.",
  desc = "تعرف على ما تريد Tech Elite أن تتركه للأجيال القادمة: معرفة لا تضيع، وخبرة تنتقل، وأثر يكبر.",
  button = "اكتشف أثرنا",
}: {
  onClick: () => void;
  title?: string;
  desc?: string;
  button?: string;
}) {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="legacy-cta">
          <div>
            <span className="kicker light">
              <Bot size={16} /> مساحة للاستكشاف والأسئلة
            </span>
            <h2>{title}</h2>
            <p>{desc}</p>
            <button className="btn btn-white" onClick={onClick}>
              {button}
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="cta-visual">
            <span className="cta-symbol">
              <Braces size={75} />
            </span>
            <strong>
              ASK TECH
              <br />
              <em>ELITE.</em>
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
