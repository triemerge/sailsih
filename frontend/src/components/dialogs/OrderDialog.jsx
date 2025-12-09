import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OrderDialog({ open, onOpenChange, order, onSubmit }) {
  const [form, setForm] = useState({
    id: '',
    customer: '',
    product: '',
    quantity: '',
    priority: 2,
    deadline: '',
    mode: 'rail',
    dest_code: '',
  });

  useEffect(() => {
    if (order) {
      setForm({
        id: order.id || '',
        customer: order.customer,
        product: order.product,
        quantity: order.quantity,
        priority: order.priority,
        deadline: order.deadline || '',
        mode: order.mode || 'rail',
        dest_code: order.dest_code,
      });
    } else {
      setForm({ id: '', customer: '', product: '', quantity: '', priority: 2, deadline: '', mode: 'rail', dest_code: '' });
    }
  }, [order, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      customer: form.customer,
      product: form.product,
      quantity: parseFloat(form.quantity),
      priority: parseInt(form.priority),
      deadline: form.deadline || null,
      mode: form.mode,
      dest_code: form.dest_code,
    };
    if (form.id) data.id = form.id;
    onSubmit(data);
    onOpenChange(false);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{order ? 'Edit' : 'Add'} Order</DialogTitle>
          <DialogDescription>{order ? 'Update order details.' : 'Add a new customer order.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID Field (optional — auto-generated if blank) */}
          {!order && (
            <div>
              <label className="text-sm font-medium">ID (optional)</label>
              <Input
                value={form.id}
                onChange={handleChange('id')}
                placeholder="Auto-generated if left blank"
              />
            </div>
          )}

          {/* Customer Field */}
          <div>
            <label className="text-sm font-medium">Customer</label>
            <Input
              value={form.customer}
              onChange={handleChange('customer')}
              placeholder="e.g., Tata Motors, Maruti Suzuki"
              required
            />
          </div>

          {/* Product Field */}
          <div>
            <label className="text-sm font-medium">Product</label>
            <Input
              value={form.product}
              onChange={handleChange('product')}
              placeholder="e.g., HR Coil, CR Sheet"
              required
            />
          </div>

          {/* Quantity Field */}
          <div>
            <label className="text-sm font-medium">Quantity (MT)</label>
            <Input
              type="number"
              value={form.quantity}
              onChange={handleChange('quantity')}
              placeholder="e.g., 2500"
              required
            />
          </div>

          {/* Priority Field */}
          <div>
            <label className="text-sm font-medium">Priority (1 = High, 3 = Low)</label>
            <Input
              type="number"
              min="1"
              max="3"
              value={form.priority}
              onChange={handleChange('priority')}
              required
            />
          </div>

          {/* Deadline Field */}
          <div>
            <label className="text-sm font-medium">Deadline</label>
            <Input
              type="date"
              value={form.deadline}
              onChange={handleChange('deadline')}
            />
          </div>

          {/* Mode Field */}
          <div>
            <label className="text-sm font-medium">Dispatch Mode</label>
            <select
              value={form.mode}
              onChange={handleChange('mode')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="rail">Rail</option>
              <option value="road">Road</option>
            </select>
          </div>

          {/* Destination Code Field */}
          <div>
            <label className="text-sm font-medium">Destination Code</label>
            <Input
              value={form.dest_code}
              onChange={handleChange('dest_code')}
              placeholder="e.g., MUM, DEL, CHE"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

