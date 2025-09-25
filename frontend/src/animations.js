// animations.js
gsap.registerPlugin(ScrollTrigger);

// ========== INTRO ANIMATION ==========
function animateIntro() {
  gsap.from("#home h1", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out",
  });

  gsap.from("#home p", {
    opacity: 0,
    y: 30,
    duration: 0.9,
    delay: 0.2,
    ease: "power3.out",
  });

  gsap.from("#home a", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.4,
    stagger: 0.15,
    ease: "power3.out",
  });
}

// ========== SCROLL ANIMATIONS ==========
function animateScrollSections() {
  gsap.utils.toArray("section").forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 85%", // animate a bit earlier
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
    });
  });
}

// ========== TESTIMONIALS CAROUSEL ==========
function animateTestimonials() {
  const slider = document.querySelector(".testimonials-slider");
  if (!slider) return;

  const cards = gsap.utils.toArray(".testimonial-card");
  const cardWidth = cards[0].offsetWidth + 32; // card + spacing
  const totalWidth = cardWidth * cards.length;

  // Clone cards so the loop is seamless
  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    slider.appendChild(clone);
  });

  gsap.to(slider, {
    x: -totalWidth,
    duration: 25,
    ease: "linear",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % -totalWidth),
    },
  });
}

// ========== LOGO PULSE ==========
function animateLogo() {
  gsap.to(".fa-leaf", {
    scale: 1.1,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  animateIntro();
  animateScrollSections();
  animateTestimonials();
  animateLogo();
});

