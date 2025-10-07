'use client'

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import LoginPage from "./LoginPage";
import Header from "./Header";
import OnboardingNameModal from "./OnboardingNameModal";
// Removed LoadingSpinner for route transitions; only used initially

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Mount effect
  useEffect(() => { setMounted(true); }, []);

  // Path change fade effect (must be declared before any conditional return to preserve hook order)
  useEffect(() => {
    if (currentPath === null) {
      setCurrentPath(pathname);
      return;
    }
    if (pathname !== currentPath) {
      // Trigger fade-out then swap then fade-in
      setFading(true);
      const outTimer = window.setTimeout(() => {
        setCurrentPath(pathname);
        // Allow next paint then remove fading state for enter animation
        requestAnimationFrame(() => {
          const enterTimer = window.setTimeout(() => setFading(false), 10);
          fadeTimeoutRef.current = enterTimer;
        });
      }, 200); // matches exit duration
      fadeTimeoutRef.current = outTimer;
    }
    return () => {
      if (fadeTimeoutRef.current) window.clearTimeout(fadeTimeoutRef.current);
    };
  }, [pathname, currentPath]);

  // Initial mount skeleton (after declaring all hooks)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">
        Initializing…
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <LoginPage />
      </SignedOut>
      
      <SignedIn>
  <div className={`min-h-screen flex flex-col page-transition-container ${fading ? 'fading' : ''}` }>
          <header className="sticky top-0 z-50 shadow-lg border-b border-[#27272a] bg-gradient-to-r from-[#18181b] to-[#0d0d0f] backdrop-blur">
            <Header />
          </header>
          <main className="flex-1 w-full relative">
            <div
              key={currentPath || 'initial'}
              className={`page-scene ${fading ? 'fade-swap-exit-active' : 'fade-swap-enter-active'}`}
            >
              {children}
            </div>
          </main>
          <OnboardingNameModal onComplete={() => { /* could refetch user context if needed */ }} />
        </div>
      </SignedIn>
    </>
  );
}
