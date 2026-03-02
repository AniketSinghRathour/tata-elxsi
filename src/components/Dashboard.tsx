// Main Navigation Dashboard Component

import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/store/NavigationContext';
import { 
  Play, 
  Square, 
  Navigation,
  Activity,
  Clock,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import MapView from './MapView';
import SensorPanel from './SensorPanel';
import ScenarioSelector from './ScenarioSelector';
import MetricsPanel from './MetricsPanel';
import AlertsPanel from './AlertsPanel';

export default function Dashboard() {
  const { state, stopNavigation, getMetrics, exportData, clearLogs } = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(getMetrics());
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 500);
    return () => clearInterval(interval);
  }, [getMetrics]);

  // Handle export
  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navigation-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B111A] text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#141C27]">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-[#2DB3C2]" />
          <h1 className="text-lg font-semibold">TerraNav Localization System</h1>
          {state.isRunning && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Uptime */}
          {state.isRunning && (
            <div className="flex items-center gap-2 text-sm text-[#A7B1C1]">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatUptime(metrics.uptime)}</span>
            </div>
          )}

          {/* Control Buttons */}
          {!state.isRunning ? (
            <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#2DB3C2] hover:bg-[#25a0ad] text-[#0B111A]">
                  <Play className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#141C27] border-white/10 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Test Scenario</DialogTitle>
                  <DialogDescription className="text-[#A7B1C1]">
                    Choose an environment scenario to simulate
                  </DialogDescription>
                </DialogHeader>
                <ScenarioSelector onSelect={() => setShowScenarioDialog(false)} />
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              variant="destructive" 
              onClick={stopNavigation}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}

          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Status */}
        <div className="w-64 border-r border-white/10 bg-[#141C27] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-[#A7B1C1] mb-3">System Status</h3>
            <div className="space-y-2">
              <StatusIndicator 
                label="GNSS" 
                active={metrics.sensorHealth.gnss} 
                detail={state.gnssData?.fixType?.toUpperCase()}
              />
              <StatusIndicator 
                label="IMU" 
                active={metrics.sensorHealth.imu}
                detail={state.imuData ? `${state.imuData.temperature.toFixed(1)}°C` : '-'}
              />
              <StatusIndicator 
                label="Odometry" 
                active={metrics.sensorHealth.odometry}
                detail={state.odometryData?.slipDetected ? 'SLIP' : 'OK'}
              />
              <StatusIndicator 
                label="Visual Odometry" 
                active={metrics.sensorHealth.visual}
                detail={state.visualOdometryData ? `${Math.round(state.visualOdometryData.quality)}%` : '-'}
              />
              <StatusIndicator 
                label="LiDAR" 
                active={metrics.sensorHealth.lidar}
                detail={state.lidarData ? `${(state.lidarData.pointCount / 1000).toFixed(1)}k` : '-'}
              />
            </div>
          </div>

          <div className="p-4 border-b border-white/10 flex-1">
            <h3 className="text-sm font-medium text-[#A7B1C1] mb-3">Current Position</h3>
            {state.currentPose ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Latitude</span>
                  <span className="font-mono">{state.currentPose.pose.position.lat.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Longitude</span>
                  <span className="font-mono">{state.currentPose.pose.position.lng.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Altitude</span>
                  <span className="font-mono">{state.currentPose.pose.position.altitude.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Heading</span>
                  <span className="font-mono">{state.currentPose.pose.heading.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Roll</span>
                  <span className="font-mono">{state.currentPose.pose.roll.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B1C1]">Pitch</span>
                  <span className="font-mono">{state.currentPose.pose.pitch.toFixed(1)}°</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#A7B1C1]">No position data</p>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-sm font-medium text-[#A7B1C1] mb-3">Uncertainty</h3>
            {state.currentPose ? (
              <div className="space-y-2">
                <UncertaintyBar 
                  label="Position" 
                  value={metrics.positionAccuracy} 
                  max={10}
                  unit="m"
                />
                <UncertaintyBar 
                  label="Heading" 
                  value={metrics.headingAccuracy} 
                  max={5}
                  unit="°"
                />
              </div>
            ) : (
              <p className="text-sm text-[#A7B1C1]">No data</p>
            )}
          </div>
        </div>

        {/* Center - Main View */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 bg-[#141C27] border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Overview
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Map View
              </TabsTrigger>
              <TabsTrigger value="sensors" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Sensors
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Metrics
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Alerts
                {state.alerts.filter(a => !a.acknowledged).length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {state.alerts.filter(a => !a.acknowledged).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-[#2DB3C2] data-[state=active]:text-[#0B111A]">
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 m-0 p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* Map Preview */}
                <Card className="bg-[#141C27] border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#A7B1C1]">Live Map</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-3rem)]">
                    <MapView compact />
                  </CardContent>
                </Card>

                {/* Sensor Fusion Weights */}
                <Card className="bg-[#141C27] border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#A7B1C1]">Sensor Contributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {state.currentPose ? (
                      <div className="space-y-3">
                        <ContributionBar 
                          label="GNSS" 
                          value={state.currentPose.sensorContributions.gnss}
                          color="#2DB3C2"
                        />
                        <ContributionBar 
                          label="IMU" 
                          value={state.currentPose.sensorContributions.imu}
                          color="#3CCFDD"
                        />
                        <ContributionBar 
                          label="Odometry" 
                          value={state.currentPose.sensorContributions.odometry}
                          color="#4BE0EE"
                        />
                        <ContributionBar 
                          label="Visual" 
                          value={state.currentPose.sensorContributions.visual}
                          color="#5AF1FF"
                        />
                        <ContributionBar 
                          label="LiDAR" 
                          value={state.currentPose.sensorContributions.lidar}
                          color="#69FFFF"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-[#A7B1C1]">No fusion data</p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-[#141C27] border-white/10 col-span-2">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <StatBox 
                        label="Position Accuracy"
                        value={metrics.positionAccuracy < 999 ? `${metrics.positionAccuracy.toFixed(2)}m` : 'N/A'}
                        status={metrics.positionAccuracy < 1 ? 'good' : metrics.positionAccuracy < 5 ? 'warning' : 'error'}
                      />
                      <StatBox 
                        label="Heading Accuracy"
                        value={metrics.headingAccuracy < 999 ? `${metrics.headingAccuracy.toFixed(2)}°` : 'N/A'}
                        status={metrics.headingAccuracy < 1 ? 'good' : metrics.headingAccuracy < 3 ? 'warning' : 'error'}
                      />
                      <StatBox 
                        label="GNSS Availability"
                        value={`${metrics.gnssAvailability.toFixed(0)}%`}
                        status={metrics.gnssAvailability > 80 ? 'good' : metrics.gnssAvailability > 40 ? 'warning' : 'error'}
                      />
                      <StatBox 
                        label="System Status"
                        value={state.isRunning ? 'Active' : 'Standby'}
                        status={state.isRunning ? 'good' : 'neutral'}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="map" className="flex-1 m-0 p-4">
              <Card className="h-full bg-[#141C27] border-white/10">
                <CardContent className="p-0 h-full">
                  <MapView />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sensors" className="flex-1 m-0 p-4">
              <SensorPanel />
            </TabsContent>

            <TabsContent value="metrics" className="flex-1 m-0 p-4">
              <MetricsPanel />
            </TabsContent>

            <TabsContent value="alerts" className="flex-1 m-0 p-4">
              <AlertsPanel />
            </TabsContent>

            <TabsContent value="logs" className="flex-1 m-0 p-4">
              <Card className="h-full bg-[#141C27] border-white/10 flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-[#A7B1C1]">System Logs</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearLogs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-1">
                      {state.logs.map((log, index) => (
                        <div 
                          key={index} 
                          className="text-xs font-mono p-2 rounded hover:bg-white/5"
                        >
                          <span className="text-[#A7B1C1]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge 
                            className={`ml-2 ${
                              log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                              log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                              log.level === 'info' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="ml-2 text-[#2DB3C2]">[{log.source}]</span>
                          <span className="ml-2 text-white">{log.message}</span>
                        </div>
                      ))}
                      {state.logs.length === 0 && (
                        <p className="text-sm text-[#A7B1C1] text-center py-8">No logs yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatusIndicator({ 
  label, 
  active, 
  detail 
}: { 
  label: string; 
  active: boolean; 
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">{label}</span>
      </div>
      {detail && (
        <span className={`text-xs font-mono ${
          detail === 'SLIP' ? 'text-red-400' : 
          detail === 'OK' ? 'text-green-400' : 
          'text-[#A7B1C1]'
        }`}>
          {detail}
        </span>
      )}
    </div>
  );
}

function UncertaintyBar({ 
  label, 
  value, 
  max, 
  unit 
}: { 
  label: string; 
  value: number; 
  max: number;
  unit: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = percentage < 30 ? 'bg-green-500' : percentage < 70 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#A7B1C1]">{label}</span>
        <span className="font-mono">{value.toFixed(2)}{unit}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ContributionBar({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#A7B1C1]">{label}</span>
        <span className="font-mono">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-300"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatBox({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string;
  status: 'good' | 'warning' | 'error' | 'neutral';
}) {
  const colors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    neutral: 'text-[#A7B1C1]',
  };

  return (
    <div className="text-center">
      <div className="text-xs text-[#A7B1C1] mb-1">{label}</div>
      <div className={`text-xl font-semibold font-mono ${colors[status]}`}>{value}</div>
    </div>
  );
}
