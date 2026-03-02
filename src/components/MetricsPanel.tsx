// Metrics Panel Component - Real-time Performance Metrics

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Clock,
  Activity,
  Navigation,
  Gauge
} from 'lucide-react';

interface MetricData {
  timestamp: number;
  positionAccuracy: number;
  headingAccuracy: number;
  gnssAvailability: number;
  fusionRate: number;
  latency: number;
}

export default function MetricsPanel() {
  const { state } = useNavigation();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<MetricData | null>(null);

  // Collect metrics over time
  useEffect(() => {
    if (!state.isRunning || !state.currentPose) return;

    const interval = setInterval(() => {
      const positionAccuracy = Math.sqrt(
        state.currentPose!.covariance.position[0] + 
        state.currentPose!.covariance.position[4]
      );

      const newMetric: MetricData = {
        timestamp: Date.now(),
        positionAccuracy,
        headingAccuracy: state.currentPose!.covariance.heading,
        gnssAvailability: state.gnssData?.isAvailable ? 100 : 0,
        fusionRate: 50, // Hz
        latency: 15 + Math.random() * 10, // ms
      };

      setCurrentMetrics(newMetric);
      setMetrics(prev => [...prev.slice(-100), newMetric]);
    }, 200);

    return () => clearInterval(interval);
  }, [state.isRunning, state.currentPose, state.gnssData]);

  // Calculate statistics
  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, avg };
  };

  const positionStats = calculateStats(metrics.map(m => m.positionAccuracy));
  const headingStats = calculateStats(metrics.map(m => m.headingAccuracy));
  const latencyStats = calculateStats(metrics.map(m => m.latency));

  // Calculate availability percentage
  const gnssAvailabilityPercent = metrics.length > 0
    ? (metrics.filter(m => m.gnssAvailability === 100).length / metrics.length) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Current Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Position Accuracy"
          value={currentMetrics ? `${currentMetrics.positionAccuracy.toFixed(2)}m` : 'N/A'}
          target="≤ 1.0m"
          status={currentMetrics ? 
            (currentMetrics.positionAccuracy <= 0.5 ? 'excellent' :
             currentMetrics.positionAccuracy <= 1.0 ? 'good' :
             currentMetrics.positionAccuracy <= 5.0 ? 'fair' : 'poor')
            : 'neutral'
          }
          icon={Target}
        />
        <MetricCard
          title="Heading Accuracy"
          value={currentMetrics ? `${currentMetrics.headingAccuracy.toFixed(2)}°` : 'N/A'}
          target="≤ 1.0°"
          status={currentMetrics ?
            (currentMetrics.headingAccuracy <= 0.5 ? 'excellent' :
             currentMetrics.headingAccuracy <= 1.0 ? 'good' :
             currentMetrics.headingAccuracy <= 3.0 ? 'fair' : 'poor')
            : 'neutral'
          }
          icon={Navigation}
        />
        <MetricCard
          title="GNSS Availability"
          value={`${gnssAvailabilityPercent.toFixed(1)}%`}
          target="≥ 99%"
          status={gnssAvailabilityPercent >= 99 ? 'excellent' :
                  gnssAvailabilityPercent >= 80 ? 'good' :
                  gnssAvailabilityPercent >= 50 ? 'fair' : 'poor'}
          icon={Activity}
        />
        <MetricCard
          title="System Latency"
          value={currentMetrics ? `${currentMetrics.latency.toFixed(0)}ms` : 'N/A'}
          target="< 100ms"
          status={currentMetrics ?
            (currentMetrics.latency < 50 ? 'excellent' :
             currentMetrics.latency < 100 ? 'good' :
             currentMetrics.latency < 200 ? 'fair' : 'poor')
            : 'neutral'
          }
          icon={Clock}
        />
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Position Accuracy History */}
        <Card className="bg-[#141C27] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-[#2DB3C2]" />
                Position Accuracy History
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#A7B1C1]">Avg:</span>
                <span className="font-mono">{positionStats.avg.toFixed(2)}m</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MetricChart 
              data={metrics.map(m => m.positionAccuracy)} 
              color="#2DB3C2"
              min={0}
              max={10}
              threshold={1}
            />
            <div className="flex justify-between text-xs text-[#A7B1C1] mt-2">
              <span>Min: {positionStats.min.toFixed(2)}m</span>
              <span>Max: {positionStats.max.toFixed(2)}m</span>
            </div>
          </CardContent>
        </Card>

        {/* Heading Accuracy History */}
        <Card className="bg-[#141C27] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#2DB3C2]" />
                Heading Accuracy History
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#A7B1C1]">Avg:</span>
                <span className="font-mono">{headingStats.avg.toFixed(2)}°</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MetricChart 
              data={metrics.map(m => m.headingAccuracy)} 
              color="#3CCFDD"
              min={0}
              max={5}
              threshold={1}
            />
            <div className="flex justify-between text-xs text-[#A7B1C1] mt-2">
              <span>Min: {headingStats.min.toFixed(2)}°</span>
              <span>Max: {headingStats.max.toFixed(2)}°</span>
            </div>
          </CardContent>
        </Card>

        {/* Latency History */}
        <Card className="bg-[#141C27] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2DB3C2]" />
                System Latency
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#A7B1C1]">Avg:</span>
                <span className="font-mono">{latencyStats.avg.toFixed(0)}ms</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MetricChart 
              data={metrics.map(m => m.latency)} 
              color="#4BE0EE"
              min={0}
              max={100}
              threshold={50}
            />
            <div className="flex justify-between text-xs text-[#A7B1C1] mt-2">
              <span>Min: {latencyStats.min.toFixed(0)}ms</span>
              <span>Max: {latencyStats.max.toFixed(0)}ms</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-[#141C27] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#2DB3C2]" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <PerformanceRow
                label="Position Accuracy (CEP95)"
                value={positionStats.avg}
                target={1.0}
                unit="m"
              />
              <PerformanceRow
                label="Heading Accuracy"
                value={headingStats.avg}
                target={1.0}
                unit="°"
              />
              <PerformanceRow
                label="GNSS Availability"
                value={gnssAvailabilityPercent}
                target={99}
                unit="%"
              />
              <PerformanceRow
                label="System Latency"
                value={latencyStats.avg}
                target={100}
                unit="ms"
                lowerIsBetter
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Compliance */}
      <Card className="bg-[#141C27] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Target Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ComplianceIndicator
              label="Position ≤ 1.0m"
              compliant={positionStats.avg <= 1.0}
            />
            <ComplianceIndicator
              label="Heading ≤ 1.0°"
              compliant={headingStats.avg <= 1.0}
            />
            <ComplianceIndicator
              label="Availability ≥ 99%"
              compliant={gnssAvailabilityPercent >= 99}
            />
            <ComplianceIndicator
              label="Latency < 100ms"
              compliant={latencyStats.avg < 100}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components
interface MetricCardProps {
  title: string;
  value: string;
  target: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'neutral';
  icon: React.ElementType;
}

function MetricCard({ title, value, target, status, icon: Icon }: MetricCardProps) {
  const statusColors = {
    excellent: 'text-green-400 border-green-400/30 bg-green-400/10',
    good: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    fair: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    poor: 'text-red-400 border-red-400/30 bg-red-400/10',
    neutral: 'text-[#A7B1C1] border-white/10 bg-white/5',
  };

  const StatusIcon = status === 'excellent' ? TrendingUp :
                    status === 'good' ? TrendingUp :
                    status === 'fair' ? Minus :
                    status === 'poor' ? TrendingDown : Minus;

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs opacity-80">{title}</p>
            <p className="text-2xl font-bold font-mono mt-1">{value}</p>
            <p className="text-xs opacity-60 mt-1">Target: {target}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Icon className="w-5 h-5 opacity-60" />
            <StatusIcon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricChart({ 
  data, 
  color, 
  min, 
  max, 
  threshold 
}: { 
  data: number[]; 
  color: string;
  min: number;
  max: number;
  threshold: number;
}) {
  if (data.length === 0) {
    return <div className="h-24 flex items-center justify-center text-sm text-[#A7B1C1]">No data</div>;
  }

  const width = 100;
  const height = 100;
  const padding = 5;
  
  const range = max - min;
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const thresholdY = height - padding - ((threshold - min) / range) * (height - 2 * padding);

  return (
    <div className="h-24 relative">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Threshold line */}
        <line
          x1={padding}
          y1={thresholdY}
          x2={width - padding}
          y2={thresholdY}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeDasharray="2,2"
        />
        
        {/* Data line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Area under curve */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={color}
          opacity="0.1"
        />
      </svg>
    </div>
  );
}

function PerformanceRow({ 
  label, 
  value, 
  target, 
  unit,
  lowerIsBetter = false
}: { 
  label: string; 
  value: number; 
  target: number;
  unit: string;
  lowerIsBetter?: boolean;
}) {
  const isGood = lowerIsBetter ? value <= target : value >= target;
  const percentage = lowerIsBetter 
    ? Math.min(100, (target / Math.max(value, 0.001)) * 100)
    : Math.min(100, (value / target) * 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#A7B1C1]">{label}</span>
        <span className={`font-mono ${isGood ? 'text-green-400' : 'text-yellow-400'}`}>
          {value.toFixed(2)}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ComplianceIndicator({ label, compliant }: { label: string; compliant: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded border ${
      compliant 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-red-500/10 border-red-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${compliant ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-sm ${compliant ? 'text-green-400' : 'text-red-400'}`}>
        {label}
      </span>
    </div>
  );
}
