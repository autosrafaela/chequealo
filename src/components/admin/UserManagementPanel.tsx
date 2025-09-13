import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, UserPlus, Shield, ShieldCheck, Trash2, Edit, Mail, Calendar, MapPin, Ban, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  created_at: string;
  last_sign_in_at: string;
  roles: string[];
  is_professional: boolean;
  professional_id?: string;
  phone?: string;
  location?: string;
  is_blocked?: boolean;
}

const UserManagementPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Eliminar directamente a Silvia
  const handleDeleteSilvia = async () => {
    try {
      setDeleteLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId: '74042bca-1ed0-4501-a7de-833d3f1a690b', // ID de Silvia
          adminEmail: user?.email
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Usuario Silvia eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting Silvia:', error);
      toast.error('Error al eliminar a Silvia: ' + (error.message || 'Error desconocido'));
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obtener perfiles (fuente principal de usuarios)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url, created_at');
      if (profilesError) throw profilesError;

      // Obtener roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      // Obtener profesionales (para email/phone/location si existe)
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('id, user_id, phone, location, email, created_at, is_blocked');
      if (profError) throw profError;

      const combinedUsers: UserProfile[] = (profiles || []).map((p: any) => {
        const roles = (userRoles || []).filter(r => r.user_id === p.user_id).map(r => r.role);
        const professional = (professionals || []).find(pr => pr.user_id === p.user_id);

        return {
          id: p.user_id,
          user_id: p.user_id,
          email: professional?.email || '',
          full_name: p.full_name || '',
          username: p.username || '',
          avatar_url: p.avatar_url || '',
          created_at: p.created_at,
          last_sign_in_at: '',
          roles,
          is_professional: !!professional,
          professional_id: professional?.id,
          phone: professional?.phone,
          location: professional?.location,
          is_blocked: p.is_blocked || professional?.is_blocked || false
        } as UserProfile;
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateProfile = async (userData: Partial<UserProfile>) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          username: userData.username
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.user_id,
          role: newRole
        });

      if (error) throw error;

      toast.success(`Rol ${newRole} agregado correctamente`);
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Error al agregar rol');
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;

      toast.success(`Rol ${role} removido correctamente`);
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Error al remover rol');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleteLoading(true);
      
      // Get current user for admin verification
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId: selectedUser.user_id,
          adminEmail: user?.email
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Usuario eliminado correctamente');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    try {
      const newBlockedState = !user.is_blocked;
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlockedState })
        .eq('user_id', user.user_id);

      if (profileError) throw profileError;

      // If user is professional, also update professional table
      if (user.is_professional && user.professional_id) {
        const { error: profError } = await supabase
          .from('professionals')
          .update({ is_blocked: newBlockedState })
          .eq('id', user.professional_id);

        if (profError) throw profError;
      }

      toast.success(`Usuario ${newBlockedState ? 'bloqueado' : 'desbloqueado'} correctamente`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user block:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfigs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: any }> = {
      admin: { variant: 'destructive', label: 'Admin', icon: Shield },
      moderator: { variant: 'secondary', label: 'Moderador', icon: ShieldCheck },
      user: { variant: 'outline', label: 'Usuario', icon: null }
    };
    
    const config = roleConfigs[role] || roleConfigs.user;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>
            Administra usuarios, roles y perfiles del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por email, nombre o username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteSilvia}
              disabled={deleteLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? 'Eliminando...' : 'Eliminar Silvia'}
            </Button>
          </div>

          {/* Users Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold text-primary">Total Usuarios</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700">Profesionales</h3>
              <p className="text-2xl font-bold">{users.filter(u => u.is_professional).length}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700">Admins</h3>
              <p className="text-2xl font-bold">{users.filter(u => u.roles.includes('admin')).length}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700">Moderadores</h3>
              <p className="text-2xl font-bold">{users.filter(u => u.roles.includes('moderator')).length}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {user.full_name.charAt(0) || user.email.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground">@{user.username || 'sin-username'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <div key={role} className="flex items-center gap-1">
                              {getRoleBadge(role)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveRole(user.user_id, role)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <Badge variant="outline">Sin roles</Badge>
                        )}
                      </div>
                    </TableCell>
                     <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.is_professional ? "default" : "secondary"}>
                          {user.is_professional ? 'Profesional' : 'Cliente'}
                        </Badge>
                        {user.is_blocked && (
                          <Badge variant="destructive" className="text-xs">
                            Bloqueado
                          </Badge>
                        )}
                        {user.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.is_blocked ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleBlock(user)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza la información del perfil del usuario
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre Completo</label>
                <Input
                  defaultValue={selectedUser.full_name}
                  onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  defaultValue={selectedUser.username}
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email (Solo lectura)</label>
                <Input value={selectedUser.email} disabled />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleUpdateProfile(selectedUser!)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Rol</DialogTitle>
            <DialogDescription>
              Asigna un nuevo rol al usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seleccionar Rol</label>
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRole}>
              Agregar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription>
              Esta acción es <strong>irreversible</strong>. Se eliminarán todos los datos del usuario incluyendo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Perfil y información personal</li>
                <li>Todas las reseñas y calificaciones</li>
                <li>Solicitudes de contacto</li>
                <li>Transacciones y pagos</li>
                <li>Favoritos y notificaciones</li>
                {selectedUser?.is_professional && (
                  <li>Perfil profesional y servicios</li>
                )}
              </ul>
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <p className="font-semibold">Usuario a eliminar:</p>
              <p className="text-sm">{selectedUser.full_name} ({selectedUser.email})</p>
              {selectedUser.is_professional && (
                <p className="text-sm text-orange-600">⚠️ Este es un usuario profesional</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPanel;