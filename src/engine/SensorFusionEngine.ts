// Multi-Sensor Fusion Engine for Off-Highway Navigation

import type {
  GNSSData,
  IMUData,
  OdometryData,
  VisualOdometryData,
  LiDARData,
  FusedPose,
  IntegrityFlags,
  SensorContributions,
} from '@/types/navigation';

export class SensorFusionEngine {
  // Kalman filter state
  private state: {
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    heading: number;
    bias: { x: number; y: number; z: number };
  } = {
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    heading: 0,
    bias: { x: 0, y: 0, z: 0 },
  };

  private covariance: number[][];

  constructor() {
    this.covariance = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0.1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0.1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0.1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0.01, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0.01, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0.01],
    ];
  }

  // Initialize with starting position
  initialize(lat: number, lng: number, altitude: number = 0, heading: number = 0): void {
    const pos = this.latLngToXY(lat, lng);
    this.state.position = { x: pos.x, y: pos.y, z: altitude };
    this.state.heading = heading;
    // Reset covariance with lower initial uncertainty
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.covariance[i][j] = i === j ? 0.1 : 0;
      }
    }
  }

  // Main fusion function
  fuse(
    gnss: GNSSData | null,
    imu: IMUData | null,
    odometry: OdometryData | null,
    visualOdometry: VisualOdometryData | null,
    lidar: LiDARData | null
  ): FusedPose {
    const timestamp = Date.now();
    
    // Prediction step using IMU
    if (imu) {
      this.predictFromIMU(imu);
    }

    // Update steps with available sensors
    const contributions: SensorContributions = {
      gnss: 0,
      imu: imu ? 0.3 : 0,
      odometry: 0,
      visual: 0,
      lidar: 0,
    };

    if (gnss && gnss.isAvailable && gnss.fixType !== 'none') {
      const gnssWeight = this.calculateGNSSWeight(gnss);
      this.updateFromGNSS(gnss, gnssWeight);
      contributions.gnss = gnssWeight;
    }

    if (odometry && !odometry.slipDetected) {
      const odomWeight = 0.2;
      this.updateFromOdometry(odometry);
      contributions.odometry = odomWeight;
    }

    if (visualOdometry && visualOdometry.quality > 30) {
      const visualWeight = visualOdometry.quality / 200;
      this.updateFromVisualOdometry(visualOdometry, visualWeight);
      contributions.visual = visualWeight;
    }

    // Normalize contributions
    const total = Object.values(contributions).reduce((a, b) => a + b, 0);
    if (total > 0) {
      contributions.gnss /= total;
      contributions.imu /= total;
      contributions.odometry /= total;
      contributions.visual /= total;
      contributions.lidar /= total;
    }

    // Calculate integrity flags
    const integrityFlags = this.calculateIntegrityFlags(
      gnss,
      imu,
      odometry,
      visualOdometry,
      lidar
    );

    // Build fused pose
    const { lat, lng } = this.xyToLatLng(this.state.position.x, this.state.position.y);
    
    const fusedPose: FusedPose = {
      timestamp,
      pose: {
        position: {
          lat,
          lng,
          altitude: this.state.position.z,
        },
        heading: this.normalizeHeading(this.state.heading),
        roll: imu ? Math.atan2(imu.acceleration.y, imu.acceleration.z) * (180 / Math.PI) : 0,
        pitch: imu ? Math.atan2(-imu.acceleration.x, Math.sqrt(imu.acceleration.y ** 2 + imu.acceleration.z ** 2)) * (180 / Math.PI) : 0,
      },
      covariance: {
        position: [
          this.covariance[0][0], this.covariance[0][1], this.covariance[0][2],
          this.covariance[1][0], this.covariance[1][1], this.covariance[1][2],
          this.covariance[2][0], this.covariance[2][1], this.covariance[2][2],
        ],
        heading: this.covariance[6][6],
      },
      integrityFlags,
      sensorContributions: contributions,
    };

    return fusedPose;
  }

  // Prediction using IMU data
  private predictFromIMU(imu: IMUData): void {
    const dt = 0.05; // 20Hz assumption
    
    // Update velocity from acceleration
    this.state.velocity.x += (imu.acceleration.x - this.state.bias.x) * dt;
    this.state.velocity.y += (imu.acceleration.y - this.state.bias.y) * dt;
    this.state.velocity.z += (imu.acceleration.z - this.state.bias.z) * dt;

    // Update position from velocity
    this.state.position.x += this.state.velocity.x * dt;
    this.state.position.y += this.state.velocity.y * dt;
    this.state.position.z += this.state.velocity.z * dt;

    // Update heading from gyroscope (z-axis yaw)
    this.state.heading += imu.gyroscope.z * dt * (180 / Math.PI);

    // Add process noise to covariance
    const processNoise = 0.01;
    for (let i = 0; i < 9; i++) {
      this.covariance[i][i] += processNoise;
    }
  }

  // Update from GNSS measurement
  private updateFromGNSS(gnss: GNSSData, weight: number): void {
    const { x, y } = this.latLngToXY(gnss.position.lat, gnss.position.lng);
    
    const innovationX = x - this.state.position.x;
    const innovationY = y - this.state.position.y;
    const innovationZ = gnss.position.altitude - this.state.position.z;

    const gnssVariance = (gnss.accuracy ** 2) / weight;
    
    // Simple Kalman gain calculation
    const kGain = this.covariance[0][0] / (this.covariance[0][0] + gnssVariance);

    this.state.position.x += kGain * innovationX;
    this.state.position.y += kGain * innovationY;
    this.state.position.z += kGain * innovationZ;

    // Update covariance
    for (let i = 0; i < 3; i++) {
      this.covariance[i][i] *= (1 - kGain);
    }
  }

  // Update from odometry
  private updateFromOdometry(odometry: OdometryData): void {
    // Use speed to constrain velocity magnitude
    const speed = Math.sqrt(
      this.state.velocity.x ** 2 + 
      this.state.velocity.y ** 2
    );
    
    if (speed > 0.1) {
      const scale = odometry.speed / speed;
      this.state.velocity.x *= scale;
      this.state.velocity.y *= scale;
    }
  }

  // Update from visual odometry
  private updateFromVisualOdometry(vo: VisualOdometryData, weight: number): void {
    this.state.position.x += vo.relativeTranslation.x * weight;
    this.state.position.y += vo.relativeTranslation.y * weight;
    this.state.position.z += vo.relativeTranslation.z * weight;
  }

  // Calculate GNSS weight based on quality
  private calculateGNSSWeight(gnss: GNSSData): number {
    let weight = gnss.signalQuality / 100;
    
    if (gnss.fixType === 'rtk') weight *= 1.5;
    else if (gnss.fixType === '3d') weight *= 1.0;
    else if (gnss.fixType === '2d') weight *= 0.6;
    else weight *= 0.2;

    if (gnss.numSatellites < 4) weight *= 0.5;
    else if (gnss.numSatellites < 8) weight *= 0.8;

    return Math.min(weight, 1.0);
  }

  // Calculate integrity flags
  private calculateIntegrityFlags(
    gnss: GNSSData | null,
    imu: IMUData | null,
    odometry: OdometryData | null,
    visualOdometry: VisualOdometryData | null,
    lidar: LiDARData | null
  ): IntegrityFlags {
    const positionVariance = this.covariance[0][0] + this.covariance[1][1];
    const uncertaintyWithinBounds = positionVariance < 10; // 10m threshold

    const voQuality = visualOdometry?.quality ?? 0;

    return {
      gnssAvailable: gnss?.isAvailable ?? false,
      imuHealthy: imu !== null && Math.abs(imu.temperature - 25) < 30,
      odometryHealthy: odometry !== null && !odometry.slipDetected,
      visualOdometryHealthy: visualOdometry !== null && voQuality > 30,
      lidarHealthy: lidar !== null && lidar.pointCount > 100,
      positionReliable: uncertaintyWithinBounds && (gnss?.isAvailable || voQuality > 50),
      uncertaintyWithinBounds,
    };
  }

  // Coordinate conversions
  private latLngToXY(lat: number, lng: number): { x: number; y: number } {
    // Simple equirectangular projection
    const R = 6371000; // Earth radius in meters
    const x = R * lng * (Math.PI / 180) * Math.cos(lat * (Math.PI / 180));
    const y = R * lat * (Math.PI / 180);
    return { x, y };
  }

  private xyToLatLng(x: number, y: number): { lat: number; lng: number } {
    const R = 6371000;
    const lat = y * (180 / Math.PI) / R;
    const lng = x * (180 / Math.PI) / (R * Math.cos(lat * (Math.PI / 180)));
    return { lat, lng };
  }

  private normalizeHeading(heading: number): number {
    while (heading > 180) heading -= 360;
    while (heading < -180) heading += 360;
    return heading;
  }

  // Get current uncertainty estimate
  getPositionUncertainty(): number {
    return Math.sqrt(this.covariance[0][0] + this.covariance[1][1]);
  }

  // Reset filter
  reset(): void {
    this.state = {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      heading: 0,
      bias: { x: 0, y: 0, z: 0 },
    };
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.covariance[i][j] = i === j ? 1 : 0;
      }
    }
  }
}

export default SensorFusionEngine;
