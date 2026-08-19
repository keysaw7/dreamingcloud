import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { pageShellVariants } from './ui/page-shell';

export function AuthLayout({
  children,
  description,
  footer,
  title,
}: Readonly<{
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}>) {
  return (
    <div className={pageShellVariants({ maxWidth: 'sm' })}>
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer ? (
        <div className="mt-5 text-center text-muted-foreground text-sm">{footer}</div>
      ) : null}
    </div>
  );
}
