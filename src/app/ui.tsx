import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/* ------------------------------------------------------------------ */
/* Status colours                                                      */
/* ------------------------------------------------------------------ */

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral' | 'violet';

const toneClasses: Record<Tone, string> = {
  ok: 'bg-tone-ok-bg text-tone-ok',
  warn: 'bg-tone-warn-bg text-tone-warn',
  bad: 'bg-tone-bad-bg text-tone-bad',
  info: 'bg-tone-info-bg text-tone-info',
  neutral: 'bg-tone-neutral-bg text-tone-neutral',
  violet: 'bg-tone-violet-bg text-tone-violet',
};

/** Coloured strip on the left of a card. */
export const toneStripe: Record<Tone, string> = {
  ok: 'bg-[#1F9D55]',
  warn: 'bg-[#D97706]',
  bad: 'bg-[#C62828]',
  info: 'bg-primary',
  neutral: 'bg-[#64748B]',
  violet: 'bg-[#6D28D9]',
};

export const StatusPill = ({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
);

export const toneBox = (tone: Tone) => toneClasses[tone];

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

export const Panel = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <section className={cn('rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]', className)} {...props} />
);

export const SectionLabel = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-3', className)} {...props} />
);

/** Page title row used at the top of most screens. */
export const PageTitle = ({
  title,
  subtitle,
  back,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: { to: string; label: string };
  actions?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex flex-col gap-3', className)}>
    {back && (
      <Link
        to={back.to}
        className="-ml-2 inline-flex h-9 w-fit items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary hover:bg-tone-info-bg"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {back.label}
      </Link>
    )}
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-bold leading-tight text-ink md:text-[26px]">{title}</h1>
        {subtitle && <p className="text-[15px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export const EmptyState = ({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center', className)}>
    {icon && (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tone-info-bg text-primary">{icon}</div>
    )}
    <div className="flex flex-col gap-1">
      <p className="text-base font-semibold text-ink">{title}</p>
      {body && <p className="max-w-sm text-sm text-ink-3">{body}</p>}
    </div>
    {action}
  </div>
);

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center py-16', className)} role="status" aria-label="Loading">
    <Loader2 className="h-7 w-7 animate-spin text-primary" />
  </div>
);

export const SkeletonCards = ({ count = 3, height = 'h-40' }: { count?: number; height?: string }) => (
  <div className="flex flex-col gap-3" aria-hidden>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn('animate-pulse rounded-2xl bg-white', height)} />
    ))}
  </div>
);

/** Small labelled value used in booking summaries. */
export const Fact = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
    <span className="text-xs text-ink-3">{label}</span>
    <span className="truncate text-[15px] font-semibold text-ink">{value}</span>
  </div>
);

export const FactTile = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-xl bg-canvas p-2.5">
    <span className="text-xs text-ink-3">{label}</span>
    <span className="truncate text-base font-semibold text-ink">{value}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
type BtnSize = 'sm' | 'md' | 'lg';

const btnBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-[#D5DCE5] bg-white text-ink hover:bg-canvas',
  ghost: 'text-ink-2 hover:bg-canvas',
  danger: 'bg-[#C62828] text-white hover:bg-[#A61B1B]',
  soft: 'bg-tone-info-bg text-tone-info hover:bg-[#D6E6FB]',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 rounded-[10px] px-3.5 text-[13px]',
  md: 'h-11 rounded-xl px-4 text-sm',
  lg: 'h-[52px] rounded-[14px] px-5 text-base',
};

export const btn = (variant: BtnVariant = 'primary', size: BtnSize = 'md', className?: string) =>
  cn(btnBase, btnVariants[variant], btnSizes[size], className);

export const AppButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize; loading?: boolean }
>(({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
  <button ref={ref} className={btn(variant, size, className)} disabled={disabled || loading} {...props}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
    {children}
  </button>
));
AppButton.displayName = 'AppButton';

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export const fieldClass =
  'h-12 w-full rounded-xl border border-[#D5DCE5] bg-white px-3.5 text-base text-ink placeholder:text-ink-3/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-canvas';

export const Field = ({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-[13px] font-medium text-tone-bad">{error}</p>
    ) : hint ? (
      <p className="text-[13px] text-ink-3">{hint}</p>
    ) : null}
  </div>
);

/** − 3 + control with 44px targets. */
export const Stepper = ({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  sub,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  sub?: React.ReactNode;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3.5">
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[15px] font-semibold text-ink">{label}</span>
      {sub && <span className="text-[13px] text-ink-3">{sub}</span>}
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`One fewer: ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D5DCE5] bg-white text-ink disabled:opacity-40"
      >
        <Minus className="h-[18px] w-[18px]" aria-hidden />
      </button>
      <span className="min-w-[28px] text-center text-2xl font-bold text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`One more: ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-tone-info-bg text-primary disabled:opacity-40"
      >
        <Plus className="h-[18px] w-[18px]" aria-hidden />
      </button>
    </div>
  </div>
);

/** iOS-style segmented control. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('grid gap-1 rounded-xl bg-[#EEF1F5] p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 truncate rounded-[9px] px-2 text-sm transition-colors',
              active ? 'bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(15,23,42,0.1)]' : 'font-medium text-ink-3',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Rounded filter chip. */
export const Chip = ({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
      active ? 'border-primary bg-tone-info-bg text-tone-info' : 'border-[#D5DCE5] bg-white text-ink-2 hover:bg-canvas',
      className,
    )}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Bottom sheet on phones, centred dialog on larger screens            */
/* ------------------------------------------------------------------ */

export const ResponsiveSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Wider dialog on desktop (forms). */
  wide?: boolean;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent className="hehf-app max-h-[92dvh] rounded-t-3xl border-0 bg-white">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-3">
            <div className="flex flex-col gap-1">
              <DrawerTitle className="text-[22px] font-bold leading-tight text-ink">{title}</DrawerTitle>
              {description ? (
                <DrawerDescription className="text-[13px] text-ink-3">{description}</DrawerDescription>
              ) : (
                <DrawerDescription className="sr-only">{typeof title === 'string' ? title : 'Details'}</DrawerDescription>
              )}
            </div>
            {children}
          </div>
          {footer && <div className="border-t border-line bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'hehf-app flex max-h-[90vh] flex-col gap-0 overflow-hidden border-0 bg-white p-0 sm:rounded-2xl',
          wide ? 'sm:max-w-[640px]' : 'sm:max-w-[460px]',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-5 pt-6">
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle className="text-[22px] font-bold leading-tight text-ink">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="text-[13px] text-ink-3">{description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{typeof title === 'string' ? title : 'Details'}</DialogDescription>
            )}
          </div>
          {children}
        </div>
        {footer && <div className="border-t border-line bg-white px-6 py-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

/* ------------------------------------------------------------------ */
/* Avatars                                                             */
/* ------------------------------------------------------------------ */

export const Avatar = ({ text, size = 40, className }: { text: string; size?: number; className?: string }) => (
  <div
    aria-hidden
    className={cn('flex shrink-0 items-center justify-center rounded-full bg-[#DCE7F7] font-bold text-tone-info', className)}
    style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
  >
    {text}
  </div>
);

/** Brand mark used in the shells. */
export const BrandMark = ({ size = 36 }: { size?: number }) => (
  <div
    aria-hidden
    className="flex shrink-0 items-center justify-center rounded-[10px] bg-primary font-bold text-white"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
  >
    H
  </div>
);
