import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-12 w-40 bg-white/5 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
            </div>
            <Skeleton className="h-8 w-32 bg-white/5" />
            <Skeleton className="h-3 w-40 bg-white/5" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 h-[400px] flex flex-col gap-6">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <div className="flex-1 w-full bg-white/[0.01] rounded-2xl border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 h-[400px] space-y-6">
            <Skeleton className="h-6 w-32 bg-white/5" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-full bg-white/5" />
                  <Skeleton className="h-2 w-24 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
