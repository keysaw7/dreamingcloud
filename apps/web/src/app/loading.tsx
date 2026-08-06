import { PageShell, Skeleton } from '@dreamingcloud/ui';

export default function Loading() {
  return (
    <PageShell maxWidth="feed" className="max-w-(--dc-width-feed)">
      <Skeleton className="h-28 w-full rounded-(--dc-radius-xl)" />
      <Skeleton className="mt-4 h-24 w-full rounded-(--dc-radius-xl)" />
      <div className="mt-4 grid gap-4">
        <Skeleton className="h-56 w-full rounded-(--dc-radius-xl)" />
        <Skeleton className="h-56 w-full rounded-(--dc-radius-xl)" />
      </div>
    </PageShell>
  );
}
