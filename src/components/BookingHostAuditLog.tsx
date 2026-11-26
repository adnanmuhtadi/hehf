import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, XCircle } from "lucide-react";
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
  removed_by_admin: "Marked unable to host by admin",
  response_changed: "Response changed",
  approved: "Acceptance approved",
  approval_revoked: "Approval revoked",
  students_changed: "Students updated",
};

const isUnableToHost = (entry: AuditEntry) =>
  entry.action === "removed_by_admin" ||
  entry.action === "removed" ||
  (entry.action === "response_changed" && (entry.details ?? "").endsWith("to declined"));

const entryLabel = (entry: AuditEntry) => {
  if (entry.action === "response_changed") {
    const details = entry.details ?? "";
    if (details.endsWith("to declined")) return "Marked unable to host";
    if (details.endsWith("to accepted")) return "Marked able to host";
    if (details.endsWith("to pending")) return "Reset to awaiting response";
  }
  return ACTION_LABELS[entry.action] ?? entry.action;
};

const actionVariant = (entry: AuditEntry): "default" | "secondary" | "destructive" | "outline" => {
  if (isUnableToHost(entry) || entry.action === "approval_revoked") return "destructive";
  if (entry.action === "approved" || entry.action === "assigned") return "default";
  return "secondary";
};

const BookingHostAuditLog = ({ bookingId, refreshKey = 0 }: Props) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [unableOnly, setUnableOnly] = useState(false);

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
          const nameMap: Record<string, string> = {};
          const roleMap: Record<string, string> = {};
          profiles.forEach((p: any) => {
            nameMap[p.user_id] = p.full_name;
            roleMap[p.user_id] = p.role;
          });
          setNames(nameMap);
          setRoles(roleMap);
        }
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId, refreshKey]);

  const unableCount = useMemo(() => entries.filter(isUnableToHost).length, [entries]);
  const visible = unableOnly ? entries.filter(isUnableToHost) : entries;

  const actorLabel = (entry: AuditEntry) => {
    if (!entry.performed_by) return "System";
    const name = names[entry.performed_by];
    const role = roles[entry.performed_by];
    if (!name) return "Admin";
    if (entry.performed_by === entry.host_id) return `${name} (host)`;
    return role === "admin" ? `${name} (admin)` : name;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4" />
            Host status history
          </CardTitle>
          {unableCount > 0 && (
            <Button
              size="sm"
              variant={unableOnly ? "default" : "outline"}
              className="h-7 text-[11px] sm:text-xs"
              onClick={() => setUnableOnly((v) => !v)}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Unable to host ({unableCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs sm:text-sm text-muted-foreground py-2">Loading history...</p>
        ) : visible.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            {unableOnly
              ? "No unable-to-host changes recorded for this booking."
              : "No host changes recorded yet for this booking."}
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-4">
            {visible.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
                    isUnableToHost(entry) ? "bg-destructive" : "bg-primary"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={actionVariant(entry)} className="text-[10px] sm:text-xs">
                    {entryLabel(entry)}
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
                  {actorLabel(entry)}
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
