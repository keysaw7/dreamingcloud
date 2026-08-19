'use client';

import { passwordRuleChecks, type PasswordRuleId } from '@dreamingcloud/contracts';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

const RULE_ORDER: readonly PasswordRuleId[] = [
  'minLength',
  'lowercase',
  'uppercase',
  'digit',
  'special',
];

export function PasswordField({
  autoComplete,
  disabled,
  id,
  label,
  onChange,
  showRules = false,
  value,
}: Readonly<{
  autoComplete: string;
  disabled?: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  showRules?: boolean;
  value: string;
}>) {
  const t = useTranslations('auth');
  const generatedId = useId();
  const rulesId = `${generatedId}-rules`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-2">
      <label className="font-medium text-sm" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          aria-describedby={showRules ? rulesId : undefined}
          autoComplete={autoComplete}
          className="pr-12"
          disabled={disabled}
          id={id}
          required
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          className="absolute top-0 right-0"
          disabled={disabled}
          size="icon"
          type="button"
          variant="ghost"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff aria-hidden className="size-4" />
          ) : (
            <Eye aria-hidden className="size-4" />
          )}
        </Button>
      </div>
      {showRules ? (
        <ul className="grid gap-1" id={rulesId}>
          {RULE_ORDER.map((ruleId) => {
            const valid = passwordRuleChecks[ruleId](value);
            return (
              <li
                className={cn(
                  'flex items-center gap-2 text-xs',
                  valid ? 'text-success' : 'text-muted-foreground',
                )}
                key={ruleId}
              >
                <Check aria-hidden className="size-3.5 shrink-0" />
                {t(`passwordRules.${ruleId}`)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
