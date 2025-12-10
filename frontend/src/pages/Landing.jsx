import { Link } from 'react-router-dom';
import {
  Train,
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Zap,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="border rounded-lg p-6 bg-card hover:shadow-sm transition-shadow">
      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Train className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">SAILSIH</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#overview" className="hover:text-foreground transition-colors">Overview</a>
          </nav>
          <Link to="/dashboard">
            <Button size="sm">Open Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
              Optimize steel logistics with intelligent rake planning
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
              SAILSIH automates rake formation for steel industry dispatch operations.
              Reduce idle time, maximize wagon utilization, and streamline stockyard-to-rail logistics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-8">
            <StatBlock value="43" label="Max wagons per rake" />
            <StatBlock value="64T" label="Max wagon capacity" />
            <StatBlock value="< 2s" label="Plan generation time" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Built for steel dispatch operations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Purpose-built tooling for managing stockyards, orders, and automated rake formation
              in integrated steel plant environments.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Boxes}
              title="Stockyard Management"
              description="Track available material across stockyards with real-time capacity and product mapping."
            />
            <FeatureCard
              icon={ClipboardList}
              title="Order Tracking"
              description="Manage dispatch orders with destination, product type, and weight specifications."
            />
            <FeatureCard
              icon={Zap}
              title="Automated Rake Formation"
              description="Generate optimal rake plans that maximize wagon utilization under railway constraints."
            />
            <FeatureCard
              icon={BarChart3}
              title="Utilization Analytics"
              description="Monitor wagon fill rates and identify optimization opportunities in dispatch planning."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Constraint Compliance"
              description="Automatic enforcement of wagon weight limits and rake composition rules."
            />
            <FeatureCard
              icon={Clock}
              title="Dispatch Scheduling"
              description="Sequence rake departures to align with railway slot availability and priority orders."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Three steps from stockyard inventory to an optimized dispatch plan.
            </p>
          </div>
          <div className="max-w-xl space-y-8">
            <StepCard
              number={1}
              title="Configure stockyards and inventory"
              description="Define your stockyard layout, available products, and current tonnage levels."
            />
            <StepCard
              number={2}
              title="Add dispatch orders"
              description="Enter pending orders with destination, material grade, and required quantities."
            />
            <StepCard
              number={3}
              title="Generate rake plan"
              description="Run the optimizer to produce a feasible rake formation that maximizes utilization within railway constraints."
            />
          </div>
        </div>
      </section>

      {/* Overview / CTA */}
      <section id="overview">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="border rounded-lg p-8 md:p-12 bg-card">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Steel Authority Integrated Logistics System
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                SAILSIH is designed for Indian steel plants that dispatch finished and semi-finished
                products via Indian Railways rake operations. The system handles the combinatorial
                complexity of assigning orders to wagons under weight, product-compatibility, and
                destination-grouping constraints.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Built as part of SAIL's ongoing efforts to digitize plant logistics and reduce
                rake turnaround times at dispatch sidings.
              </p>
              <Link to="/dashboard">
                <Button className="gap-2">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Train className="h-4 w-4" />
            <span>SAILSIH | Steel Authority Integrated Logistics System for Indian Hub</span>
          </div>
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SAIL. Internal use only.
          </div>
        </div>
      </footer>
    </div>
  );
}
