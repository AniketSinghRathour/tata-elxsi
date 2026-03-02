import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AlertTriangle,
  Zap,
  Thermometer,
  Settings,
  AlertCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface RiskRegisterSectionProps {
  className?: string;
}

const risks = [
  {
    icon: AlertTriangle,
    risk: 'Sensor Degradation',
    impact: 'Positioning drift, loss of accuracy',
    mitigation: 'Health monitoring + fallback modes + redundant sensors',
    severity: 'High',
  },
  {
    icon: Settings,
    risk: 'Map Drift in Changing Sites',
    impact: 'Localization mismatch, navigation errors',
    mitigation: 'Map update pipeline + change detection + dynamic landmarks',
    severity: 'Medium',
  },
  {
    icon: Zap,
    risk: 'EMI / Power Ripple',
    impact: 'GNSS/IMU noise, signal corruption',
    mitigation: 'Filtering, shielding, isolation, power conditioning',
    severity: 'Medium',
  },
  {
    icon: Thermometer,
    risk: 'Compute Thermal Throttling',
    impact: 'Latency spikes, dropped frames',
    mitigation: 'Thermal design + load shedding + passive cooling',
    severity: 'Medium',
  },
  {
    icon: AlertCircle,
    risk: 'Calibration Drift',
    impact: 'Bias growth, systematic errors',
    mitigation: 'Auto-recalibration + field checks + online estimation',
    severity: 'Low',
  },
];

const severityColors: Record<string, string> = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function RiskRegisterSection({
  className = '',
}: RiskRegisterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 18, opacity: 0 },
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

      // Table animation
      gsap.fromTo(
        tableRef.current,
        { y: 24, opacity: 0 },
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

      // Rows stagger animation
      const rows = tableRef.current?.querySelectorAll('.risk-row');
      if (rows) {
        rows.forEach((row, index) => {
          gsap.fromTo(
            row,
            { y: 10, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              delay: index * 0.08,
              scrollTrigger: {
                trigger: tableRef.current,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="risk-register"
      className={`relative py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      <div className="relative z-10 px-6 lg:px-12">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-12">
          <span className="label-micro text-[#2DB3C2] mb-4 block">
            Risk Register
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
            Risks and mitigations.
          </h2>
          <p className="text-base md:text-lg text-[#A7B1C1] max-w-2xl mx-auto">
            Proactive risk management with identified mitigation strategies for
            each potential failure mode.
          </p>
        </div>

        {/* Risk Table */}
        <div ref={tableRef} className="max-w-[1200px] mx-auto">
          <div className="card-dark overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-5 py-4 text-sm font-medium text-[#A7B1C1] w-12">
                      {/* Icon */}
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-medium text-[#A7B1C1]">
                      Risk
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-medium text-[#A7B1C1]">
                      Impact
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-medium text-[#A7B1C1]">
                      Mitigation
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-medium text-[#A7B1C1] w-28">
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((row, index) => (
                    <tr
                      key={index}
                      className="risk-row border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      style={{ opacity: 0 }}
                    >
                      <td className="px-5 py-4">
                        <div className="w-8 h-8 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                          <row.icon size={16} className="text-[#2DB3C2]" />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white font-medium">
                        {row.risk}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#A7B1C1]">
                        {row.impact}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#A7B1C1]">
                        {row.mitigation}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${severityColors[row.severity]}`}
                        >
                          {row.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-5">
              {risks.map((row, index) => (
                <div
                  key={index}
                  className="risk-row card-dark p-4 space-y-3"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2DB3C2]/10 flex items-center justify-center">
                        <row.icon size={16} className="text-[#2DB3C2]" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {row.risk}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${severityColors[row.severity]}`}
                    >
                      {row.severity}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A7B1C1] uppercase">
                        Impact
                      </span>
                      <p className="text-sm text-white/80">{row.impact}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A7B1C1] uppercase">
                        Mitigation
                      </span>
                      <p className="text-sm text-white/80">{row.mitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="max-w-[1200px] mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-semibold text-white">5</div>
            <div className="text-xs text-[#A7B1C1] mt-1">Identified Risks</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-semibold text-red-400">1</div>
            <div className="text-xs text-[#A7B1C1] mt-1">High Severity</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-400">3</div>
            <div className="text-xs text-[#A7B1C1] mt-1">Medium Severity</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-semibold text-green-400">1</div>
            <div className="text-xs text-[#A7B1C1] mt-1">Low Severity</div>
          </div>
        </div>
      </div>
    </section>
  );
}
