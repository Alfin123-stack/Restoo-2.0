import { Suspense } from "react";
import { SoundEffects } from "@/components/layout/sound-effects";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeaderFallback, SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* usePathname() butuh Suspense agar shell halaman tetap bisa di-prerender. */}
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <Suspense fallback={null}>
        <SoundEffects />
      </Suspense>
      <main id="konten" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
