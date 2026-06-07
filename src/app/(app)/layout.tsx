export const dynamic = "force-dynamic";

import { ToastProvider } from "@/components/toast-provider";
import { TopNav } from "@/components/top-nav";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { isAuthEnabled } from "@/lib/auth";
import { SHELL_MAX, SHELL_PX } from "@/lib/layout-shell";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showSignOut = isAuthEnabled();

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <TopNav showSignOut={showSignOut} />
        <MobileHeader showSignOut={showSignOut} />

        <main
        className={cn(
          "flex-1",
          /* mobile: clear fixed header + bottom nav */
          "pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]",
          "md:pt-0 md:pb-0"
        )}
      >
        <div
          className={cn(
            SHELL_MAX,
            SHELL_PX,
            "py-5 sm:py-6 md:py-8"
          )}
        >
          {children}
        </div>
      </main>

        <MobileNav />
      </div>
    </ToastProvider>
  );
}
