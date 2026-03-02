// Map View Component for Vehicle Tracking

import { useRef, useEffect, useState } from 'react';
import { useNavigation } from '@/store/NavigationContext';
import { 
  Maximize2, 
  Minimize2,
  Layers,
  Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  compact?: boolean;
}

export default function MapView({ compact = false }: MapViewProps) {
  const { state } = useNavigation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [followVehicle, setFollowVehicle] = useState(true);

  // Track history
  const [trackHistory, setTrackHistory] = useState<{ x: number; y: number }[]>([]);

  // Update track history when pose changes
  useEffect(() => {
    if (state.currentPose) {
      const { lat, lng } = state.currentPose.pose.position;
      const pos = latLngToXY(lat, lng);
      setTrackHistory(prev => [...prev.slice(-500), pos]);
    }
  }, [state.currentPose]);

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = '#0B111A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale (meters to pixels)
    const scale = 2 * zoom; // 2 pixels per meter at zoom 1

    // Get vehicle position
    let vehicleX = centerX;
    let vehicleY = centerY;

    if (state.currentPose) {
      const { lat, lng } = state.currentPose.pose.position;
      const pos = latLngToXY(lat, lng);
      
      if (followVehicle) {
        vehicleX = centerX;
        vehicleY = centerY;
      } else {
        vehicleX = centerX + offset.x + pos.x * scale;
        vehicleY = centerY + offset.y + pos.y * scale;
      }
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(45, 179, 194, 0.15)';
      ctx.lineWidth = 1;
      
      const gridSize = 50 * zoom;
      const gridOffsetX = (vehicleX % gridSize);
      const gridOffsetY = (vehicleY % gridSize);

      for (let x = gridOffsetX - gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = gridOffsetY - gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw waypoints if available
    if (state.currentScenario?.waypoints) {
      ctx.fillStyle = 'rgba(45, 179, 194, 0.3)';
      ctx.strokeStyle = '#2DB3C2';
      ctx.lineWidth = 2;
      
      state.currentScenario.waypoints.forEach((wp, index) => {
        const pos = latLngToXY(wp.lat, wp.lng);
        const x = centerX + (pos.x - (followVehicle && state.currentPose ? 
          latLngToXY(state.currentPose.pose.position.lat, state.currentPose.pose.position.lng).x : 0)) * scale;
        const y = centerY + (pos.y - (followVehicle && state.currentPose ? 
          latLngToXY(state.currentPose.pose.position.lat, state.currentPose.pose.position.lng).y : 0)) * scale;
        
        // Draw waypoint
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#A7B1C1';
        ctx.font = '10px IBM Plex Mono';
        ctx.fillText(`WP${index + 1}`, x + 10, y - 10);
        ctx.fillStyle = 'rgba(45, 179, 194, 0.3)';
      });
    }

    // Draw track history
    if (trackHistory.length > 1) {
      ctx.strokeStyle = 'rgba(45, 179, 194, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      trackHistory.forEach((point, index) => {
        const x = centerX + (point.x - (followVehicle && state.currentPose ? 
          latLngToXY(state.currentPose.pose.position.lat, state.currentPose.pose.position.lng).x : 0)) * scale;
        const y = centerY + (point.y - (followVehicle && state.currentPose ? 
          latLngToXY(state.currentPose.pose.position.lat, state.currentPose.pose.position.lng).y : 0)) * scale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw vehicle
    if (state.currentPose) {
      const heading = state.currentPose.pose.heading * (Math.PI / 180);
      
      // Vehicle body (triangle)
      ctx.fillStyle = '#2DB3C2';
      ctx.strokeStyle = '#2DB3C2';
      ctx.lineWidth = 2;
      
      const size = 12;
      ctx.beginPath();
      ctx.moveTo(
        vehicleX + Math.cos(heading) * size,
        vehicleY + Math.sin(heading) * size
      );
      ctx.lineTo(
        vehicleX + Math.cos(heading + 2.5) * size * 0.7,
        vehicleY + Math.sin(heading + 2.5) * size * 0.7
      );
      ctx.lineTo(
        vehicleX + Math.cos(heading - 2.5) * size * 0.7,
        vehicleY + Math.sin(heading - 2.5) * size * 0.7
      );
      ctx.closePath();
      ctx.fill();
      
      // Uncertainty ellipse
      const uncertainty = Math.sqrt(
        state.currentPose.covariance.position[0] + 
        state.currentPose.covariance.position[4]
      );
      const ellipseRadius = Math.min(uncertainty * scale * 2, 100);
      
      ctx.strokeStyle = uncertainty < 1 ? 'rgba(0, 255, 0, 0.5)' :
                       uncertainty < 5 ? 'rgba(255, 255, 0, 0.5)' :
                       'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(vehicleX, vehicleY, ellipseRadius, ellipseRadius * 0.6, heading, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw scale bar
    ctx.fillStyle = '#A7B1C1';
    ctx.font = '10px IBM Plex Mono';
    const barLength = 50 / scale * scale; // 50 meters
    ctx.fillRect(20, canvas.height - 30, barLength, 2);
    ctx.fillText('50m', 20 + barLength + 5, canvas.height - 25);

    // Draw coordinates
    if (state.currentPose) {
      const { lat, lng } = state.currentPose.pose.position;
      ctx.fillStyle = '#A7B1C1';
      ctx.font = '10px IBM Plex Mono';
      ctx.fillText(`${lat.toFixed(6)}°, ${lng.toFixed(6)}°`, 20, canvas.height - 45);
    }

  }, [state.currentPose, state.currentScenario, trackHistory, zoom, offset, showGrid, followVehicle]);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    setFollowVehicle(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.1, Math.min(10, z * delta)));
  };

  // Coordinate conversion helpers
  function latLngToXY(lat: number, lng: number): { x: number; y: number } {
    const R = 6371000;
    const x = R * lng * (Math.PI / 180) * Math.cos(lat * (Math.PI / 180));
    const y = R * lat * (Math.PI / 180);
    return { x: x / 1000, y: y / 1000 }; // Scale down for display
  }

  if (compact) {
    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ background: '#0B111A' }}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background: '#0B111A' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="bg-[#141C27] border border-white/10 hover:bg-white/10"
          onClick={() => setZoom(z => Math.min(10, z * 1.2))}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-[#141C27] border border-white/10 hover:bg-white/10"
          onClick={() => setZoom(z => Math.max(0.1, z * 0.8))}
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className={`border ${showGrid ? 'bg-[#2DB3C2]/20 border-[#2DB3C2]/50' : 'bg-[#141C27] border-white/10'}`}
          onClick={() => setShowGrid(!showGrid)}
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className={`border ${followVehicle ? 'bg-[#2DB3C2]/20 border-[#2DB3C2]/50' : 'bg-[#141C27] border-white/10'}`}
          onClick={() => setFollowVehicle(!followVehicle)}
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom Level */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#141C27] border border-white/10 rounded-md">
        <span className="text-xs text-[#A7B1C1] font-mono">Zoom: {zoom.toFixed(1)}x</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 px-3 py-2 bg-[#141C27] border border-white/10 rounded-md">
        <div className="text-xs text-[#A7B1C1] space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#2DB3C2]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <span>Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2DB3C2]/30 border border-[#2DB3C2]" />
            <span>Waypoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#2DB3C2]/50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2DB3C2 0, #2DB3C2 3px, transparent 3px, transparent 6px)' }} />
            <span>Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}
