import Link from 'next/link';
import { Button, EmptyState } from '@dreamingcloud/ui';

export function AuthGate({
  title,
  description,
  loginLabel,
}: {
  title: string;
  description?: string;
  loginLabel: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Link href="/auth/login">
          <Button>{loginLabel}</Button>
        </Link>
      }
    />
  );
}
