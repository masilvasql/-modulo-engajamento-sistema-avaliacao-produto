import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <output
      aria-label="Carregando produto"
      className="flex flex-col gap-12 sm:gap-16"
    >
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:gap-12">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-14 w-56" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
      </div>
      <div className="flex max-w-3xl flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </output>
  );
}
