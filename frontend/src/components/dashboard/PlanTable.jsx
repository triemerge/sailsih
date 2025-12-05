import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Train, Clock, TrendingUp, Search } from 'lucide-react';

const TOTAL_WAGONS_PER_RAKE = 43;
const MAX_LOAD_PER_WAGON = 64;

const STATUS_COLORS = {
  'Automated': 'bg-green-500 text-white',
  'Optimized': 'bg-green-500 text-white',
  'Pending': 'bg-yellow-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  default: 'bg-gray-500 text-white',
};

export function PlanTable({ plans = [] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const query = searchQuery.toLowerCase();
    return plans.filter(plan => 
      plan.rakeId?.toLowerCase().includes(query) ||
      plan.destCode?.toLowerCase().includes(query) ||
      plan.material?.toLowerCase().includes(query) ||
      plan.orderIds?.some(orderId => orderId.toLowerCase().includes(query)) ||
      plan.source?.toLowerCase().includes(query)
    );
  }, [plans, searchQuery]);

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  const selectedPlan = useMemo(() => {
    if (selectedPlanIndex === null) return null;
    return filteredPlans[selectedPlanIndex] || null;
  }, [filteredPlans, selectedPlanIndex]);

  const getRakeSequence = (plan, fallbackIndex) => {
    if (!plan) return fallbackIndex + 1;
    const match = plan.rakeId?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) || fallbackIndex + 1 : fallbackIndex + 1;
  };

  const getDisplayRakeId = (plan, index) => {
    return plan.rakeId || `Rake-${index + 1}`;
  };

  const openPlanDialog = (index) => {
    setSelectedPlanIndex(index);
    setDialogOpen(true);
  };

  const normalizeWagons = (plan) => {
    if (!plan) return new Array(TOTAL_WAGONS_PER_RAKE).fill({ orderId: '', product: '', load: 0 });
    const wagons = plan.wagons || [];
    const padded = [...wagons];
    while (padded.length < TOTAL_WAGONS_PER_RAKE) {
      padded.push({ orderId: '', product: '', load: 0 });
    }
    return padded.slice(0, TOTAL_WAGONS_PER_RAKE);
  };

  const selectedWagons = useMemo(() => normalizeWagons(selectedPlan), [selectedPlan]);
  const selectedRakeSeq = useMemo(() => getRakeSequence(selectedPlan, selectedPlanIndex ?? 0), [selectedPlan, selectedPlanIndex]);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Train className="h-5 w-5 text-primary" />
          Rake Formations
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search rakes, orders, destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[280px] h-9"
          />
        </div>
      </div>

      {filteredPlans.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          No rake formations found matching "{searchQuery}"
        </div>
      )}

      {/* Table View */}
      {filteredPlans.length > 0 && (
        <div className="animate-slide-up">
          
          {/* Mobile */}
          <div className="block sm:hidden space-y-4">
            {filteredPlans.map((plan, index) => {
              const displayRakeId = getDisplayRakeId(plan, index);
              return (
                <div 
                  key={index} 
                  className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openPlanDialog(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Train className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary text-sm">{displayRakeId}</span>
                    </div>
                    <Badge className="text-xs">{plan.destCode}</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orders:</span>
                      <span className="font-medium">{plan.orderIds?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium">{plan.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{plan.totalQuantity} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wagons:</span>
                      <span className="font-medium">{plan.wagonsUsed}/{plan.totalWagons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Utilization:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(plan.utilization, 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs">{plan.utilization}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block rounded-lg border overflow-hidden max-w-full">
            <div className="overflow-x-auto max-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[100px]">Rake ID</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Order IDs</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Source</TableHead>
                    <TableHead className="font-semibold min-w-[80px]">Dest Code</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Material</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Quantity</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Wagons</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Utilization</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan, index) => {
                    const displayRakeId = getDisplayRakeId(plan, index);
                    return (
                      <TableRow 
                        key={index} 
                        className="hover:bg-muted/50 transition-colors cursor-pointer" 
                        onClick={() => openPlanDialog(index)}
                      >
                        <TableCell className="font-medium text-primary text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Train className="h-4 w-4" />
                            {displayRakeId}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{plan.orderIds?.join(', ')}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{plan.source}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{plan.destCode}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{plan.material}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{plan.totalQuantity} tons</TableCell>
                        <TableCell className="text-xs sm:text-sm">{plan.wagonsUsed}/{plan.totalWagons}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-secondary rounded-full h-2 min-w-[60px]">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${Math.min(plan.utilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10">{plan.utilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(plan.status)} text-xs`}>
                            {plan.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No automation results yet. Run automation to generate rake formation plans.</p>
        </div>
      )}

      {plans.length > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-green-600">Automation Summary</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Generated {plans.length} rake formations with average utilization of{' '}
            {plans.length > 0 ? (plans.reduce((sum, plan) => sum + plan.utilization, 0) / plans.length).toFixed(1) : 0}%.
            Total quantity loaded: {plans.reduce((sum, plan) => sum + plan.totalQuantity, 0)} tons.
            Total wagons used: {plans.reduce((sum, plan) => sum + plan.wagonsUsed, 0)}.
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[80vh] overflow-hidden p-0">
          
          {/* Dialog Header */}
          <div className="px-6 pt-6 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Train className="h-5 w-5 text-primary" />
                {selectedPlan ? getDisplayRakeId(selectedPlan, selectedPlanIndex ?? 0) : 'Rake Detail'}
              </DialogTitle>
              {selectedPlan && (
                <DialogDescription asChild>
                  <span className="text-xs sm:text-sm flex flex-wrap gap-3 text-muted-foreground">
                    <span><span className="font-semibold text-foreground">Orders:</span> {selectedPlan.orderIds?.join(', ')}</span>
                    <span><span className="font-semibold text-foreground">Product:</span> {selectedPlan.material}</span>
                    <span><span className="font-semibold text-foreground">Dest:</span> {selectedPlan.destCode}</span>
                    <span><span className="font-semibold text-foreground">Total Qty:</span> {selectedPlan.totalQuantity} tons</span>
                  </span>
                </DialogDescription>
              )}
            </DialogHeader>
          </div>

          {/* Wagon Grid - Shows all 43 wagons */}
          {selectedPlan && (
            <div className="px-6 pb-6 space-y-3 overflow-y-auto max-h-[64vh]">
              
              {/* Wagon Stats */}
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <Badge variant="outline" className="text-[11px]">43 Wagons</Badge>
                <span>Max per wagon: 64 tons</span>
                <span>Wagons loaded: {selectedPlan.wagonsUsed}/{selectedPlan.totalWagons}</span>
              </div>
              
              {/* Wagon Cards Grid */}
              <div className="w-full pb-3">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 min-h-[260px] pr-2">
                  {selectedWagons.map((wagon, wagonIndex) => {
                    const wagonLabel = `WR${selectedRakeSeq}-${String(wagonIndex + 1).padStart(2, '0')}`;
                    const isLoaded = wagon.load > 0;
                    return (
                      <div
                        key={wagonLabel}
                        className="w-full rounded-lg border border-border shadow-sm overflow-hidden"
                      >
                        {/* Wagon Header */}
                        <div className={`px-3 py-2 ${isLoaded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold">WT</span>
                            <span className="text-[10px] font-semibold">{isLoaded ? wagon.wagonType : '—'}</span>
                          </div>
                          <div className="text-[11px] font-semibold">{wagonLabel}</div>
                          <div className="text-[10px] opacity-90">{wagon.load}t / 64t</div>
                        </div>

                        {/* Wagon Route */}
                        <div className={`px-3 py-2 ${isLoaded ? 'bg-primary/10 border-t border-primary/20' : 'bg-muted/50 border-t border-border'}`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-foreground">{isLoaded ? wagon.source : '—'}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold text-foreground text-right">{isLoaded ? wagon.customerName : '—'}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground text-center mt-0.5">
                            {isLoaded ? `(${wagon.destCode})` : ''}
                          </div>
                        </div>

                        {/* Wagon Details */}
                        <div className="px-3 py-2 bg-white border-t border-border">
                          <div className="text-[11px] text-muted-foreground mb-1">
                            Ord: <span className="text-foreground font-semibold">{isLoaded ? wagon.orderId : '—'}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mb-1">
                            Prod: <span className="text-foreground font-semibold">{isLoaded ? wagon.product : '—'}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-foreground font-semibold">
                              {isLoaded && wagon.deadline 
                                ? new Date(wagon.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlanTable;
