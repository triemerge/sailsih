import { Train } from 'lucide-react';
import AutomationDashboard from '@/components/dashboard/AutomationDashboard';

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Train className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SAILSIH</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <AutomationDashboard />
      </main>
    </div>
  );
}

export default Index;
