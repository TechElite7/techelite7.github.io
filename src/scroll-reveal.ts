import './scroll-reveal.css';

function initScrollReveal() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const selector = 'section, article, [class*="card"], [class*="Card"], [class*="track"], [class*="Track"], [class*="project"], [class*="Project"]';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  const attachElements = () => {
    const nodes = document.querySelectorAll(selector);
    let batchIndex = 0;
    nodes.forEach((el) => {
      if (el.classList.contains('te-reveal') || el.closest('header, nav, dialog, [role="dialog"]')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) return;
      el.classList.add('te-reveal');
      (el as HTMLElement).style.transitionDelay = `${(batchIndex % 4) * 80}ms`;
      batchIndex++;
      observer.observe(el);
    });
  };

  setTimeout(attachElements, 120);
  const mut = new MutationObserver(() => attachElements());
  mut.observe(document.body, { childList: true, subtree: true });
}

initScrollReveal();
