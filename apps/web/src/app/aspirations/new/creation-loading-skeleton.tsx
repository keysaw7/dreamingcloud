import { Card, Skeleton } from '@dreamingcloud/ui';

interface CreationLoadingSkeletonProps {
  readonly label: string;
}

export function CreationLoadingSkeleton({ label }: CreationLoadingSkeletonProps) {
  return (
    <Card aria-busy="true" aria-live="polite" className="space-y-6 p-6">
      <span className="sr-only">{label}</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-11 w-24" />
      </div>
    </Card>
  );
}
