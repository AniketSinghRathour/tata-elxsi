import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Trees, Mountain, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface EvaluationSectionProps {
  className?: string;
}

const scenarios = [
  {
    icon: Building2,
    title: 'Urban Canyon',
    description:
      'GNSS shadowing, multipath, tunnels; validate continuity and outage recovery.',
    image: '/hero_loader_dark.jpg',
  },
  {
    icon: Trees,
    title: 'Dense Canopy',
    description:
      'Forestry routes with variable speed; validate drift bounds and availability.',
    image: '/sensor_fusion_forestry.jpg',
  },
  {
    icon: Mountain,
    title: 'Mining Site',
    description:
      'High dust, dynamic obstacles, magnetic interference; validate robustness.',
    image: '/map_aerial_mining.jpg',
  },
];

const metrics = [
  {
    metric: 'Position Accuracy (CEP95)',
    target: '≤ 0.5–1.0 m',
    method: 'Post-processed truth',
  },
  {
    metric: 'Heading Accuracy',
    target: '≤ 0.5–1.0°',
    method: 'INS reference + truth',
  },
  {
    metric: 'Availability',
    target: '≥ 99% over 8 h',
    method: 'Uptime logs',
  },
  {
    metric: 'Continuity Drift',
    target: '≤ 1% of distance',
    method: 'Outage simulation',
  },
  {
    metric: 'Latency',
    target: '< 100 ms',
    method: 'Timestamp analysis',
  },
];

export default function EvaluationSection({
  className = '',
}: EvaluationSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 22, opacity: 0 },
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

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.scenario-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: index * 0.15,
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Table animation
      gsap.fromTo(
        tableRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: tableRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="evaluation"
      className={`relative py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      <div className="relative z-10 px-6 lg:px-12">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-12">
          <span className="label-micro text-[#2DB3C2] mb-4 block">
            Evaluation
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
            Test scenarios and pass/fail criteria.
          </h2>
          <p className="text-base md:text-lg text-[#A7B1C1] max-w-2xl mx-auto">
            Comprehensive testing across diverse environments to ensure reliable
            performance in real-world conditions.
          </p>
        </div>

        {/* Scenario Cards */}
        <div
          ref={cardsRef}
          className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="scenario-card card-dark overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              style={{ opacity: 0 }}
            >
              {/* Card image */}
              <div className="h-40 overflow-hidden">
                <img
                  src={scenario.image}
                  alt={scenario.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card content */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                    <scenario.icon size={16} className="text-[#2DB3C2]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-sm text-[#A7B1C1] leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Table */}
        <div ref={tableRef} className="max-w-[1200px] mx-auto" style={{ opacity: 0 }}>
          <div className="card-dark overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle size={18} className="text-[#2DB3C2]" />
                Core Evaluation Metrics
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-5 py-3 text-sm font-medium text-[#A7B1C1]">
                      Metric
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-[#A7B1C1]">
                      Target
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-[#A7B1C1]">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-white">
                        {row.metric}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#2DB3C2] font-mono">
                        {row.target}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#A7B1C1]">
                        {row.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
