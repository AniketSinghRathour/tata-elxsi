import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Auto-play entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Background entrance
      tl.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.2 }
      );

      // Label entrance
      tl.fromTo(
        labelRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.2
      );

      // Headline entrance (split by words)
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        tl.fromTo(
          words,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.06 },
          0.3
        );
      }

      // Subheadline entrance
      tl.fromTo(
        subheadlineRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.6
      );

      // CTA entrance
      tl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.85
      );

      // Scroll hint entrance
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([labelRef.current, headlineRef.current, subheadlineRef.current, ctaRef.current], {
              opacity: 1,
              y: 0,
              x: 0,
            });
            gsap.set(bgRef.current, { opacity: 1, scale: 1 });
          },
        },
      });

      // Headline exit (70% - 100%)
      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Subheadline exit
      scrollTl.fromTo(
        subheadlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-14vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      // Label exit
      scrollTl.fromTo(
        labelRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      // CTA exit
      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Background exit
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.08, opacity: 0.6, ease: 'power2.in' },
        0.7
      );

      // Scroll hint fade out early
      scrollTl.fromTo(
        scrollHintRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.3
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`section-pinned ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
      >
        <img
          src="/hero_loader_dark.jpg"
          alt="Industrial mining scene"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B111A] via-[#0B111A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B111A]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Micro Label */}
        <div
          ref={labelRef}
          className="absolute top-[10vh] left-1/2 -translate-x-1/2"
          style={{ opacity: 0 }}
        >
          <span className="label-micro text-[#A7B1C1]">
            Off-Highway Localization Platform
          </span>
        </div>

        {/* Headline Block */}
        <div className="text-center max-w-[1100px] mx-auto" style={{ marginTop: '-2vh' }}>
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6"
            style={{ opacity: 0 }}
          >
            <span className="word inline-block">Reliable</span>{' '}
            <span className="word inline-block">localization</span>{' '}
            <span className="word inline-block">where</span>{' '}
            <span className="word inline-block">GNSS</span>{' '}
            <span className="word inline-block">fades.</span>
          </h1>

          <p
            ref={subheadlineRef}
            className="text-lg md:text-xl text-[#A7B1C1] max-w-2xl mx-auto leading-relaxed"
            style={{ opacity: 0 }}
          >
            Multi-sensor fusion, map-aided positioning, and real-time integrity for
            construction, mining, and forestry.
          </p>
        </div>

        {/* CTA Row */}
        <div
          ref={ctaRef}
          className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-4"
          style={{ opacity: 0 }}
        >
          <button
            onClick={() => scrollToSection('#contact')}
            className="group flex items-center gap-2 px-6 py-3 bg-[#2DB3C2] text-[#0B111A] font-medium rounded-[10px] hover:bg-[#25a0ad] transition-all duration-200 hover:-translate-y-0.5"
          >
            Request a pilot
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollToSection('#architecture')}
            className="text-[#A7B1C1] hover:text-white transition-colors duration-200 underline underline-offset-4"
          >
            View system architecture
          </button>
        </div>

        {/* Scroll Hint */}
        <div
          ref={scrollHintRef}
          className="absolute right-[6vw] bottom-[6vh] flex items-center gap-2 text-[#A7B1C1] text-sm"
          style={{ opacity: 0 }}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}
