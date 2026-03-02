// Navigation and Sensor Data Types

export interface Position {
  lat: number;
  lng: number;
  altitude: number;
}

export interface Pose {
  position: Position;
  heading: number;
  roll: number;
  pitch: number;
}

export interface Covariance {
  position: number[]; // 3x3 matrix flattened
  heading: number;
}

export interface GNSSData {
  timestamp: number;
  position: Position;
  accuracy: number; // HDOP
  numSatellites: number;
  fixType: 'none' | '2d' | '3d' | 'rtk';
  signalQuality: number; // 0-100
  isAvailable: boolean;
}

export interface IMUData {
  timestamp: number;
  acceleration: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  temperature: number;
  isCalibrated: boolean;
}

export interface OdometryData {
  timestamp: number;
  speed: number;
  distance: number;
  wheelTicks: number;
  slipDetected: boolean;
}

export interface VisualOdometryData {
  timestamp: number;
  relativeTranslation: { x: number; y: number; z: number };
  quality: number; // 0-100
  featuresTracked: number;
}

export interface LiDARData {
  timestamp: number;
  pointCount: number;
  scanRate: number;
  range: number;
}

export interface FusedPose {
  timestamp: number;
  pose: Pose;
  covariance: Covariance;
  integrityFlags: IntegrityFlags;
  sensorContributions: SensorContributions;
}

export interface IntegrityFlags {
  gnssAvailable: boolean;
  imuHealthy: boolean;
  odometryHealthy: boolean;
  visualOdometryHealthy: boolean;
  lidarHealthy: boolean;
  positionReliable: boolean;
  uncertaintyWithinBounds: boolean;
}

export interface SensorContributions {
  gnss: number; // 0-1 weight
  imu: number;
  odometry: number;
  visual: number;
  lidar: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  environment: 'urban' | 'forest' | 'mining' | 'open';
  gnssAvailability: number; // 0-100
  duration: number; // seconds
  waypoints: Position[];
}

export interface Alert {
  id: string;
  timestamp: number;
  type: 'warning' | 'error' | 'info';
  source: string;
  message: string;
  acknowledged: boolean;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
}

export interface NavigationState {
  currentPose: FusedPose | null;
  gnssData: GNSSData | null;
  imuData: IMUData | null;
  odometryData: OdometryData | null;
  visualOdometryData: VisualOdometryData | null;
  lidarData: LiDARData | null;
  isRunning: boolean;
  currentScenario: TestScenario | null;
  alerts: Alert[];
  logs: LogEntry[];
}
