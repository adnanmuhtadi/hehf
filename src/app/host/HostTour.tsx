import { useState } from 'react';
import { Bell, CalendarDays, Hand, Smartphone } from 'lucide-react';
import { AppButton } from '@/app/ui';

const slides = [
  {
    icon: Hand,
    title: 'Answer offers in one tap',
    body: "When HEHF has students in your area, you'll get an alert. Tap I can host, choose how many, and you're done.",
  },
  {
    icon: Bell,
    title: "We'll tell you when you're confirmed",
    body: 'After you say yes, HEHF reviews and confirms. Your booking moves from "Waiting for HEHF" to "Confirmed".',
  },
  {
    icon: CalendarDays,
    title: 'Everything in one place',
    body: 'Home shows what needs you and who arrives next. Calendar shows your month. Me is where you change your beds and areas.',
  },
  {
    icon: Smartphone,
    title: 'Keep HEHF on your phone',
    body: 'Add HEHF to your home screen so it opens like an app. You can find this again under Me.',
  },
];

/** Short full-screen welcome for new hosts. */
const HostTour = ({ onDone }: { onDone: () => void }) => {
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      className="hehf-app fixed inset-0 z-[60] flex flex-col bg-white px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex justify-end">
          <button type="button" onClick={onDone} className="h-11 px-3 text-[15px] font-medium text-ink-3">
            Skip
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-tone-info-bg text-primary">
            <s.icon className="h-12 w-12" aria-hidden />
          </div>
          <div className="flex flex-col gap-2.5" aria-live="polite">
            <h2 className="text-[26px] font-bold leading-tight text-ink">{s.title}</h2>
            <p className="text-base leading-relaxed text-ink-2">{s.body}</p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex justify-center gap-2" aria-label={`Step ${i + 1} of ${slides.length}`}>
            {slides.map((_, j) => (
              <span key={j} className={`h-2 rounded-full transition-all ${j === i ? 'w-6 bg-primary' : 'w-2 bg-[#CBD3DD]'}`} />
            ))}
          </div>
          <div className="flex gap-2.5">
            {i > 0 && (
              <AppButton variant="secondary" size="lg" className="flex-1" onClick={() => setI(i - 1)}>
                Back
              </AppButton>
            )}
            <AppButton size="lg" className="flex-[2]" onClick={() => (last ? onDone() : setI(i + 1))}>
              {last ? 'Get started' : 'Next'}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostTour;
