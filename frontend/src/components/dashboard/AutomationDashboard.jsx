import { useState } from 'react';
import { Plus, Play, RefreshCw, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MatrixTable from './MatrixTable';
import PlanTable from './PlanTable';
import StockyardDialog from '@/components/dialogs/StockyardDialog';
import OrderDialog from '@/components/dialogs/OrderDialog';
import {
  useAutomationData,
  useCreateStockyard,
  useUpdateStockyard,
  useDeleteStockyard,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useRunAutomation,
} from '@/hooks/useAutomationData';
import { formatIndianNumber } from '@/lib/indian-formatter';

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('stockyards');
  const [plans, setPlans] = useState([]);
  const [utilization, setUtilization] = useState(0);

  const [stockyardDialog, setStockyardDialog] = useState({ open: false, data: null });
  const [orderDialog, setOrderDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null });

  const { stockyards, orders, isLoading, refetch } = useAutomationData();

  const createStockyard = useCreateStockyard();
  const updateStockyard = useUpdateStockyard();
  const deleteStockyard = useDeleteStockyard();

  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const runAutomation = useRunAutomation();

  const handleStockyardSubmit = async (data) => {
    try {
      if (data.id) {
        await updateStockyard.mutateAsync(data);
        toast.success('Stockyard updated');
      } else {
        await createStockyard.mutateAsync(data);
        toast.success('Stockyard created');
      }
    } catch {
      toast.error('Failed to save stockyard');
    }
  };

  const handleOrderSubmit = async (data) => {
    try {
      if (data.id) {
        await updateOrder.mutateAsync(data);
        toast.success('Order updated');
      } else {
        await createOrder.mutateAsync(data);
        toast.success('Order created');
      }
    } catch {
      toast.error('Failed to save order');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'stockyard') {
        await deleteStockyard.mutateAsync(deleteDialog.id);
        toast.success('Stockyard deleted');
      } else {
        await deleteOrder.mutateAsync(deleteDialog.id);
        toast.success('Order deleted');
      }
      setDeleteDialog({ open: false, type: null, id: null });
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleRunAutomation = async () => {
    try {
      const result = await runAutomation.mutateAsync({
        constraints: {
          maxWagonsPerRake: 43,
          maxWagonWeight: 64,
        },
      });
      setPlans(result.plan);
      setUtilization(result.utilization);
      setActiveTab('plans');
      toast.success(`Generated ${result.plan.length} rake plans with ${result.utilization}% utilization`);
    } catch {
      toast.error('Failed to run automation');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div>
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-md" />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="p-4 border-b">
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, row) => (
              <div key={row} className="p-4 border-b last:border-0">
                <div className="flex gap-4">
                  {Array.from({ length: 5 }).map((_, col) => (
                    <Skeleton
                      key={col}
                      className="h-4 flex-1"
                      style={{ opacity: 1 - row * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Automation Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleRunAutomation}>
            <Play className="h-4 w-4 mr-2" />
            Run Automation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Stockyards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockyards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilization}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stockyards">Stockyards</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="plans">Rake Plans</TabsTrigger>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
        </TabsList>

        {/* Stockyards Tab */}
        <TabsContent value="stockyards">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setStockyardDialog({ open: true, data: null })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stockyard
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockyards.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>{s.material}</TableCell>
                    <TableCell className="text-right">{formatIndianNumber(s.quantity)} MT</TableCell>
                    <TableCell>{s.location}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStockyardDialog({ open: true, data: s })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, type: 'stockyard', id: s.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setOrderDialog({ open: true, data: null })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Dest</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>{o.product}</TableCell>
                    <TableCell className="text-right">{formatIndianNumber(o.quantity)}</TableCell>
                    <TableCell>
                      <Badge variant={o.priority === 1 ? 'destructive' : 'secondary'}>
                        P{o.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.deadline ? new Date(o.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={o.mode === 'rail' ? 'default' : 'outline'}>
                        {o.mode}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.dest_code}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOrderDialog({ open: true, data: o })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, type: 'order', id: o.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <PlanTable plans={plans} />
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix">
          <MatrixTable stockyards={stockyards} />
        </TabsContent>
      </Tabs>

      <StockyardDialog
        open={stockyardDialog.open}
        onOpenChange={(open) => setStockyardDialog({ ...stockyardDialog, open })}
        stockyard={stockyardDialog.data}
        onSubmit={handleStockyardSubmit}
      />

      <OrderDialog
        open={orderDialog.open}
        onOpenChange={(open) => setOrderDialog({ ...orderDialog, open })}
        order={orderDialog.data}
        onSubmit={handleOrderSubmit}
      />

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, type: null, id: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

