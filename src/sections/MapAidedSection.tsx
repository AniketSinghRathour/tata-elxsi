import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MapAidedSectionProps {
  className?: string;
}

export default function MapAidedSection({ className = '' }: MapAidedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const mapCardRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<SVGPathElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // Background entrance
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.08 },
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

      // Map card entrance (0% - 30%)
      scrollTl.fromTo(
        mapCardRef.current,
        { y: '80vh', scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'power2.out' },
        0
      );

      // Route line draw-on (8% - 30%)
      if (routeLineRef.current) {
        const pathLength = routeLineRef.current.getTotalLength();
        gsap.set(routeLineRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });
        scrollTl.to(
          routeLineRef.current,
          { strokeDashoffset: 0, ease: 'none' },
          0.08
        );
      }

      // Caption entrance (10% - 30%)
      scrollTl.fromTo(
        captionRef.current,
        { x: '-40vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.1
      );

      // SETTLE (30% - 70%) - hold position

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        mapCardRef.current,
        { y: 0, opacity: 1 },
        { y: '-22vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        captionRef.current,
        { x: 0, opacity: 1 },
        { x: '-12vw', opacity: 0, ease: 'power2.in' },
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
        { scale: 1.05, opacity: 0.7, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="map-aided"
      className={`section-pinned ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src="/map_aerial_mining.jpg"
          alt="Aerial mining view"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B111A]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B111A]/60 via-transparent to-[#0B111A]/80" />
      </div>

      {/* Top-center Label */}
      <div
        ref={labelRef}
        className="absolute top-[10vh] left-1/2 -translate-x-1/2 z-20"
        style={{ opacity: 0 }}
      >
        <span className="label-micro text-[#2DB3C2]">Map-Aided Localization</span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Map Card */}
        <div
          ref={mapCardRef}
          className="relative w-full max-w-[1200px] h-[56vh] card-dark overflow-hidden"
          style={{ opacity: 0 }}
        >
          {/* Stylized Map Background */}
          <div className="absolute inset-0 bg-[#141C27]">
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(45, 179, 194, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(45, 179, 194, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Map features */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Terrain contours */}
              <ellipse
                cx="200"
                cy="350"
                rx="150"
                ry="80"
                fill="none"
                stroke="rgba(45, 179, 194, 0.15)"
                strokeWidth="2"
              />
              <ellipse
                cx="220"
                cy="360"
                rx="120"
                ry="60"
                fill="none"
                stroke="rgba(45, 179, 194, 0.1)"
                strokeWidth="2"
              />

              {/* Buildings/structures */}
              <rect
                x="700"
                y="100"
                width="80"
                height="60"
                fill="rgba(45, 179, 194, 0.08)"
                stroke="rgba(45, 179, 194, 0.2)"
                strokeWidth="1"
              />
              <rect
                x="800"
                y="150"
                width="60"
                height="40"
                fill="rgba(45, 179, 194, 0.08)"
                stroke="rgba(45, 179, 194, 0.2)"
                strokeWidth="1"
              />
              <rect
                x="750"
                y="220"
                width="100"
                height="70"
                fill="rgba(45, 179, 194, 0.08)"
                stroke="rgba(45, 179, 194, 0.2)"
                strokeWidth="1"
              />

              {/* Route line */}
              <path
                ref={routeLineRef}
                d="M 100 400 Q 250 380 350 300 Q 450 220 550 250 Q 650 280 750 200 Q 850 120 920 150"
                fill="none"
                stroke="#2DB3C2"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="8 4"
              />

              {/* Start point */}
              <circle cx="100" cy="400" r="8" fill="#2DB3C2" />
              <text x="115" y="405" fill="#A7B1C1" fontSize="12" fontFamily="IBM Plex Mono">
                START
              </text>

              {/* Vehicle marker */}
              <g transform="translate(750, 200) rotate(-30)">
                <polygon
                  points="0,-12 -8,8 0,4 8,8"
                  fill="#2DB3C2"
                  filter="drop-shadow(0 0 8px rgba(45, 179, 194, 0.6))"
                />
              </g>

              {/* Waypoints */}
              <circle cx="350" cy="300" r="4" fill="rgba(45, 179, 194, 0.5)" />
              <circle cx="550" cy="250" r="4" fill="rgba(45, 179, 194, 0.5)" />
            </svg>

            {/* Map UI overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1.5 bg-[#0B111A]/80 rounded-md border border-white/10">
                <span className="text-xs text-[#A7B1C1] font-mono">ZOOM: 1:5000</span>
              </div>
              <div className="px-3 py-1.5 bg-[#0B111A]/80 rounded-md border border-white/10">
                <span className="text-xs text-[#2DB3C2] font-mono">LIVE</span>
              </div>
            </div>

            {/* Coordinate display */}
            <div className="absolute bottom-4 right-4 px-3 py-2 bg-[#0B111A]/80 rounded-md border border-white/10">
              <div className="text-xs text-[#A7B1C1] font-mono">
                <div>LAT: 45.5231° N</div>
                <div>LON: 122.6765° W</div>
                <div className="text-[#2DB3C2] mt-1">HDOP: 0.8</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left Caption */}
        <div
          ref={captionRef}
          className="absolute bottom-[10vh] left-[7vw] max-w-[34vw] min-w-[280px]"
          style={{ opacity: 0 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Map-aided localization for repeating routes.
          </h3>
          <p className="text-base text-[#A7B1C1] leading-relaxed">
            Use prior maps with probabilistic matching; reduce drift and speed up
            re-localization after outages.
          </p>
        </div>
      </div>
    </section>
  );
}
