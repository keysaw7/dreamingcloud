import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AuthLayout({
  brand,
  children,
  description,
  footer,
  title,
}: Readonly<{
  brand: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-12 sm:py-20">
      <p className="mb-8 text-center font-semibold tracking-tight">{brand}</p>
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
