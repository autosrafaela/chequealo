import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Receipt } from 'lucide-react';

interface CreateQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (quote: {
    title: string;
    description: string;
    amount: number;
  }) => void;
  isLoading?: boolean;
}

export const CreateQuoteModal = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}: CreateQuoteModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount)
    });

    // Reset form
    setTitle('');
    setDescription('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Enviar Presupuesto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del servicio *</Label>
            <Input
              id="title"
              placeholder="Ej: Cambio de Sifón + Mano de Obra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles del trabajo a realizar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto ($ARS) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !amount}
              className="flex-1"
            >
              Enviar Presupuesto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
