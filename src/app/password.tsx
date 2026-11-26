import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { fieldClass } from '@/app/ui';

/** Password checks shown live while the person types. */
export const passwordChecks = (pw: string) => {
  const common = ['password', 'password1', 'password1234', '12345678', 'qwerty123', 'hehf1234', 'letmein1'];
  const long = pw.length >= 8;
  const notCommon = pw.length > 0 && !common.includes(pw.toLowerCase());
  let score = 0;
  if (long) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw) && /[a-z]/i.test(pw)) score++;
  if (/[^a-z0-9]/i.test(pw) || /[A-Z]/.test(pw)) score++;
  if (!notCommon) score = Math.min(score, 1);
  return { long, notCommon, ok: long && notCommon, score };
};

export const PasswordStrength = ({ value }: { value: string }) => {
  const c = passwordChecks(value);
  const label = !value ? '' : c.score <= 1 ? 'Weak password' : c.score === 2 ? 'Okay password' : 'Strong password';
  const colour = c.score <= 1 ? '#C62828' : c.score === 2 ? '#D97706' : '#1F9D55';
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 rounded-full" style={{ background: value && i < Math.max(1, c.score) ? colour : '#E3E8EF' }} />
        ))}
      </div>
      {label && (
        <span className="text-sm font-semibold" style={{ color: colour }}>
          {label}
        </span>
      )}
      <ul className="flex flex-col gap-1.5 text-sm text-ink-2">
        <li className="flex items-center gap-2">
          <span className={c.long ? 'font-bold text-tone-ok' : 'text-ink-3'}>{c.long ? '✓' : '○'}</span>At least 8 characters
        </li>
        <li className="flex items-center gap-2">
          <span className={c.notCommon ? 'font-bold text-tone-ok' : 'text-ink-3'}>{c.notCommon ? '✓' : '○'}</span>Not a common password
        </li>
      </ul>
    </div>
  );
};

export const PasswordInput = ({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative flex">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} pr-14`}
        required
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow((s) => !s)}
        className="absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center text-ink-3"
      >
        {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
      </button>
    </span>
  );
};

