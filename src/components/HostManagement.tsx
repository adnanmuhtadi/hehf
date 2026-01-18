import { useState, useEffect, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Star, Mail, Phone, MapPin, Filter, Search, Power, Users, PoundSterling } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AVAILABLE_LOCATIONS } from '@/data/locations';
import HostLocationBonuses from './HostLocationBonuses';

interface Host {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  pets?: string;
  preferred_locations?: string[];
  rating: number;
  rating_count: number;
  is_active: boolean;
  handbook_downloaded: boolean;
  rate_per_student_per_night: number;
  max_students_capacity: number;
  created_at: string;
  updated_at: string;
}

const HostManagement = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    pets: '',
    preferred_locations: [] as string[],
    is_active: true,
    rate_per_student_per_night: 0,
    max_students_capacity: 0,
  });
  const { toast } = useToast();

  const filteredHosts = useMemo(() => {
    let result = hosts;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.full_name.toLowerCase().includes(query) || 
        h.email.toLowerCase().includes(query)
      );
    }
    
    // Filter by location
    if (locationFilter === 'not_set') {
      result = result.filter(h => !h.preferred_locations || h.preferred_locations.length === 0);
    } else if (locationFilter !== 'all') {
      result = result.filter(h => h.preferred_locations?.includes(locationFilter));
    }
    
    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter(h => h.is_active);
    } else if (statusFilter === 'disabled') {
      result = result.filter(h => !h.is_active);
    }
    
    return result;
  }, [hosts, locationFilter, statusFilter, searchQuery]);

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

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
        setFormData({ email: '', full_name: '', phone: '', address: '', pets: '', preferred_locations: [], is_active: true, rate_per_student_per_night: 0, max_students_capacity: 0 });
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
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          pets: formData.pets || null,
          preferred_locations: formData.preferred_locations,
          is_active: formData.is_active,
          rate_per_student_per_night: formData.rate_per_student_per_night,
          max_students_capacity: formData.max_students_capacity,
        })
        .eq('id', selectedHost.id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update blocked (no rows updated). Check admin RLS permissions.');
      }

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

  const handleToggleHostStatus = async (host: Host) => {
    try {
      const newStatus = !host.is_active;
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', host.id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update blocked (no rows affected). Check admin permissions.');
      }

      toast({
        title: "Success",
        description: `Host ${newStatus ? 'enabled' : 'disabled'} successfully`,
      });

      fetchHosts();
    } catch (error: any) {
      console.error('Error toggling host status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update host status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', hostId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete blocked (no rows affected). Check admin permissions.');
      }

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
    setFormData({ email: '', full_name: '', phone: '', address: '', pets: '', preferred_locations: [], is_active: true, rate_per_student_per_night: 0, max_students_capacity: 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (host: Host) => {
    setSelectedHost(host);
    setFormData({
      email: host.email,
      full_name: host.full_name,
      phone: host.phone || '',
      address: host.address || '',
      pets: host.pets || '',
      preferred_locations: host.preferred_locations || [],
      is_active: host.is_active,
      rate_per_student_per_night: host.rate_per_student_per_night || 0,
      max_students_capacity: host.max_students_capacity || 0,
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading hosts...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">Host Management</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage all hosts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Host
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedHost ? 'Edit Host' : 'Create New Host'}</DialogTitle>
              <DialogDescription>
                {selectedHost ? 'Update host information and manage location bonuses' : 'Add a new host to the system'}
              </DialogDescription>
            </DialogHeader>

            {selectedHost ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Host Details</TabsTrigger>
                  <TabsTrigger value="bonuses">
                    <PoundSterling className="h-4 w-4 mr-1" />
                    Location Bonuses
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <form onSubmit={handleUpdateHost} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled
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
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pets">Pets</Label>
                      <Input
                        id="pets"
                        value={formData.pets}
                        onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
                        placeholder="e.g., 2 cats, 1 dog"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate_per_student_per_night">Rate per Student per Night (£)</Label>
                        <Input
                          id="rate_per_student_per_night"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.rate_per_student_per_night}
                          onChange={(e) => setFormData({ ...formData, rate_per_student_per_night: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_students_capacity">Max Students Capacity</Label>
                        <Input
                          id="max_students_capacity"
                          type="number"
                          min="0"
                          value={formData.max_students_capacity}
                          onChange={(e) => setFormData({ ...formData, max_students_capacity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Locations</Label>
                      <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                        {AVAILABLE_LOCATIONS.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={formData.preferred_locations.includes(location)}
                              onCheckedChange={() => toggleLocation(location)}
                            />
                            <Label htmlFor={`location-${location}`} className="text-sm font-normal cursor-pointer">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select one or more locations
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Update Host</Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="bonuses" className="mt-4">
                  <HostLocationBonuses 
                    hostId={selectedHost.user_id} 
                    hostName={selectedHost.full_name} 
                  />
                  <div className="flex justify-end mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleCreateHost} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pets">Pets</Label>
                  <Input
                    id="pets"
                    value={formData.pets}
                    onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
                    placeholder="e.g., 2 cats, 1 dog"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate_per_student_per_night">Rate per Student per Night (£)</Label>
                    <Input
                      id="rate_per_student_per_night"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rate_per_student_per_night}
                      onChange={(e) => setFormData({ ...formData, rate_per_student_per_night: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_students_capacity">Max Students Capacity</Label>
                    <Input
                      id="max_students_capacity"
                      type="number"
                      min="0"
                      value={formData.max_students_capacity}
                      onChange={(e) => setFormData({ ...formData, max_students_capacity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Locations</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                    {AVAILABLE_LOCATIONS.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-create-${location}`}
                          checked={formData.preferred_locations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                        />
                        <Label htmlFor={`location-create-${location}`} className="text-sm font-normal cursor-pointer">
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select one or more locations
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Host</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">All Hosts ({filteredHosts.length})</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {locationFilter === 'all' && !searchQuery
                    ? 'Complete list' 
                    : locationFilter === 'not_set'
                      ? 'Without locations'
                      : searchQuery
                        ? `"${searchQuery}"`
                        : `In ${locationFilter}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="relative flex-1 sm:min-w-[200px] sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="not_set">Not Set</SelectItem>
                    {AVAILABLE_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Max Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHosts.map((host) => (
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
                      {host.preferred_locations && host.preferred_locations.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {host.preferred_locations.slice(0, 2).map((loc) => (
                            <Badge key={loc} variant="outline" className="text-xs">{loc}</Badge>
                          ))}
                          {host.preferred_locations.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{host.preferred_locations.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{host.max_students_capacity || 0}</span>
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
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(host)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant={host.is_active ? "outline" : "default"} size="sm" title={host.is_active ? "Disable" : "Enable"}>
                              <Power className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{host.is_active ? 'Disable Host' : 'Enable Host'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {host.is_active ? `Disable ${host.full_name}? They won't receive bookings.` : `Enable ${host.full_name}? They'll receive bookings again.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleHostStatus(host)}>
                                {host.is_active ? 'Disable' : 'Enable'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Host</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {host.full_name}? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHost(host.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredHosts.map((host) => (
              <Card key={host.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{host.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{host.email}</p>
                    </div>
                    <Badge variant={host.is_active ? "default" : "secondary"} className="text-xs shrink-0">
                      {host.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{host.rating.toFixed(1)} ({host.rating_count})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Max: {host.max_students_capacity || 0}</span>
                    </div>
                    {host.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{host.phone}</span>
                      </div>
                    )}
                  </div>

                  {host.preferred_locations && host.preferred_locations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {host.preferred_locations.slice(0, 3).map((loc) => (
                        <Badge key={loc} variant="outline" className="text-[10px]">{loc}</Badge>
                      ))}
                      {host.preferred_locations.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{host.preferred_locations.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(host)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={host.is_active ? "outline" : "default"} size="sm">
                          <Power className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{host.is_active ? 'Disable' : 'Enable'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {host.is_active ? `Disable ${host.full_name}?` : `Enable ${host.full_name}?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleToggleHostStatus(host)}>{host.is_active ? 'Disable' : 'Enable'}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHosts.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              {hosts.length === 0 
                ? 'No hosts found. Add one to get started.'
                : 'No hosts match the filter.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostManagement;