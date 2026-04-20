import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen pb-20 fade-in duration-500 animate-in">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
      </header>

      <main className="container mx-auto py-10 px-4 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-full md:w-96 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-2xl hidden md:block" />
        </div>

        <Skeleton className="h-[500px] w-full rounded-[2rem]" />
      </main>
    </div>
  );
}
