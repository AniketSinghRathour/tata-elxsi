// TerraNav Off-Highway Localization System
// Main Application Entry Point

import { NavigationProvider } from '@/store/NavigationContext';
import Dashboard from '@/components/Dashboard';
import './App.css';

function App() {
  return (
    <NavigationProvider>
      <Dashboard />
    </NavigationProvider>
  );
}

export default App;
