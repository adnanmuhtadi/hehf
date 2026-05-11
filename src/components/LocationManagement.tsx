import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, MapPin, Loader2 } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LocationManagement = () => {
  const { rows, loading, refetch } = useLocations();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setAdding(true);
    const { error } = await supabase.from('locations').insert({ name });
    setAdding(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not add location',
        description: error.message.includes('duplicate')
          ? 'A location with that name already exists.'
          : error.message,
      });
      return;
    }

    toast({ title: 'Location added', description: `"${name}" is now available.` });
    setNewName('');
    refetch();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const { error } = await supabase.from('locations').delete().eq('id', pendingDelete.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not remove location',
        description: error.message,
      });
    } else {
      toast({ title: 'Location removed', description: `"${pendingDelete.name}" was removed.` });
      refetch();
    }
    setPendingDelete(null);
  };

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Locations
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Add or remove the centres available throughout the platform
          (booking forms, host preferences, filters).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 space-y-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1">
            <Label htmlFor="new-location">New location name</Label>
            <Input
              id="new-location"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. St Albans"
              maxLength={80}
            />
          </div>
          <Button type="submit" disabled={adding || !newName.trim()} className="sm:w-auto">
            {adding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add location
          </Button>
        </form>

        <div className="border rounded-md divide-y">
          {loading ? (
            <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading locations…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No locations yet. Add your first one above.</div>
          ) : (
            rows.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 gap-2"
              >
                <span className="text-sm font-medium">{loc.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete({ id: loc.id, name: loc.name })}
                  aria-label={`Remove ${loc.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Removing a location only hides it from new selections. Existing
          bookings and host preferences referencing it are not modified.
        </p>
      </CardContent>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this location?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" will no longer appear in dropdowns
              across the platform. Existing bookings keep their current
              location text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LocationManagement;