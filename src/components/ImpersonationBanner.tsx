import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/** Shown on every dashboard screen while an admin is signed in as a host. */
const ImpersonationBanner = () => {
  const { impersonation, stopImpersonation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  if (!impersonation) return null;

  const handleSwitchBack = async () => {
    setSwitching(true);
    const { error } = await stopImpersonation();
    setSwitching(false);
    if (error) {
      toast({ title: 'Signed out', description: error, variant: 'destructive' });
      navigate('/auth');
      return;
    }
    toast({ title: 'Back to admin', description: 'You are signed in as yourself again.' });
    navigate('/dashboard');
  };

  const who = impersonation.hostName || impersonation.hostEmail || 'a host';

  return (
    <div
      role="status"
      className="relative z-50 bg-amber-500 text-amber-950 border-b border-amber-600"
    >
      <div className="container mx-auto px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <div className="flex items-start sm:items-center gap-2 text-sm min-w-0">
          <Eye className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
          <p className="min-w-0">
            <span className="font-semibold">You are signed in as {who}</span>
            {impersonation.hostEmail && impersonation.hostName && (
              <span className="hidden md:inline"> ({impersonation.hostEmail})</span>
            )}
            <span className="block sm:inline sm:ml-1">
              Anything you change is saved to their account.
            </span>
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSwitchBack}
          disabled={switching}
          className="shrink-0 bg-amber-950 text-amber-50 hover:bg-amber-900"
        >
          {switching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Undo2 className="h-4 w-4 mr-2" />}
          Switch back to admin
        </Button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
