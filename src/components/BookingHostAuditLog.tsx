import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface AuditEntry {
  id: string;
  host_id: string;
  action: string;
  details: string | null;
  performed_by: string | null;
  created_at: string;
}

interface Props {
  bookingId: string;
  refreshKey?: number;
}

const ACTION_LABELS: Record<string, string> = {
  assigned: "Host assigned",
  removed: "Host assignment deleted",
  removed_by_admin: "Host removed by admin",
  response_changed: "Response changed",
  approved: "Acceptance approved",
  approval_revoked: "Approval revoked",
  students_changed: "Students updated",
};

const actionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action === "approved" || action === "assigned") return "default";
  if (action === "removed" || action === "removed_by_admin" || action === "approval_revoked") return "destructive";
  return "secondary";
};

const BookingHostAuditLog = ({ bookingId, refreshKey = 0 }: Props) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("booking_host_audit")
        .select("id, host_id, action, details, performed_by, created_at")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error || !data) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setEntries(data as AuditEntry[]);

      const ids = Array.from(
        new Set(data.flatMap((e) => [e.host_id, e.performed_by]).filter(Boolean) as string[]),
      );

      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, role")
          .in("user_id", ids);
        if (!cancelled && profiles) {
          const map: Record<string, string> = {};
          profiles.forEach((p: any) => {
            map[p.user_id] = p.full_name;
          });
          setNames(map);
        }
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId, refreshKey]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <History className="h-4 w-4" />
          Host change history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs sm:text-sm text-muted-foreground py-2">Loading history...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            No host changes recorded yet for this booking.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-4">
            {entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={actionVariant(entry.action)} className="text-[10px] sm:text-xs">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </Badge>
                  <span className="text-xs sm:text-sm font-medium">
                    {names[entry.host_id] ?? "Unknown host"}
                  </span>
                </div>
                {entry.details && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                )}
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}
                  {" · by "}
                  {entry.performed_by
                    ? names[entry.performed_by] ?? "Admin"
                    : entry.performed_by === null
                      ? "System"
                      : "Admin"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingHostAuditLog;
