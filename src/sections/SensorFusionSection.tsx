import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Satellite, Gauge, Camera } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SensorFusionSectionProps {
  className?: string;
}

const sensorCards = [
  {
    icon: Satellite,
    title: 'GNSS + RTK',
    description:
      'Multi-constellation, multipath detection, RTK when available.',
  },
  {
    icon: Gauge,
    title: 'INS + Odometry',
    description:
      'Tactical-grade IMU with temperature compensation; wheel odometry with slip rejection.',
  },
  {
    icon: Camera,
    title: 'Cameras + LiDAR',
    description:
      'VIO for texture-rich areas; LiDAR odometry for dust, low light, and structure.',
  },
];

export default function SensorFusionSection({
  className = '',
}: SensorFusionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

      // Background entrance (0% - 30%)
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.1, opacity: 0.8 },
        { scale: 1, opacity: 1, ease: 'none' },
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

      // Cards entrance with stagger (0% - 30%)
      const cards = cardsRef.current?.querySelectorAll('.sensor-card');
      if (cards) {
        cards.forEach((card, index) => {
          scrollTl.fromTo(
            card,
            { x: '55vw', opacity: 0 },
            { x: 0, opacity: 1, ease: 'power2.out' },
            0.06 * index
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

      if (cards) {
        cards.forEach((card) => {
          scrollTl.fromTo(
            card,
            { x: 0, opacity: 1 },
            { x: '18vw', opacity: 0, ease: 'power2.in' },
            0.7
          );
        });
      }

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
      id="sensor-fusion"
      className={`section-pinned ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src="/sensor_fusion_forestry.jpg"
          alt="Forestry machinery"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B111A]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B111A]/90 via-transparent to-[#0B111A]/80" />
      </div>

      {/* Top-right Label */}
      <div
        ref={labelRef}
        className="absolute top-[10vh] right-[7vw] z-20"
        style={{ opacity: 0 }}
      >
        <span className="label-micro text-[#2DB3C2]">Sensor Fusion</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-6 lg:px-[8vw]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-8 lg:gap-0">
          {/* Left Headline Block */}
          <div
            ref={headlineRef}
            className="max-w-[42vw] min-w-[300px]"
            style={{ opacity: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              Sensor fusion that stays calm when the canopy thickens.
            </h2>
            <p className="text-base md:text-lg text-[#A7B1C1] leading-relaxed">
              GNSS + INS + wheel odometry + visual-inertial odometry, fused with
              adaptive weights and fault detection.
            </p>
          </div>

          {/* Right Sensor Cards */}
          <div
            ref={cardsRef}
            className="flex flex-col gap-4 w-full lg:w-[34vw] lg:max-w-[450px]"
          >
            {sensorCards.map((card, index) => (
              <div
                key={index}
                className="sensor-card card-dark p-5 border-t-[3px] border-t-[#2DB3C2] hover:-translate-y-1 transition-transform duration-300"
                style={{ opacity: 0 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                    <card.icon size={20} className="text-[#2DB3C2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#A7B1C1] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
