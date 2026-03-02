import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SafetySectionProps {
  className?: string;
}

const safetyItems = [
  {
    icon: Shield,
    title: 'Protection Limits',
    description:
      'Position/heading bounds; automatic slowdown when uncertainty grows.',
  },
  {
    icon: AlertTriangle,
    title: 'Fault Detection',
    description:
      'IMU bias spikes, wheel slip, camera blinding—detected and isolated.',
  },
  {
    icon: Activity,
    title: 'Graceful Degradation',
    description:
      'Switch modes, increase uncertainty bounds, alert operator, continue safely.',
  },
];

export default function SafetySection({ className = '' }: SafetySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        },
      });

      // Background entrance
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.1 },
        { scale: 1, ease: 'none' },
        0
      );

      // Label entrance
      scrollTl.fromTo(
        labelRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.05
      );

      // Headline entrance (0% - 30%)
      scrollTl.fromTo(
        headlineRef.current,
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Panel entrance (0% - 30%)
      scrollTl.fromTo(
        panelRef.current,
        { x: '55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Panel rows staggered entrance (12% - 30%)
      const rows = panelRef.current?.querySelectorAll('.safety-row');
      if (rows) {
        rows.forEach((row, index) => {
          scrollTl.fromTo(
            row,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, ease: 'power2.out' },
            0.12 + 0.04 * index
          );
        });
      }

      // SETTLE (30% - 70%) - hold position

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        panelRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        labelRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.06, opacity: 0.7, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="safety"
      className={`section-pinned ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src="/safety_truck_closeup.jpg"
          alt="Mining truck"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B111A]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B111A]/90 via-transparent to-[#0B111A]/85" />
      </div>

      {/* Top-right Label */}
      <div
        ref={labelRef}
        className="absolute top-[10vh] right-[7vw] z-20"
        style={{ opacity: 0 }}
      >
        <span className="label-micro text-[#2DB3C2]">Safety & Integrity</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-6 lg:px-[8vw]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-8 lg:gap-0">
          {/* Left Headline Block */}
          <div
            ref={headlineRef}
            className="max-w-[40vw] min-w-[300px]"
            style={{ opacity: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              Safety and integrity, built in.
            </h2>
            <p className="text-base md:text-lg text-[#A7B1C1] leading-relaxed">
              Real-time protection limits, fault detection, and graceful
              degradation—designed for autonomous and manned operations.
            </p>
          </div>

          {/* Right Monitoring Panel */}
          <div
            ref={panelRef}
            className="w-full lg:w-[34vw] lg:max-w-[450px] card-dark p-6"
            style={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-5">
              {safetyItems.map((item, index) => (
                <div
                  key={index}
                  className="safety-row flex items-start gap-4 pb-5 border-b border-white/10 last:border-0 last:pb-0"
                  style={{ opacity: 0 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                    <item.icon size={20} className="text-[#2DB3C2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#A7B1C1] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
