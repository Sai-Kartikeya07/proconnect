'use client'

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import Header from "./Header";
import LoadingSpinner from "./LoadingSpinner";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SignedOut>
        <LoginPage />
      </SignedOut>
      
      <SignedIn>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 shadow-lg border-b border-[#27272a] bg-gradient-to-r from-[#18181b] to-[#0d0d0f] backdrop-blur">
            <Header />
          </header>
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </SignedIn>
    </>
  );
}
