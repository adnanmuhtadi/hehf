import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MessageCircle, Phone, PlayCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Panel, SectionLabel } from '@/app/ui';
import { OFFICE } from '@/app/install';
import { HostTopBar } from './HostShell';

const faqs: { q: string; a: string }[] = [
  {
    q: 'What does "Needs your reply" mean?',
    a: 'HEHF has students coming to one of your areas. Tap "I can host" and choose how many students, or "Can\'t host" if the dates don\'t work.',
  },
  {
    q: 'What does "Waiting for HEHF" mean?',
    a: "You've said you can host. The HEHF team will review all the answers and confirm who hosts. You'll get a notification when you're confirmed.",
  },
  {
    q: 'Can I change my answer?',
    a: 'Yes. Open the booking and change the number of students, or tap "I can no longer host". If HEHF has already confirmed you, please call the office too so they can find someone else in time.',
  },
  {
    q: 'How are earnings worked out?',
    a: 'Your nightly rate × number of nights × students you host, plus any area bonus per night. The booking page shows the sum before you say yes.',
  },
  {
    q: 'Can I change my nightly rate?',
    a: 'Rates are set by HEHF. Contact the office if you have questions about yours.',
  },
  {
    q: 'What about tax?',
    a: 'You can earn up to £7,500 a year tax-free under the UK Rent-a-Room Scheme. Get in touch if you need help understanding how it applies to you.',
  },
  {
    q: 'How do I update my beds or areas?',
    a: 'Go to Me. Change the numbers or tap the areas you host in, then tap Save. Email, phone and rates are managed by HEHF.',
  },
  {
    q: 'Can I use HEHF like an app on my phone?',
    a: 'Yes. On Android tap Install when we offer it. On iPhone, open this site in Safari, tap Share, then "Add to Home Screen".',
  },
];

const HostHelpPage = ({ onReplayTour }: { onReplayTour: () => void }) => {
  const navigate = useNavigate();
  return (
    <>
      <HostTopBar className="flex items-center gap-1 pl-2">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-canvas"
        >
          <ChevronLeft className="h-[22px] w-[22px]" aria-hidden />
        </button>
        <h1 className="text-2xl font-bold text-ink">Help</h1>
      </HostTopBar>
      <main className="flex flex-col gap-3.5 p-4 md:px-0">
        <button
          type="button"
          onClick={onReplayTour}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tone-info-bg text-primary">
            <PlayCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-ink">Replay the tour</span>
            <span className="text-[13px] text-ink-3">1 minute</span>
          </div>
        </button>

        <Panel className="px-[18px] pb-1 pt-[18px]">
          <SectionLabel>Common questions</SectionLabel>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border-line last:border-0">
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold text-ink hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-ink-2">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>

        <Panel className="flex flex-col gap-3 p-[18px]">
          <span className="text-[15px] font-semibold text-ink">Still stuck? Talk to the HEHF office</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: `tel:${OFFICE.phone}`, label: 'Call', icon: Phone },
              { href: OFFICE.whatsapp, label: 'WhatsApp', icon: MessageCircle },
              { href: `mailto:${OFFICE.email}`, label: 'Email', icon: Mail },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-[#D5DCE5] bg-white text-xs font-semibold text-ink no-underline"
              >
                <c.icon className="h-[18px] w-[18px]" aria-hidden />
                {c.label}
              </a>
            ))}
          </div>
        </Panel>
      </main>
    </>
  );
};

export default HostHelpPage;
