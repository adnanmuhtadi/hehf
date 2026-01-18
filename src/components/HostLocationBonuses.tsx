import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, MapPin, PoundSterling } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AVAILABLE_LOCATIONS } from '@/data/locations';

interface LocationBonus {
  id: string;
  host_id: string;
  location: string;
  bonus_per_night: number;
}

interface HostLocationBonusesProps {
  hostId: string;
  hostName: string;
}

const HostLocationBonuses = ({ hostId, hostName }: HostLocationBonusesProps) => {
  const [bonuses, setBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newBonus, setNewBonus] = useState('');
  const { toast } = useToast();

  const fetchBonuses = async () => {
    try {
      const { data, error } = await supabase
        .from('host_location_bonuses')
        .select('*')
        .eq('host_id', hostId)
        .order('location');

      if (error) throw error;
      setBonuses(data || []);
    } catch (error) {
      console.error('Error fetching location bonuses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch location bonuses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, [hostId]);

  const handleAddBonus = async () => {
    if (!newLocation || !newBonus) {
      toast({
        title: "Missing Information",
        description: "Please select a location and enter a bonus amount",
        variant: "destructive",
      });
      return;
    }

    const bonusAmount = parseFloat(newBonus);
    if (isNaN(bonusAmount) || bonusAmount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bonus amount",
        variant: "destructive",
      });
      return;
    }

    // Check if location already has a bonus
    if (bonuses.some(b => b.location === newLocation)) {
      toast({
        title: "Duplicate Location",
        description: "A bonus for this location already exists. Delete it first or update the amount.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('host_location_bonuses')
        .insert({
          host_id: hostId,
          location: newLocation,
          bonus_per_night: bonusAmount,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added £${bonusAmount} bonus for ${newLocation}`,
      });

      setNewLocation('');
      setNewBonus('');
      fetchBonuses();
    } catch (error: any) {
      console.error('Error adding location bonus:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add location bonus",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBonus = async (bonusId: string, location: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('host_location_bonuses')
        .delete()
        .eq('id', bonusId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Removed bonus for ${location}`,
      });

      fetchBonuses();
    } catch (error: any) {
      console.error('Error deleting location bonus:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete location bonus",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBonus = async (bonusId: string, newAmount: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('host_location_bonuses')
        .update({ bonus_per_night: newAmount })
        .eq('id', bonusId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bonus updated successfully",
      });

      fetchBonuses();
    } catch (error: any) {
      console.error('Error updating location bonus:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update location bonus",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter out locations that already have bonuses
  const availableLocations = AVAILABLE_LOCATIONS.filter(
    loc => !bonuses.some(b => b.location === loc)
  );

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading bonuses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Location Bonuses for {hostName}</Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Add extra payment per night for specific locations (e.g., for travel distance)
      </p>

      {/* Add New Bonus */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={newLocation} onValueChange={setNewLocation}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {availableLocations.length === 0 ? (
              <SelectItem value="none" disabled>All locations have bonuses</SelectItem>
            ) : (
              availableLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <div className="relative">
          <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={newBonus}
            onChange={(e) => setNewBonus(e.target.value)}
            placeholder="0.00"
            className="pl-9 w-full sm:w-24"
          />
        </div>
        
        <Button 
          onClick={handleAddBonus} 
          disabled={saving || !newLocation || !newBonus}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Existing Bonuses */}
      {bonuses.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Bonus/Night</TableHead>
                <TableHead className="text-xs w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonuses.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell className="py-2">
                    <Badge variant="outline" className="text-xs">
                      {bonus.location}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={bonus.bonus_per_night}
                        onBlur={(e) => {
                          const newVal = parseFloat(e.target.value);
                          if (!isNaN(newVal) && newVal !== bonus.bonus_per_night) {
                            handleUpdateBonus(bonus.id, newVal);
                          }
                        }}
                        className="w-20 h-7 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBonus(bonus.id, bonus.location)}
                      disabled={saving}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-md bg-muted/30">
          No location bonuses set. Add one above for distant locations.
        </div>
      )}
    </div>
  );
};

export default HostLocationBonuses;
