import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AVAILABLE_LOCATIONS } from '@/data/locations';

export interface LocationRow {
  id: string;
  name: string;
}

/**
 * Returns the list of centre/location names from the `locations` table.
 * While loading (or if the query fails), falls back to the static
 * AVAILABLE_LOCATIONS list so existing UI never breaks.
 */
export function useLocations() {
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('locations')
      .select('id, name')
      .order('name', { ascending: true });
    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setError(null);
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const names =
    rows.length > 0
      ? rows.map((r) => r.name)
      : ([...AVAILABLE_LOCATIONS] as string[]);

  return { rows, names, loading, error, refetch: fetchLocations };
}