// Navigation State Management Context

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type {
  NavigationState,
  FusedPose,
  GNSSData,
  IMUData,
  OdometryData,
  VisualOdometryData,
  LiDARData,
  TestScenario,
  Alert,
  LogEntry,
} from '@/types/navigation';
import { SensorFusionEngine } from '@/engine/SensorFusionEngine';
import { SensorSimulator, type SimulationConfig } from '@/engine/SensorSimulator';

// Action types
type Action =
  | { type: 'SET_POSE'; payload: FusedPose }
  | { type: 'SET_GNSS'; payload: GNSSData }
  | { type: 'SET_IMU'; payload: IMUData }
  | { type: 'SET_ODOMETRY'; payload: OdometryData }
  | { type: 'SET_VISUAL_ODOMETRY'; payload: VisualOdometryData }
  | { type: 'SET_LIDAR'; payload: LiDARData }
  | { type: 'START_NAVIGATION' }
  | { type: 'STOP_NAVIGATION' }
  | { type: 'SET_SCENARIO'; payload: TestScenario }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'CLEAR_LOGS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: NavigationState = {
  currentPose: null,
  gnssData: null,
  imuData: null,
  odometryData: null,
  visualOdometryData: null,
  lidarData: null,
  isRunning: false,
  currentScenario: null,
  alerts: [],
  logs: [],
};

// Reducer
function navigationReducer(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    case 'SET_POSE':
      return { ...state, currentPose: action.payload };
    case 'SET_GNSS':
      return { ...state, gnssData: action.payload };
    case 'SET_IMU':
      return { ...state, imuData: action.payload };
    case 'SET_ODOMETRY':
      return { ...state, odometryData: action.payload };
    case 'SET_VISUAL_ODOMETRY':
      return { ...state, visualOdometryData: action.payload };
    case 'SET_LIDAR':
      return { ...state, lidarData: action.payload };
    case 'START_NAVIGATION':
      return { ...state, isRunning: true };
    case 'STOP_NAVIGATION':
      return { ...state, isRunning: false };
    case 'SET_SCENARIO':
      return { ...state, currentScenario: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.payload ? { ...a, acknowledged: true } : a
        ),
      };
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs].slice(0, 1000) };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
}

// Context type
interface NavigationContextType {
  state: NavigationState;
  startNavigation: (scenario: TestScenario) => void;
  stopNavigation: () => void;
  acknowledgeAlert: (id: string) => void;
  clearLogs: () => void;
  exportData: () => string;
  getMetrics: () => NavigationMetrics;
}

interface NavigationMetrics {
  uptime: number;
  positionAccuracy: number;
  headingAccuracy: number;
  gnssAvailability: number;
  sensorHealth: {
    gnss: boolean;
    imu: boolean;
    odometry: boolean;
    visual: boolean;
    lidar: boolean;
  };
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// Provider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  
  const fusionEngineRef = useRef<SensorFusionEngine>(new SensorFusionEngine());
  const simulatorRef = useRef<SensorSimulator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Start navigation with a scenario
  const startNavigation = useCallback((scenario: TestScenario) => {
    // Reset engines
    fusionEngineRef.current.reset();
    
    // Initialize at first waypoint
    const startPos = scenario.waypoints[0];
    fusionEngineRef.current.initialize(startPos.lat, startPos.lng, startPos.altitude || 0);

    // Create simulator
    const config: SimulationConfig = {
      gnssUpdateRate: 10,
      imuUpdateRate: 100,
      odometryUpdateRate: 50,
      visualOdometryUpdateRate: 30,
      lidarUpdateRate: 10,
      gnssAvailability: scenario.environment === 'urban' ? 40 :
                       scenario.environment === 'forest' ? 25 :
                       scenario.environment === 'mining' ? 60 : 95,
      environment: scenario.environment,
    };

    simulatorRef.current = new SensorSimulator(config, startPos);
    simulatorRef.current.start(scenario.waypoints);

    dispatch({ type: 'SET_SCENARIO', payload: scenario });
    dispatch({ type: 'START_NAVIGATION' });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        timestamp: Date.now(),
        level: 'info',
        source: 'System',
        message: `Started navigation scenario: ${scenario.name}`,
      },
    });

    startTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();

    // Start the update loop
    const updateLoop = () => {
      if (!simulatorRef.current) return;

      const now = Date.now();
      const dt = (now - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = now;

      // Update simulator
      simulatorRef.current.update(dt);

      // Generate sensor data
      const gnss = simulatorRef.current.generateGNSSData();
      const imu = simulatorRef.current.generateIMUData();
      const odometry = simulatorRef.current.generateOdometryData();
      const visualOdometry = simulatorRef.current.generateVisualOdometryData();
      const lidar = simulatorRef.current.generateLiDARData();

      // Dispatch sensor data
      dispatch({ type: 'SET_GNSS', payload: gnss });
      dispatch({ type: 'SET_IMU', payload: imu });
      dispatch({ type: 'SET_ODOMETRY', payload: odometry });
      dispatch({ type: 'SET_VISUAL_ODOMETRY', payload: visualOdometry });
      dispatch({ type: 'SET_LIDAR', payload: lidar });

      // Fuse data
      const fusedPose = fusionEngineRef.current.fuse(
        gnss,
        imu,
        odometry,
        visualOdometry,
        lidar
      );

      dispatch({ type: 'SET_POSE', payload: fusedPose });

      // Check for alerts
      checkAlerts(gnss, imu, odometry, visualOdometry, lidar, fusedPose);

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, []);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    simulatorRef.current?.stop();
    simulatorRef.current = null;

    dispatch({ type: 'STOP_NAVIGATION' });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        timestamp: Date.now(),
        level: 'info',
        source: 'System',
        message: 'Navigation stopped',
      },
    });
  }, []);

  // Check for alerts
  const checkAlerts = (
    gnss: GNSSData,
    imu: IMUData,
    odometry: OdometryData,
    _visualOdometry: VisualOdometryData,
    _lidar: LiDARData,
    _fusedPose: FusedPose
  ) => {
    // GNSS alert
    if (!gnss.isAvailable && state.gnssData?.isAvailable) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'warning',
          source: 'GNSS',
          message: 'GNSS signal lost - switching to dead reckoning',
          acknowledged: false,
        },
      });
    }

    // IMU temperature alert
    if (imu.temperature > 50) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'warning',
          source: 'IMU',
          message: `IMU temperature high: ${imu.temperature.toFixed(1)}°C`,
          acknowledged: false,
        },
      });
    }

    // Wheel slip alert
    if (odometry.slipDetected) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'warning',
          source: 'Odometry',
          message: 'Wheel slip detected - excluding from fusion',
          acknowledged: false,
        },
      });
    }

    // Position uncertainty alert
    const uncertainty = fusionEngineRef.current.getPositionUncertainty();
    if (uncertainty > 5 && (!state.currentPose || fusionEngineRef.current.getPositionUncertainty() <= 5)) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'error',
          source: 'Fusion',
          message: `Position uncertainty exceeded: ${uncertainty.toFixed(1)}m`,
          acknowledged: false,
        },
      });
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = useCallback((id: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: id });
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const data = {
      state,
      exportTime: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [state]);

  // Get metrics
  const getMetrics = useCallback((): NavigationMetrics => {
    const uptime = state.isRunning ? (Date.now() - startTimeRef.current) / 1000 : 0;
    
    return {
      uptime,
      positionAccuracy: state.currentPose ? 
        Math.sqrt(state.currentPose.covariance.position[0] + state.currentPose.covariance.position[4]) : 
        999,
      headingAccuracy: state.currentPose?.covariance.heading || 999,
      gnssAvailability: state.gnssData?.isAvailable ? 100 : 0,
      sensorHealth: {
        gnss: state.gnssData?.isAvailable ?? false,
        imu: state.imuData ? Math.abs(state.imuData.temperature - 25) < 30 : false,
        odometry: state.odometryData ? !state.odometryData.slipDetected : false,
        visual: state.visualOdometryData ? state.visualOdometryData.quality > 30 : false,
        lidar: state.lidarData ? state.lidarData.pointCount > 1000 : false,
      },
    };
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        state,
        startNavigation,
        stopNavigation,
        acknowledgeAlert,
        clearLogs,
        exportData,
        getMetrics,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

// Hook
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default NavigationContext;
