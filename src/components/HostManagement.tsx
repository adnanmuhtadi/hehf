import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Star, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Host {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  rating: number;
  rating_count: number;
  is_active: boolean;
  handbook_downloaded: boolean;
  created_at: string;
  updated_at: string;
}

const HostManagement = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchHosts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'host')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHosts(data || []);
    } catch (error) {
      console.error('Error fetching hosts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hosts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleCreateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'TempPassword123!', // Temporary password - host should change it
        options: {
          data: {
            full_name: formData.full_name,
            role: 'host',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone || null,
            address: formData.address || null,
            is_active: formData.is_active,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "Host created successfully. They will receive an email to confirm their account.",
        });

        setIsDialogOpen(false);
        setFormData({ email: '', full_name: '', phone: '', address: '', is_active: true });
        fetchHosts();
      }
    } catch (error: any) {
      console.error('Error creating host:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create host",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHost) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          is_active: formData.is_active,
        })
        .eq('id', selectedHost.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Host updated successfully",
      });

      setIsDialogOpen(false);
      setSelectedHost(null);
      fetchHosts();
    } catch (error: any) {
      console.error('Error updating host:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update host",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', hostId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Host deleted successfully",
      });

      fetchHosts();
    } catch (error: any) {
      console.error('Error deleting host:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete host",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedHost(null);
    setFormData({ email: '', full_name: '', phone: '', address: '', is_active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (host: Host) => {
    setSelectedHost(host);
    setFormData({
      email: host.email,
      full_name: host.full_name,
      phone: host.phone || '',
      address: host.address || '',
      is_active: host.is_active,
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading hosts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Host Management</h2>
          <p className="text-muted-foreground">Manage all hosts in the system</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Host
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedHost ? 'Edit Host' : 'Create New Host'}</DialogTitle>
              <DialogDescription>
                {selectedHost ? 'Update host information' : 'Add a new host to the system'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={selectedHost ? handleUpdateHost : handleCreateHost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!selectedHost}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedHost ? 'Update Host' : 'Create Host'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hosts ({hosts.length})</CardTitle>
          <CardDescription>Complete list of hosts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hosts.map((host) => (
                <TableRow key={host.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{host.full_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {host.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {host.phone && (
                        <p className="text-sm flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {host.phone}
                        </p>
                      )}
                      {host.address && (
                        <p className="text-sm flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {host.address}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{host.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({host.rating_count})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={host.is_active ? "default" : "secondary"}>
                      {host.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(host)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Host</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {host.full_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteHost(host.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {hosts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hosts found. Click "Add New Host" to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostManagement;