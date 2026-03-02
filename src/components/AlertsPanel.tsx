// Alerts Panel Component - System Alerts and Notifications

import { useNavigation } from '@/store/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X,
  Bell,
  Filter
} from 'lucide-react';
import { useState } from 'react';

type AlertFilter = 'all' | 'unacknowledged' | 'warning' | 'error' | 'info';

export default function AlertsPanel() {
  const { state, acknowledgeAlert } = useNavigation();
  const [filter, setFilter] = useState<AlertFilter>('all');

  const filteredAlerts = state.alerts.filter(alert => {
    if (filter === 'unacknowledged') return !alert.acknowledged;
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  const unacknowledgedCount = state.alerts.filter(a => !a.acknowledged).length;
  const errorCount = state.alerts.filter(a => a.type === 'error').length;
  const warningCount = state.alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Total Alerts"
          count={state.alerts.length}
          icon={Bell}
          color="text-[#A7B1C1]"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <SummaryCard
          title="Unacknowledged"
          count={unacknowledgedCount}
          icon={AlertCircle}
          color="text-yellow-400"
          active={filter === 'unacknowledged'}
          onClick={() => setFilter('unacknowledged')}
        />
        <SummaryCard
          title="Warnings"
          count={warningCount}
          icon={AlertTriangle}
          color="text-orange-400"
          active={filter === 'warning'}
          onClick={() => setFilter('warning')}
        />
        <SummaryCard
          title="Errors"
          count={errorCount}
          icon={X}
          color="text-red-400"
          active={filter === 'error'}
          onClick={() => setFilter('error')}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#A7B1C1]" />
        <span className="text-sm text-[#A7B1C1]">Filter:</span>
        {(['all', 'unacknowledged', 'warning', 'error', 'info'] as AlertFilter[]).map((f) => (
          <Button
            key={f}
            variant="outline"
            size="sm"
            className={`text-xs ${filter === f ? 'bg-[#2DB3C2]/20 border-[#2DB3C2]/50' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <Card className="bg-[#141C27] border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Alert History</span>
            <Badge variant="outline" className="text-xs">
              {filteredAlerts.length} shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-[#A7B1C1]">No alerts to display</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getAlertColor(alert.type)} ${
                        alert.acknowledged ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{alert.source}</span>
                            <Badge className={`text-xs ${getAlertColor(alert.type)}`}>
                              {alert.type.toUpperCase()}
                            </Badge>
                            {alert.acknowledged && (
                              <Badge variant="outline" className="text-xs">
                                ACK
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm opacity-90">{alert.message}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ack
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox
          label="Avg Response Time"
          value="< 1s"
          description="System alert latency"
        />
        <StatBox
          label="Alert Rate"
          value={state.isRunning && state.alerts.length > 0
            ? `${(state.alerts.length / ((Date.now() - state.alerts[0]?.timestamp) / 60000)).toFixed(1)}/min`
            : '0/min'}
          description="Alerts per minute"
        />
        <StatBox
          label="Resolution Rate"
          value={`${state.alerts.length > 0 
            ? Math.round((state.alerts.filter(a => a.acknowledged).length / state.alerts.length) * 100)
            : 100}%`}
          description="Acknowledged alerts"
        />
      </div>
    </div>
  );
}

// Sub-components
interface SummaryCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  color: string;
  active: boolean;
  onClick: () => void;
}

function SummaryCard({ title, count, icon: Icon, color, active, onClick }: SummaryCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        active 
          ? 'border-[#2DB3C2] bg-[#2DB3C2]/10' 
          : 'border-white/10 bg-[#141C27] hover:border-white/20'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A7B1C1]">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
          </div>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="bg-[#141C27] border border-white/10 rounded-lg p-4">
      <p className="text-xs text-[#A7B1C1]">{label}</p>
      <p className="text-xl font-bold font-mono text-white">{value}</p>
      <p className="text-xs text-[#A7B1C1] mt-1">{description}</p>
    </div>
  );
}
