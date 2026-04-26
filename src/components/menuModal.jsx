import { useEffect, useState } from "react";

function MenuModal() {
  const [footerMajorityInView, setFooterMajorityInView] = useState(false);

  useEffect(() => {
    const footerEl = document.getElementById("site-footer");
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFooterMajorityInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (footerMajorityInView) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <button
        className={`burger ${footerMajorityInView ? "is-open" : ""}`}
        aria-label={footerMajorityInView ? "Back to top" : "Scroll to footer"}
        onClick={handleClick}
      >
        <span className="burger__line"></span>
        <span className="burger__line"></span>
        <span className="burger__line"></span>
      </button>
    </>
  );
}

export default MenuModal;