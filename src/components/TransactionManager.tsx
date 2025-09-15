import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRatingModal } from './UserRatingModal';
import { BidirectionalReviewSystem } from './BidirectionalReviewSystem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  X, 
  Plus,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  professional_id: string;
  contact_request_id?: string;
  service_type?: string;
  amount?: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  profiles?: any; // Simplified to avoid TypeScript issues
}

export const TransactionManager = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    userId: '',
    serviceType: '',
    amount: '',
    contactRequestId: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      if (!professional) {
        setTransactions([]);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (
    transactionId: string, 
    status: string
  ) => {
    try {
      const updateData: any = { status };
      
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      toast.success('Estado actualizado correctamente');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const createTransaction = async () => {
    if (!user || !newTransaction.userId || !newTransaction.serviceType) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // Get professional ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      if (!professional) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          professional_id: professional.id,
          user_id: newTransaction.userId,
          service_type: newTransaction.serviceType,
          amount: newTransaction.amount ? parseFloat(newTransaction.amount) : null,
          contact_request_id: newTransaction.contactRequestId || null
        });

      if (error) throw error;

      toast.success('Trabajo creado exitosamente');
      setShowCreateModal(false);
      setNewTransaction({ userId: '', serviceType: '', amount: '', contactRequestId: '' });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Error al crear el trabajo');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      in_progress: { label: 'En Progreso', variant: 'default' as const, icon: Play },
      completed: { label: 'Completado', variant: 'secondary' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: X }
    };
    
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando trabajos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestión de Trabajos</CardTitle>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Trabajo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Trabajo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">ID del Cliente *</Label>
                  <Input
                    id="userId"
                    placeholder="UUID del cliente"
                    value={newTransaction.userId}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Tipo de Servicio *</Label>
                  <Input
                    id="serviceType"
                    placeholder="Ej: Instalación de aire acondicionado"
                    value={newTransaction.serviceType}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, serviceType: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (opcional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTransaction}>
                    Crear Trabajo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestiona el ciclo de vida de los trabajos con tus clientes
        </p>
      </CardHeader>

      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No tienes trabajos registrados aún</p>
            <p className="text-sm">Crea un trabajo para comenzar a gestionar tus clientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{transaction.service_type}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {transaction.profiles?.full_name || 'Cliente desconocido'}
                    </div>
                    {transaction.amount && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-3 w-3" />
                        ${transaction.amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Creado: {new Date(transaction.created_at).toLocaleDateString()}
                    {transaction.completed_at && (
                      <span className="ml-4">
                        Completado: {new Date(transaction.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {transaction.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateTransactionStatus(transaction.id, 'in_progress')}
                      >
                        Iniciar
                      </Button>
                    )}
                    
                    {transaction.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                      >
                        Completar
                      </Button>
                    )}

                    {transaction.status === 'completed' && (
                      <div className="space-y-2">
                        <UserRatingModal
                          transactionId={transaction.id}
                          userId={transaction.user_id}
                          userName={transaction.profiles?.full_name || 'Cliente'}
                          onRatingSubmitted={fetchTransactions}
                        />
                      </div>
                    )}

                    {transaction.status !== 'cancelled' && transaction.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                  </div>
                  
                  {transaction.status === 'completed' && (
                    <div className="mt-4">
                      <BidirectionalReviewSystem
                        transactionId={transaction.id}
                        userId={transaction.user_id}
                        professionalId={transaction.professional_id}
                        userName={transaction.profiles?.full_name || 'Cliente'}
                        professionalName="Tu negocio"
                        serviceType={transaction.service_type || 'Servicio'}
                        onReviewsUpdated={fetchTransactions}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };