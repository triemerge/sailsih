import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StockyardDialog({ open, onOpenChange, stockyard, onSubmit }) {
  const [form, setForm] = useState({
    id: '',
    material: '',
    quantity: '',
    location: '',
  });

  useEffect(() => {
    if (stockyard) {
      setForm({
        id: stockyard.id || '',
        material: stockyard.material,
        quantity: stockyard.quantity,
        location: stockyard.location,
      });
    } else {
      setForm({ id: '', material: '', quantity: '', location: '' });
    }
  }, [stockyard, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      material: form.material,
      quantity: parseFloat(form.quantity),
      location: form.location,
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
          <DialogTitle>{stockyard ? 'Edit' : 'Add'} Stockyard</DialogTitle>
          <DialogDescription>{stockyard ? 'Update stockyard details.' : 'Add a new stockyard record.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID Field (optional — auto-generated if blank) */}
          {!stockyard && (
            <div>
              <label className="text-sm font-medium">ID (optional)</label>
              <Input
                value={form.id}
                onChange={handleChange('id')}
                placeholder="Auto-generated if left blank"
              />
            </div>
          )}

          {/* Material Field */}
          <div>
            <label className="text-sm font-medium">Material</label>
            <Input
              value={form.material}
              onChange={handleChange('material')}
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
              placeholder="e.g., 5000"
              required
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={form.location}
              onChange={handleChange('location')}
              placeholder="e.g., Yard A, Section 1"
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

