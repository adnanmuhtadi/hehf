import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Search, X } from "lucide-react";

type EmailLog = {
  id: string;
  booking_id: string | null;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: string;
  error_message: string | null;
  sent_at: string;
};

const PAGE_SIZE = 50;

const statusVariant = (status: string) => {
  if (status === "sent") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
};

const EmailLogsManagement = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [bookingId, setBookingId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<EmailLog | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("email_logs")
      .select("*", { count: "exact" })
      .order("sent_at", { ascending: false });

    if (bookingId.trim()) q = q.eq("booking_id", bookingId.trim());
    if (recipient.trim()) q = q.ilike("recipient_email", `%${recipient.trim()}%`);
    if (status !== "all") q = q.eq("status", status);
    if (from) q = q.gte("sent_at", new Date(from).toISOString());
    if (to) q = q.lte("sent_at", new Date(to).toISOString());

    const start = page * PAGE_SIZE;
    q = q.range(start, start + PAGE_SIZE - 1);

    const { data, error, count } = await q;
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load email logs", description: error.message, variant: "destructive" });
      return;
    }
    setLogs((data ?? []) as EmailLog[]);
    setTotalCount(count ?? 0);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const stats = useMemo(() => {
    const sent = logs.filter((l) => l.status === "sent").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    return { sent, failed, total: logs.length };
  }, [logs]);

  const reset = () => {
    setBookingId("");
    setRecipient("");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(0);
    setTimeout(load, 0);
  };

  const applyFilters = () => {
    setPage(0);
    setTimeout(load, 0);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Email Logs</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Browse outgoing email notifications. Filter by booking, recipient, status, or date.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <Label htmlFor="booking_id" className="text-xs">Booking ID</Label>
            <Input
              id="booking_id"
              placeholder="UUID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="recipient" className="text-xs">Recipient email</Label>
            <Input
              id="recipient"
              placeholder="name@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="from" className="text-xs">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="to" className="text-xs">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={applyFilters} size="sm">
            <Search className="h-4 w-4 mr-1" /> Apply filters
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button onClick={load} variant="ghost" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <div className="ml-auto flex gap-2 items-center text-xs text-muted-foreground">
            <span>Showing {logs.length} of {totalCount}</span>
            <span>· Sent: {stats.sent}</span>
            <span>· Failed: {stats.failed}</span>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent at</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                    {loading ? "Loading..." : "No email logs found."}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(log.sent_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{log.recipient_email}</TableCell>
                    <TableCell className="text-xs">{log.email_type}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{log.subject}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelected(log)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center text-xs">
          <Button
            size="sm" variant="outline"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >Previous</Button>
          <span>Page {page + 1} of {totalPages}</span>
          <Button
            size="sm" variant="outline"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >Next</Button>
        </div>

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email log details</DialogTitle>
              <DialogDescription className="text-xs break-all">
                ID: {selected?.id}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Status</div>
                  <div className="col-span-2"><Badge variant={statusVariant(selected.status)}>{selected.status}</Badge></div>

                  <div className="font-medium">Sent at</div>
                  <div className="col-span-2">{new Date(selected.sent_at).toLocaleString()}</div>

                  <div className="font-medium">Recipient</div>
                  <div className="col-span-2 break-all">{selected.recipient_email}</div>

                  <div className="font-medium">Type</div>
                  <div className="col-span-2">{selected.email_type}</div>

                  <div className="font-medium">Subject</div>
                  <div className="col-span-2 break-words">{selected.subject}</div>

                  <div className="font-medium">Booking ID</div>
                  <div className="col-span-2 break-all">{selected.booking_id ?? "—"}</div>
                </div>
                {selected.error_message && (
                  <div>
                    <div className="font-medium mb-1">Error message</div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                      {selected.error_message}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmailLogsManagement;