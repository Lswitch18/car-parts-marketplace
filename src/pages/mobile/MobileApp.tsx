import { useState } from 'react';
import MobileLayout from '../../components/mobile/MobileLayout';
import MobileDashboard from './MobileDashboard';
import MobileColetas from './MobileColetas';
import MobileEntregas from './MobileEntregas';
import MobileCD from './MobileCD';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <MobileDashboard />}
      {activeTab === 'coletas' && <MobileColetas />}
      {activeTab === 'entregas' && <MobileEntregas />}
      {activeTab === 'cd' && <MobileCD />}
    </MobileLayout>
  );
}
