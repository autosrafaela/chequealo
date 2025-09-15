import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRatingModal } from './UserRatingModal';
import { BidirectionalReviewSystem } from './BidirectionalReviewSystem';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  X, 
  Plus,
  DollarSign,
  Calendar,
  User,
  Search,
  Filter,
  FileText
} from 'lucide-react';

export const EnhancedTransactionManager = () => {
  const { transactions, loading, updateTransactionStatus, createTransaction } = useTransactions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    userId: '',
    serviceType: '',
    amount: '',
    contactRequestId: '',
    description: ''
  });

  const handleCreateTransaction = async () => {
    if (!newTransaction.userId || !newTransaction.serviceType) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const success = await createTransaction(newTransaction);
    if (success) {
      setShowCreateModal(false);
      setNewTransaction({ userId: '', serviceType: '', amount: '', contactRequestId: '', description: '' });
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true;
      return transaction.status === filter;
    })
    .filter(transaction => {
      if (!searchTerm) return true;
      return (
        transaction.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestión de Trabajos
            </CardTitle>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Trabajo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Trabajo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="amount">Monto (ARS)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
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
                    <Label htmlFor="description">Descripción del Trabajo</Label>
                    <Textarea
                      id="description"
                      placeholder="Detalles adicionales del trabajo..."
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactRequestId">ID de Solicitud (opcional)</Label>
                    <Input
                      id="contactRequestId"
                      placeholder="UUID de la solicitud de contacto"
                      value={newTransaction.contactRequestId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, contactRequestId: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTransaction}>
                      Crear Trabajo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por servicio o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {transactions.length === 0 ? 'No tienes trabajos registrados aún' : 'No se encontraron resultados'}
              </p>
              <p className="text-sm">
                {transactions.length === 0 
                  ? 'Crea un trabajo para comenzar a gestionar tus clientes' 
                  : 'Intenta cambiar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <Tabs defaultValue="grid" className="space-y-4">
              <TabsList>
                <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
                <TabsTrigger value="list">Vista de Lista</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid">
                <div className="grid gap-4">
                  {filteredTransactions.map((transaction) => (
                    <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">{transaction.service_type}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              {transaction.profiles?.full_name || 'Cliente desconocido'}
                            </div>
                            {transaction.amount && (
                              <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                                <DollarSign className="h-5 w-5" />
                                {formatCurrency(transaction.amount)}
                              </div>
                            )}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Creado: {new Date(transaction.created_at).toLocaleDateString('es-AR')}
                            </div>
                            {transaction.completed_at && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                Completado: {new Date(transaction.completed_at).toLocaleDateString('es-AR')}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {transaction.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateTransactionStatus(transaction.id, 'in_progress')}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Iniciar
                              </Button>
                            )}
                            
                            {transaction.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completar
                              </Button>
                            )}

                            {transaction.status === 'completed' && (
                              <div className="space-y-2">
                                <UserRatingModal
                                  transactionId={transaction.id}
                                  userId={transaction.user_id}
                                  userName={transaction.profiles?.full_name || 'Cliente'}
                                  onRatingSubmitted={() => {}}
                                />
                              </div>
                            )}

                            {transaction.status !== 'cancelled' && transaction.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                              >
                                <X className="h-3 w-3 mr-1" />
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
                              onReviewsUpdated={() => {}}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="list">
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{transaction.service_type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.profiles?.full_name}</p>
                        </div>
                        <div>
                          {transaction.amount ? (
                            <p className="font-semibold text-green-600">{formatCurrency(transaction.amount)}</p>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                        <div>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {transaction.status === 'pending' && (
                          <Button size="sm" onClick={() => updateTransactionStatus(transaction.id, 'in_progress')}>
                            Iniciar
                          </Button>
                        )}
                        {transaction.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateTransactionStatus(transaction.id, 'completed')}>
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};