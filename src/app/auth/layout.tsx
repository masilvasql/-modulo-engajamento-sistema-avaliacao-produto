import { ReviewPanel } from "./_components/review-panel";

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="grid flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <ReviewPanel />
      <main className="flex items-start justify-center px-6 py-10 sm:px-10 sm:py-14 lg:items-center lg:py-12">
        <div className="w-full max-w-[26rem]">{children}</div>
      </main>
    </div>
  );
}
