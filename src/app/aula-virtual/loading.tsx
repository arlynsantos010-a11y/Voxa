import { Skeleton } from "@/components/ui/skeleton";

export default function AulaVirtualLoading() {
  return (
    <div className="container mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-3">
        <Skeleton className="h-10 w-[300px] rounded-lg" />
        <Skeleton className="h-5 w-[450px] max-w-full" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>

      <div className="mt-12 space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
