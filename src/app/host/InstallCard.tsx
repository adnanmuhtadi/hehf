import { useState } from 'react';
import { Share, Smartphone, X } from 'lucide-react';
import { useInstallPrompt } from '@/app/install';

/** "Get booking alerts: add HEHF to your home screen". */
const InstallCard = ({ force }: { force?: boolean }) => {
  const install = useInstallPrompt();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (!install.available) return null;
  if (install.dismissed && !force) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#B7C3D2] bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tone-info-bg text-primary">
          <Smartphone className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold text-ink">Add HEHF to your home screen</span>
          <span className="text-[13px] text-ink-3">Opens like an app, one tap away</span>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (install.canPrompt) await install.install();
            else setShowIosSteps((s) => !s);
          }}
          className="h-9 shrink-0 rounded-[10px] bg-tone-info-bg px-3.5 text-[13px] font-semibold text-tone-info"
        >
          Install
        </button>
        {!force && (
          <button
            type="button"
            aria-label="Hide this"
            onClick={install.dismiss}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-canvas"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {showIosSteps && (
        <ol className="ml-1 flex list-decimal flex-col gap-1 pl-5 text-sm text-ink-2">
          <li>
            Tap <Share className="inline h-4 w-4 align-[-2px]" aria-label="Share" /> at the bottom of Safari
          </li>
          <li>Choose “Add to Home Screen”</li>
          <li>Tap Add</li>
        </ol>
      )}
    </section>
  );
};

export default InstallCard;
