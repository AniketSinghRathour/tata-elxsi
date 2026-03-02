// Sensor Data Simulator for Testing Navigation System

import type {
  Position,
  GNSSData,
  IMUData,
  OdometryData,
  VisualOdometryData,
  LiDARData,
} from '@/types/navigation';

export interface SimulationConfig {
  gnssUpdateRate: number; // Hz
  imuUpdateRate: number;
  odometryUpdateRate: number;
  visualOdometryUpdateRate: number;
  lidarUpdateRate: number;
  gnssAvailability: number; // 0-100
  environment: 'urban' | 'forest' | 'mining' | 'open';
}

export class SensorSimulator {
  private config: SimulationConfig;
  private currentPosition: Position;
  private currentHeading: number = 0;
  private currentSpeed: number = 0;
  private distanceTraveled: number = 0;
  private waypoints: Position[] = [];
  private currentWaypointIndex: number = 0;
  private isRunning: boolean = false;
  
  // GNSS simulation state
  private gnssOutageStart: number = 0;
  private inGnssOutage: boolean = false;
  private multipathActive: boolean = false;

  // IMU simulation state
  private imuBias: { x: number; y: number; z: number };
  private imuTemperature: number = 25;

  // Odometry simulation state
  private wheelTicks: number = 0;
  private slipProbability: number = 0.05;

  // Visual odometry simulation state
  private voQuality: number = 80;
  private textureQuality: number = 70;

  // LiDAR simulation state
  private lidarPointCount: number = 10000;

  constructor(config: SimulationConfig, startPosition: Position) {
    this.config = config;
    this.currentPosition = { ...startPosition };
    this.imuBias = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02,
    };
  }

  start(waypoints: Position[]): void {
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.isRunning = true;
    this.distanceTraveled = 0;
    this.wheelTicks = 0;
    
    // Set environment-specific parameters
    this.setEnvironmentParams();
  }

  stop(): void {
    this.isRunning = false;
  }

  private setEnvironmentParams(): void {
    switch (this.config.environment) {
      case 'urban':
        this.config.gnssAvailability = 40;
        this.multipathActive = true;
        this.voQuality = 60;
        this.textureQuality = 50;
        this.slipProbability = 0.03;
        break;
      case 'forest':
        this.config.gnssAvailability = 25;
        this.multipathActive = false;
        this.voQuality = 45;
        this.textureQuality = 40;
        this.slipProbability = 0.08;
        break;
      case 'mining':
        this.config.gnssAvailability = 60;
        this.multipathActive = true;
        this.voQuality = 35;
        this.textureQuality = 30;
        this.slipProbability = 0.12;
        this.lidarPointCount = 8000;
        break;
      case 'open':
        this.config.gnssAvailability = 95;
        this.multipathActive = false;
        this.voQuality = 85;
        this.textureQuality = 80;
        this.slipProbability = 0.02;
        break;
    }
  }

  // Update vehicle state (call at high frequency)
  update(dt: number): void {
    if (!this.isRunning || this.waypoints.length === 0) return;

    const target = this.waypoints[this.currentWaypointIndex];
    const distanceToTarget = this.haversineDistance(
      this.currentPosition.lat,
      this.currentPosition.lng,
      target.lat,
      target.lng
    );

    // Check if reached waypoint
    if (distanceToTarget < 5) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.currentWaypointIndex = 0; // Loop back
      }
      return;
    }

    // Calculate heading to target
    const targetHeading = this.calculateBearing(
      this.currentPosition.lat,
      this.currentPosition.lng,
      target.lat,
      target.lng
    );

    // Smooth heading transition
    const headingDiff = this.angleDifference(targetHeading, this.currentHeading);
    this.currentHeading += headingDiff * 0.1;

    // Set speed based on environment and turn rate
    const maxSpeed = this.config.environment === 'urban' ? 15 : 25; // km/h
    const turnPenalty = Math.abs(headingDiff) > 30 ? 0.5 : 1.0;
    const targetSpeed = maxSpeed * turnPenalty * (0.8 + Math.random() * 0.4);
    
    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.1;

    // Update position
    const speedMs = this.currentSpeed / 3.6; // Convert to m/s
    const distance = speedMs * dt;
    this.distanceTraveled += distance;

    const newPosition = this.calculateNewPosition(
      this.currentPosition.lat,
      this.currentPosition.lng,
      this.currentHeading,
      distance
    );

    this.currentPosition = newPosition;
    this.wheelTicks += distance * 10; // 10 ticks per meter

    // Update IMU temperature
    this.imuTemperature = 25 + Math.sin(Date.now() / 60000) * 10 + Math.random() * 2;

    // Simulate GNSS outages
    this.updateGNSSOutage(dt);
  }

  private updateGNSSOutage(dt: number): void {
    const outageProbability = (100 - this.config.gnssAvailability) / 1000;
    
    if (!this.inGnssOutage) {
      if (Math.random() < outageProbability * dt) {
        this.inGnssOutage = true;
        this.gnssOutageStart = Date.now();
      }
    } else {
      const outageDuration = (Date.now() - this.gnssOutageStart) / 1000;
      const maxOutageDuration = this.config.environment === 'forest' ? 30 : 10;
      
      if (outageDuration > maxOutageDuration || Math.random() < 0.1 * dt) {
        this.inGnssOutage = false;
      }
    }
  }

  // Generate GNSS data
  generateGNSSData(): GNSSData {
    const timestamp = Date.now();
    
    if (this.inGnssOutage) {
      return {
        timestamp,
        position: { ...this.currentPosition },
        accuracy: 999,
        numSatellites: 0,
        fixType: 'none',
        signalQuality: 0,
        isAvailable: false,
      };
    }

    // Simulate multipath errors
    const multipathError = this.multipathActive ? 
      (Math.random() - 0.5) * 5 : 
      (Math.random() - 0.5) * 0.5;

    const baseAccuracy = this.config.environment === 'open' ? 0.5 : 
                        this.config.environment === 'urban' ? 3.0 : 5.0;
    
    const accuracy = baseAccuracy + Math.abs(multipathError) + Math.random() * 0.5;
    
    const numSats = this.inGnssOutage ? 0 :
      this.config.environment === 'open' ? 12 + Math.floor(Math.random() * 6) :
      this.config.environment === 'urban' ? 6 + Math.floor(Math.random() * 4) :
      4 + Math.floor(Math.random() * 3);

    const fixType = numSats < 4 ? 'none' :
                   accuracy < 0.02 ? 'rtk' :
                   numSats > 6 ? '3d' : '2d';

    const signalQuality = Math.max(0, Math.min(100, 
      (numSats / 12) * 100 - accuracy * 5 + Math.random() * 10
    ));

    return {
      timestamp,
      position: {
        lat: this.currentPosition.lat + multipathError * 0.00001,
        lng: this.currentPosition.lng + multipathError * 0.00001,
        altitude: this.currentPosition.altitude + (Math.random() - 0.5) * 2,
      },
      accuracy,
      numSatellites: numSats,
      fixType,
      signalQuality,
      isAvailable: numSats >= 4,
    };
  }

  // Generate IMU data
  generateIMUData(): IMUData {
    const timestamp = Date.now();
    
    // Calculate acceleration based on motion
    const headingRad = this.currentHeading * (Math.PI / 180);
    const speedMs = this.currentSpeed / 3.6;
    
    // Forward acceleration (simplified)
    const forwardAccel = (Math.random() - 0.5) * 0.5;
    
    // Lateral acceleration from turning
    const turnRate = Math.sin(Date.now() / 2000) * 0.1;
    const lateralAccel = speedMs * turnRate;

    return {
      timestamp,
      acceleration: {
        x: forwardAccel * Math.cos(headingRad) - lateralAccel * Math.sin(headingRad) + this.imuBias.x + (Math.random() - 0.5) * 0.05,
        y: forwardAccel * Math.sin(headingRad) + lateralAccel * Math.cos(headingRad) + this.imuBias.y + (Math.random() - 0.5) * 0.05,
        z: 9.81 + this.imuBias.z + (Math.random() - 0.5) * 0.02,
      },
      gyroscope: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: turnRate + (Math.random() - 0.5) * 0.02,
      },
      temperature: this.imuTemperature,
      isCalibrated: true,
    };
  }

  // Generate Odometry data
  generateOdometryData(): OdometryData {
    const timestamp = Date.now();
    const speedMs = this.currentSpeed / 3.6;
    
    // Simulate wheel slip
    const slipDetected = Math.random() < this.slipProbability;
    const slipFactor = slipDetected ? 0.7 + Math.random() * 0.3 : 1.0;

    return {
      timestamp,
      speed: speedMs * slipFactor * (0.98 + Math.random() * 0.04),
      distance: this.distanceTraveled,
      wheelTicks: Math.floor(this.wheelTicks),
      slipDetected,
    };
  }

  // Generate Visual Odometry data
  generateVisualOdometryData(): VisualOdometryData {
    const timestamp = Date.now();
    
    // VO quality depends on environment lighting and texture
    const lightingFactor = 0.7 + Math.sin(Date.now() / 10000) * 0.3;
    const quality = Math.max(10, Math.min(100, 
      this.voQuality * lightingFactor * (this.textureQuality / 100) + (Math.random() - 0.5) * 20
    ));

    const speedMs = this.currentSpeed / 3.6;
    const headingRad = this.currentHeading * (Math.PI / 180);

    return {
      timestamp,
      relativeTranslation: {
        x: speedMs * 0.05 * Math.cos(headingRad) + (Math.random() - 0.5) * 0.1,
        y: speedMs * 0.05 * Math.sin(headingRad) + (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.05,
      },
      quality,
      featuresTracked: Math.floor(quality * 3 + Math.random() * 50),
    };
  }

  // Generate LiDAR data
  generateLiDARData(): LiDARData {
    const timestamp = Date.now();
    
    // Point count varies with environment
    const dustFactor = this.config.environment === 'mining' ? 0.7 : 1.0;
    const pointCount = Math.floor(this.lidarPointCount * dustFactor + (Math.random() - 0.5) * 2000);

    return {
      timestamp,
      pointCount: Math.max(1000, pointCount),
      scanRate: 10, // Hz
      range: this.config.environment === 'open' ? 100 : 50,
    };
  }

  // Get current state
  getCurrentState(): {
    position: Position;
    heading: number;
    speed: number;
    distanceTraveled: number;
    waypointIndex: number;
  } {
    return {
      position: { ...this.currentPosition },
      heading: this.currentHeading,
      speed: this.currentSpeed,
      distanceTraveled: this.distanceTraveled,
      waypointIndex: this.currentWaypointIndex,
    };
  }

  // Helper functions
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360;
  }

  private angleDifference(target: number, current: number): number {
    let diff = target - current;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }

  private calculateNewPosition(lat: number, lon: number, heading: number, distance: number): Position {
    const R = 6371000;
    const headingRad = heading * (Math.PI / 180);
    
    const latRad = lat * (Math.PI / 180);
    const lonRad = lon * (Math.PI / 180);
    
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distance / R) +
      Math.cos(latRad) * Math.sin(distance / R) * Math.cos(headingRad)
    );
    
    const newLonRad = lonRad + Math.atan2(
      Math.sin(headingRad) * Math.sin(distance / R) * Math.cos(latRad),
      Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLatRad)
    );
    
    return {
      lat: newLatRad * (180 / Math.PI),
      lng: newLonRad * (180 / Math.PI),
      altitude: this.currentPosition.altitude,
    };
  }
}

export default SensorSimulator;
