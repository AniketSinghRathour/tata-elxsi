import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, RotateCcw, Clock, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface DemoRoutesSectionProps {
  className?: string;
}

const testScripts = [
  {
    icon: Clock,
    title: 'Static Cold/Hot Start',
    description: 'Evaluate initialization time and convergence behavior.',
  },
  {
    icon: AlertTriangle,
    title: 'Deliberate Sensor Faults',
    description: 'IMU bias spikes, wheel slip, camera blinding scenarios.',
  },
  {
    icon: RotateCcw,
    title: 'Long-Duration Runs',
    description: '≥8 hours continuous operation for drift benchmarking.',
  },
];

export default function DemoRoutesSection({
  className = '',
}: DemoRoutesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const routeCardRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current,
        { x: '-8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Route card animation
      gsap.fromTo(
        routeCardRef.current,
        { x: '8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: routeCardRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Route line draw animation
      if (routeLineRef.current) {
        const pathLength = routeLineRef.current.getTotalLength();
        gsap.set(routeLineRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        ScrollTrigger.create({
          trigger: routeCardRef.current,
          start: 'top 70%',
          onEnter: () => {
            gsap.to(routeLineRef.current, {
              strokeDashoffset: 0,
              duration: 2,
              ease: 'power2.out',
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="demo-routes"
      className={`relative py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src="/demo_route_field.jpg"
          alt="Demo route field"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B111A]/72" />
      </div>

      <div className="relative z-10 px-6 lg:px-12">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-12">
          <span className="label-micro text-[#2DB3C2] mb-4 block">
            Demo Routes
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
            Reproducible routes and test scripts.
          </h2>
        </div>

        {/* Content Grid */}
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Test Scripts */}
          <div ref={contentRef} className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-6">
              Test Script Categories
            </h3>

            {testScripts.map((script, index) => (
              <div
                key={index}
                className="card-dark p-5 flex items-start gap-4 hover:border-[#2DB3C2]/30 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                  <script.icon size={20} className="text-[#2DB3C2]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    {script.title}
                  </h4>
                  <p className="text-sm text-[#A7B1C1]">{script.description}</p>
                </div>
              </div>
            ))}

            {/* Additional info */}
            <div className="mt-6 p-5 card-dark border-l-4 border-l-[#2DB3C2]">
              <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Play size={16} className="text-[#2DB3C2]" />
                Automated Test Execution
              </h4>
              <p className="text-sm text-[#A7B1C1]">
                All test scripts can be executed automatically with configurable
                parameters, data logging, and real-time performance monitoring.
              </p>
            </div>
          </div>

          {/* Right: Route Card */}
          <div ref={routeCardRef}>
            <div className="card-dark p-6 h-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Typical Test Route
              </h3>

              {/* Route Map */}
              <div className="relative bg-[#141C27] rounded-lg overflow-hidden mb-4" style={{ height: '280px' }}>
                {/* Grid background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(45, 179, 194, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(45, 179, 194, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                  }}
                />

                {/* Route SVG */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 280"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Route path */}
                  <path
                    ref={routeLineRef}
                    d="M 60 220 Q 100 200 140 180 Q 180 160 200 120 Q 220 80 260 60 Q 300 40 340 70 Q 360 90 350 130 Q 340 170 300 190 Q 260 210 220 200 Q 180 190 140 210 Q 100 230 60 220"
                    fill="none"
                    stroke="#2DB3C2"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Start point */}
                  <circle cx="60" cy="220" r="8" fill="#2DB3C2" />
                  <text x="45" y="245" fill="#A7B1C1" fontSize="10" fontFamily="IBM Plex Mono">
                    START
                  </text>

                  {/* End point (same as start for loop) */}
                  <circle cx="60" cy="220" r="4" fill="none" stroke="#2DB3C2" strokeWidth="2" />

                  {/* Waypoints */}
                  <circle cx="200" cy="120" r="4" fill="rgba(45, 179, 194, 0.5)" />
                  <circle cx="260" cy="60" r="4" fill="rgba(45, 179, 194, 0.5)" />
                  <circle cx="300" cy="190" r="4" fill="rgba(45, 179, 194, 0.5)" />

                  {/* Environment zones */}
                  <ellipse
                    cx="260"
                    cy="60"
                    rx="35"
                    ry="25"
                    fill="rgba(45, 179, 194, 0.08)"
                    stroke="rgba(45, 179, 194, 0.2)"
                    strokeWidth="1"
                  />
                  <text x="235" y="35" fill="#A7B1C1" fontSize="8" fontFamily="IBM Plex Mono">
                    CANOPY
                  </text>

                  <ellipse
                    cx="140"
                    cy="210"
                    rx="30"
                    ry="20"
                    fill="rgba(45, 179, 194, 0.08)"
                    stroke="rgba(45, 179, 194, 0.2)"
                    strokeWidth="1"
                  />
                  <text x="115" y="240" fill="#A7B1C1" fontSize="8" fontFamily="IBM Plex Mono">
                    OPEN
                  </text>
                </svg>

                {/* Stats overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <div className="px-2 py-1 bg-[#0B111A]/80 rounded text-xs text-[#A7B1C1] font-mono">
                    DIST: 3.2 km
                  </div>
                  <div className="px-2 py-1 bg-[#0B111A]/80 rounded text-xs text-[#2DB3C2] font-mono">
                    LOOP
                  </div>
                </div>
              </div>

              {/* Route details */}
              <div className="space-y-3">
                <p className="text-sm text-[#A7B1C1]">
                  Typical 3 km loop: mixed canopy, open field, and narrow corridor.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-[#2DB3C2]/10 text-[#2DB3C2] rounded">
                    Mixed Terrain
                  </span>
                  <span className="px-2 py-1 text-xs bg-[#2DB3C2]/10 text-[#2DB3C2] rounded">
                    Variable Speed
                  </span>
                  <span className="px-2 py-1 text-xs bg-[#2DB3C2]/10 text-[#2DB3C2] rounded">
                    GNSS Challenges
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-white">3.2</div>
                      <div className="text-xs text-[#A7B1C1]">km</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">15-25</div>
                      <div className="text-xs text-[#A7B1C1]">km/h</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">~12</div>
                      <div className="text-xs text-[#A7B1C1]">min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
