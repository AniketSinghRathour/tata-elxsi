// Scenario Selector Component

import { useState } from 'react';
import { useNavigation } from '@/store/NavigationContext';
import type { TestScenario, Position } from '@/types/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Trees, 
  Mountain, 
  MapPin,
  Play,
  Route,
  Clock,
  Signal
} from 'lucide-react';

interface ScenarioSelectorProps {
  onSelect: () => void;
}

// Pre-defined test scenarios
const scenarios: TestScenario[] = [
  {
    id: 'urban-canyon',
    name: 'Urban Canyon',
    description: 'Dense urban environment with tall buildings causing GNSS multipath and shadowing. Tests system performance during frequent signal outages.',
    environment: 'urban',
    gnssAvailability: 40,
    duration: 600,
    waypoints: generateUrbanWaypoints(),
  },
  {
    id: 'dense-canopy',
    name: 'Dense Canopy',
    description: 'Forestry environment with heavy tree cover. GNSS signals heavily attenuated. Tests visual odometry and LiDAR performance.',
    environment: 'forest',
    gnssAvailability: 25,
    duration: 900,
    waypoints: generateForestWaypoints(),
  },
  {
    id: 'mining-site',
    name: 'Mining Site',
    description: 'Open pit mining environment with high dust, magnetic interference, and dynamic obstacles. Tests robustness in harsh conditions.',
    environment: 'mining',
    gnssAvailability: 60,
    duration: 720,
    waypoints: generateMiningWaypoints(),
  },
  {
    id: 'open-field',
    name: 'Open Field',
    description: 'Clear open environment with excellent GNSS visibility. Baseline scenario for performance comparison.',
    environment: 'open',
    gnssAvailability: 95,
    duration: 480,
    waypoints: generateOpenWaypoints(),
  },
];

function generateUrbanWaypoints(): Position[] {
  // Downtown grid pattern
  const base = { lat: 40.7128, lng: -74.0060, altitude: 10 };
  return [
    { ...base },
    { lat: base.lat + 0.001, lng: base.lng, altitude: 10 },
    { lat: base.lat + 0.001, lng: base.lng + 0.001, altitude: 10 },
    { lat: base.lat, lng: base.lng + 0.001, altitude: 10 },
    { lat: base.lat - 0.0005, lng: base.lng + 0.0005, altitude: 10 },
    { ...base },
  ];
}

function generateForestWaypoints(): Position[] {
  // Winding forest path
  const base = { lat: 45.5231, lng: -122.6765, altitude: 150 };
  return [
    { ...base },
    { lat: base.lat + 0.002, lng: base.lng + 0.001, altitude: 155 },
    { lat: base.lat + 0.003, lng: base.lng + 0.003, altitude: 160 },
    { lat: base.lat + 0.002, lng: base.lng + 0.005, altitude: 158 },
    { lat: base.lat, lng: base.lng + 0.006, altitude: 155 },
    { lat: base.lat - 0.001, lng: base.lng + 0.004, altitude: 152 },
    { ...base },
  ];
}

function generateMiningWaypoints(): Position[] {
  // Mining pit circuit
  const base = { lat: 33.9249, lng: -118.2468, altitude: 50 };
  return [
    { ...base },
    { lat: base.lat + 0.001, lng: base.lng + 0.002, altitude: 45 },
    { lat: base.lat + 0.002, lng: base.lng + 0.001, altitude: 40 },
    { lat: base.lat + 0.002, lng: base.lng - 0.001, altitude: 42 },
    { lat: base.lat + 0.001, lng: base.lng - 0.002, altitude: 47 },
    { ...base },
  ];
}

function generateOpenWaypoints(): Position[] {
  // Large open loop
  const base = { lat: 39.7392, lng: -104.9903, altitude: 1609 };
  return [
    { ...base },
    { lat: base.lat + 0.003, lng: base.lng, altitude: 1609 },
    { lat: base.lat + 0.003, lng: base.lng + 0.003, altitude: 1609 },
    { lat: base.lat, lng: base.lng + 0.003, altitude: 1609 },
    { ...base },
  ];
}

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const { startNavigation } = useNavigation();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleStart = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      startNavigation(scenario);
      onSelect();
    }
  };

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'urban': return Building2;
      case 'forest': return Trees;
      case 'mining': return Mountain;
      default: return MapPin;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'urban': return 'text-blue-400 bg-blue-400/20';
      case 'forest': return 'text-green-400 bg-green-400/20';
      case 'mining': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-cyan-400 bg-cyan-400/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => {
          const Icon = getEnvironmentIcon(scenario.environment);
          const isSelected = selectedScenario === scenario.id;

          return (
            <Card
              key={scenario.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-[#2DB3C2] bg-[#2DB3C2]/10' 
                  : 'border-white/10 bg-[#141C27] hover:border-white/20'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEnvironmentColor(scenario.environment)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Signal className="w-3 h-3 mr-1" />
                          {scenario.gnssAvailability}% GNSS
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(scenario.duration / 60)}min
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#2DB3C2] flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#0B111A] rounded-full" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#A7B1C1]">{scenario.description}</p>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-[#A7B1C1]">
                  <Route className="w-4 h-4" />
                  <span>{scenario.waypoints.length} waypoints</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button variant="outline" onClick={onSelect}>
          Cancel
        </Button>
        <Button
          className="bg-[#2DB3C2] hover:bg-[#25a0ad] text-[#0B111A]"
          disabled={!selectedScenario}
          onClick={handleStart}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Navigation
        </Button>
      </div>
    </div>
  );
}
