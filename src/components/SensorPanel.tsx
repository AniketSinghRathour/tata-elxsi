// Sensor Panel Component - Detailed Sensor Monitoring

import { useNavigation } from '@/store/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Satellite, 
  Gauge, 
  CircleDot, 
  Eye, 
  Scan,
  Activity,
  Signal
} from 'lucide-react';

export default function SensorPanel() {
  const { state } = useNavigation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 h-full overflow-auto">
      {/* GNSS Card */}
      <SensorCard
        title="GNSS / RTK"
        icon={Satellite}
        status={state.gnssData?.isAvailable ? 'active' : 'error'}
        statusText={state.gnssData?.fixType?.toUpperCase() || 'NO FIX'}
      >
        {state.gnssData ? (
          <div className="space-y-2 text-sm">
            <DataRow label="Satellites" value={state.gnssData.numSatellites.toString()} />
            <DataRow label="HDOP" value={state.gnssData.accuracy.toFixed(2)} />
            <DataRow label="Signal Quality" value={`${Math.round(state.gnssData.signalQuality)}%`} />
            <DataRow 
              label="Latitude" 
              value={`${state.gnssData.position.lat.toFixed(6)}°`}
              mono
            />
            <DataRow 
              label="Longitude" 
              value={`${state.gnssData.position.lng.toFixed(6)}°`}
              mono
            />
            <DataRow 
              label="Altitude" 
              value={`${state.gnssData.position.altitude.toFixed(2)}m`}
              mono
            />
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No GNSS data</p>
        )}
      </SensorCard>

      {/* IMU Card */}
      <SensorCard
        title="IMU"
        icon={Gauge}
        status={state.imuData ? 'active' : 'error'}
        statusText={state.imuData?.isCalibrated ? 'CALIBRATED' : 'UNCALIBRATED'}
      >
        {state.imuData ? (
          <div className="space-y-2 text-sm">
            <div className="mb-3">
              <div className="text-xs text-[#A7B1C1] mb-1">Acceleration (m/s²)</div>
              <div className="grid grid-cols-3 gap-2">
                <ValueBox label="X" value={state.imuData.acceleration.x.toFixed(3)} />
                <ValueBox label="Y" value={state.imuData.acceleration.y.toFixed(3)} />
                <ValueBox label="Z" value={state.imuData.acceleration.z.toFixed(3)} />
              </div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-[#A7B1C1] mb-1">Gyroscope (rad/s)</div>
              <div className="grid grid-cols-3 gap-2">
                <ValueBox label="X" value={state.imuData.gyroscope.x.toFixed(3)} />
                <ValueBox label="Y" value={state.imuData.gyroscope.y.toFixed(3)} />
                <ValueBox label="Z" value={state.imuData.gyroscope.z.toFixed(3)} />
              </div>
            </div>
            <DataRow 
              label="Temperature" 
              value={`${state.imuData.temperature.toFixed(1)}°C`}
              valueColor={state.imuData.temperature > 50 ? 'text-yellow-400' : 'text-green-400'}
            />
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No IMU data</p>
        )}
      </SensorCard>

      {/* Odometry Card */}
      <SensorCard
        title="Wheel Odometry"
        icon={CircleDot}
        status={state.odometryData && !state.odometryData.slipDetected ? 'active' : 'warning'}
        statusText={state.odometryData?.slipDetected ? 'SLIP DETECTED' : 'ACTIVE'}
      >
        {state.odometryData ? (
          <div className="space-y-2 text-sm">
            <DataRow 
              label="Speed" 
              value={`${(state.odometryData.speed * 3.6).toFixed(2)} km/h`}
              mono
            />
            <DataRow 
              label="Distance" 
              value={`${state.odometryData.distance.toFixed(2)}m`}
              mono
            />
            <DataRow 
              label="Wheel Ticks" 
              value={state.odometryData.wheelTicks.toString()}
              mono
            />
            {state.odometryData.slipDetected && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                <div className="text-xs text-red-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Wheel slip detected - excluded from fusion
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No odometry data</p>
        )}
      </SensorCard>

      {/* Visual Odometry Card */}
      <SensorCard
        title="Visual Odometry"
        icon={Eye}
        status={state.visualOdometryData && state.visualOdometryData.quality > 30 ? 'active' : 'warning'}
        statusText={`${state.visualOdometryData ? Math.round(state.visualOdometryData.quality) : 0}% QUALITY`}
      >
        {state.visualOdometryData ? (
          <div className="space-y-2 text-sm">
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#A7B1C1] mb-1">
                <span>Quality</span>
                <span>{Math.round(state.visualOdometryData.quality)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    state.visualOdometryData.quality > 70 ? 'bg-green-500' :
                    state.visualOdometryData.quality > 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${state.visualOdometryData.quality}%` }}
                />
              </div>
            </div>
            <DataRow 
              label="Features Tracked" 
              value={state.visualOdometryData.featuresTracked.toString()}
              mono
            />
            <div className="mt-3">
              <div className="text-xs text-[#A7B1C1] mb-1">Relative Translation (m)</div>
              <div className="grid grid-cols-3 gap-2">
                <ValueBox label="X" value={state.visualOdometryData.relativeTranslation.x.toFixed(3)} />
                <ValueBox label="Y" value={state.visualOdometryData.relativeTranslation.y.toFixed(3)} />
                <ValueBox label="Z" value={state.visualOdometryData.relativeTranslation.z.toFixed(3)} />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No visual odometry data</p>
        )}
      </SensorCard>

      {/* LiDAR Card */}
      <SensorCard
        title="LiDAR"
        icon={Scan}
        status={state.lidarData && state.lidarData.pointCount > 1000 ? 'active' : 'warning'}
        statusText={`${state.lidarData ? (state.lidarData.pointCount / 1000).toFixed(1) : 0}k POINTS`}
      >
        {state.lidarData ? (
          <div className="space-y-2 text-sm">
            <DataRow 
              label="Point Count" 
              value={state.lidarData.pointCount.toLocaleString()}
              mono
            />
            <DataRow 
              label="Scan Rate" 
              value={`${state.lidarData.scanRate} Hz`}
              mono
            />
            <DataRow 
              label="Range" 
              value={`${state.lidarData.range}m`}
              mono
            />
            <div className="mt-3 p-3 bg-[#0B111A] rounded">
              <div className="text-xs text-[#A7B1C1] mb-2">Point Cloud Density</div>
              <div className="grid grid-cols-10 gap-0.5">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 rounded-sm ${
                      i < (state.lidarData?.pointCount || 0) / 200 ? 'bg-[#2DB3C2]' : 'bg-white/5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No LiDAR data</p>
        )}
      </SensorCard>

      {/* Fusion Output Card */}
      <SensorCard
        title="Fusion Output"
        icon={Signal}
        status={state.currentPose?.integrityFlags.positionReliable ? 'active' : 'warning'}
        statusText={state.currentPose?.integrityFlags.positionReliable ? 'RELIABLE' : 'DEGRADED'}
      >
        {state.currentPose ? (
          <div className="space-y-2 text-sm">
            <div className="mb-3">
              <div className="text-xs text-[#A7B1C1] mb-2">Sensor Contributions</div>
              <div className="space-y-1">
                <ContributionRow 
                  label="GNSS" 
                  value={state.currentPose.sensorContributions.gnss}
                />
                <ContributionRow 
                  label="IMU" 
                  value={state.currentPose.sensorContributions.imu}
                />
                <ContributionRow 
                  label="Odometry" 
                  value={state.currentPose.sensorContributions.odometry}
                />
                <ContributionRow 
                  label="Visual" 
                  value={state.currentPose.sensorContributions.visual}
                />
                <ContributionRow 
                  label="LiDAR" 
                  value={state.currentPose.sensorContributions.lidar}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-[#A7B1C1] mb-1">Integrity Flags</div>
              <div className="flex flex-wrap gap-1">
                <IntegrityBadge 
                  label="GNSS" 
                  active={state.currentPose.integrityFlags.gnssAvailable} 
                />
                <IntegrityBadge 
                  label="IMU" 
                  active={state.currentPose.integrityFlags.imuHealthy} 
                />
                <IntegrityBadge 
                  label="ODO" 
                  active={state.currentPose.integrityFlags.odometryHealthy} 
                />
                <IntegrityBadge 
                  label="VO" 
                  active={state.currentPose.integrityFlags.visualOdometryHealthy} 
                />
                <IntegrityBadge 
                  label="LIDAR" 
                  active={state.currentPose.integrityFlags.lidarHealthy} 
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#A7B1C1]">No fusion data</p>
        )}
      </SensorCard>
    </div>
  );
}

// Sub-components
interface SensorCardProps {
  title: string;
  icon: React.ElementType;
  status: 'active' | 'warning' | 'error';
  statusText: string;
  children: React.ReactNode;
}

function SensorCard({ title, icon: Icon, status, statusText, children }: SensorCardProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className="bg-[#141C27] border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#2DB3C2]" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Badge className={`text-xs ${statusColors[status]}`}>
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function DataRow({ 
  label, 
  value, 
  mono = false,
  valueColor = 'text-white'
}: { 
  label: string; 
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-[#A7B1C1]">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} ${valueColor}`}>{value}</span>
    </div>
  );
}

function ValueBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0B111A] rounded p-2 text-center">
      <div className="text-xs text-[#A7B1C1] mb-1">{label}</div>
      <div className="font-mono text-xs">{value}</div>
    </div>
  );
}

function ContributionRow({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#A7B1C1] w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#2DB3C2] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right">{percentage}%</span>
    </div>
  );
}

function IntegrityBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${
      active 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-red-500/20 text-red-400'
    }`}>
      {label}
    </span>
  );
}
