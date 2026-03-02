import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Satellite,
  Gauge,
  Scan,
  Layers,
  Navigation,
  Shield,
  Cpu,
  ArrowRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ArchitectureSectionProps {
  className?: string;
}

const architectureLayers = [
  {
    icon: Satellite,
    title: 'Sensors',
    items: ['GNSS/RTK', 'IMU', 'Wheel Odometry', 'Cameras', 'LiDAR'],
    color: '#2DB3C2',
  },
  {
    icon: Scan,
    title: 'Preprocessing',
    items: ['Time Sync', 'Outlier Rejection', 'Calibration', 'Signal Conditioning'],
    color: '#3CCFDD',
  },
  {
    icon: Layers,
    title: 'Fusion Engine',
    items: ['EKF/Factor Graph', 'Adaptive Weights', 'Map Matching', 'State Estimation'],
    color: '#4BE0EE',
  },
  {
    icon: Navigation,
    title: 'Output',
    items: ['Pose (x,y,z)', 'Covariance', 'Integrity Flags', 'Update Rate 50Hz'],
    color: '#5AF1FF',
  },
  {
    icon: Shield,
    title: 'Safety Monitor',
    items: ['Protection Limits', 'Fault Detection', 'Health Monitor', 'Fallback Modes'],
    color: '#69FFFF',
  },
];

export default function ArchitectureSection({
  className = '',
}: ArchitectureSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: 24, opacity: 0 },
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

      // Diagram animation
      gsap.fromTo(
        diagramRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: diagramRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Layer stagger animation
      const layers = diagramRef.current?.querySelectorAll('.arch-layer');
      if (layers) {
        layers.forEach((layer, index) => {
          gsap.fromTo(
            layer,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: index * 0.1,
              scrollTrigger: {
                trigger: diagramRef.current,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Details animation
      gsap.fromTo(
        detailsRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: detailsRef.current,
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
      id="architecture"
      className={`relative py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Diagonal grid background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(45, 179, 194, 0.5) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(45, 179, 194, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 px-6 lg:px-12">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-12">
          <span className="label-micro text-[#2DB3C2] mb-4 block">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
            A modular stack for edge deployment.
          </h2>
          <p className="text-base md:text-lg text-[#A7B1C1] max-w-2xl mx-auto">
            From sensor preprocessing to time-synchronized fusion and safety
            monitoring—designed for ARM/x86 edge computers with real-time
            constraints.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div
          ref={diagramRef}
          className="max-w-[1200px] mx-auto mb-12"
        >
          <div className="card-dark p-6 lg:p-8">
            <div className="flex flex-col gap-4">
              {architectureLayers.map((layer, index) => (
                <div
                  key={index}
                  className="arch-layer group"
                  style={{ opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 rounded-lg bg-[#0B111A]/50 border border-white/5 hover:border-[#2DB3C2]/30 transition-colors">
                    {/* Layer header */}
                    <div className="flex items-center gap-3 lg:w-48 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${layer.color}15` }}
                      >
                        <layer.icon
                          size={20}
                          style={{ color: layer.color }}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {layer.title}
                      </h3>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                      <ArrowRight
                        size={16}
                        className="text-[#A7B1C1] group-hover:text-[#2DB3C2] transition-colors"
                      />
                    </div>

                    {/* Layer items */}
                    <div className="flex flex-wrap gap-2 flex-1">
                      {layer.items.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1.5 text-sm text-[#A7B1C1] bg-white/5 rounded-md border border-white/10"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data flow indicator */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[#A7B1C1]">
              <Cpu size={16} className="text-[#2DB3C2]" />
              <span>Edge Compute: ARM/x86 | Power Budget: ≤ 30-60W | Latency: &lt; 100ms</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div
          ref={detailsRef}
          className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="card-dark p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge size={18} className="text-[#2DB3C2]" />
              Performance Specs
            </h4>
            <ul className="space-y-3 text-sm text-[#A7B1C1]">
              <li className="flex justify-between">
                <span>Update Rate</span>
                <span className="text-white">10-50 Hz</span>
              </li>
              <li className="flex justify-between">
                <span>Latency</span>
                <span className="text-white">&lt; 100 ms</span>
              </li>
              <li className="flex justify-between">
                <span>Power Consumption</span>
                <span className="text-white">≤ 30-60W</span>
              </li>
              <li className="flex justify-between">
                <span>Operating Temperature</span>
                <span className="text-white">-20°C to +55°C</span>
              </li>
            </ul>
          </div>

          <div className="card-dark p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Satellite size={18} className="text-[#2DB3C2]" />
              Sensor Interface
            </h4>
            <ul className="space-y-3 text-sm text-[#A7B1C1]">
              <li className="flex justify-between">
                <span>GNSS</span>
                <span className="text-white">NMEA/UBX/RTCM3</span>
              </li>
              <li className="flex justify-between">
                <span>IMU</span>
                <span className="text-white">SPI/CAN/Ethernet</span>
              </li>
              <li className="flex justify-between">
                <span>Cameras</span>
                <span className="text-white">GigE/USB3/GMSL</span>
              </li>
              <li className="flex justify-between">
                <span>LiDAR</span>
                <span className="text-white">Ethernet/UDP</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
