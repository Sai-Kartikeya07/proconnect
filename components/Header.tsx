"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { HomeIcon, MessagesSquare, SearchIcon, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'

function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.users || []);
        setOpen(true);
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div ref={containerRef} className="flex items-center justify-between p-3 max-w-6xl mx-auto relative">
      {/* Logo (SVG Hexagon Gradient) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-10 h-10 rounded-xl"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#7c3aed", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 95,27 95,73 50,95 5,73 5,27"
          fill="url(#grad1)"
        />
      </svg>

      {/* Search */}
      <div className="flex-1 mx-4 max-w-sm relative">
        <div className="flex items-center space-x-2 bg-[#1e1e22] border border-[#2f2f36] px-3 py-2 rounded-full shadow-inner focus-within:border-accent/70 transition">
          <SearchIcon className="h-4 text-[#a1a1aa]" />
          <input
            type="text"
            placeholder="Search users by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-[#f4f4f5] placeholder-[#71717a]"
          />
          {loading && <span className="text-xs text-zinc-400">...</span>}
        </div>
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-2 w-full bg-[#1e1e22] border border-[#2f2f36] rounded-xl shadow-lg overflow-hidden">
            <ul className="max-h-80 overflow-auto divide-y divide-[#2f2f36]">
              {results.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/profile/${u.id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 p-3 hover:bg-[#25252a] transition"
                  >
                    {u.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.image_url} alt={u.first_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-xs font-medium">
                        {(u.first_name || '?').charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">
                        {[u.first_name, u.last_name].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {open && !loading && results.length === 0 && query.trim() && (
          <div className="absolute z-50 mt-2 w-full bg-[#1e1e22] border border-[#2f2f36] rounded-xl shadow-lg p-4 text-sm text-zinc-400">
            No users found
          </div>
        )}
      </div>

      {/* Nav + Auth */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="pill">
          <HomeIcon className="h-5" />
          <span>Home</span>
        </Link>

        <Link href="/jobs" className="pill">
          <Briefcase className="h-5" />
          <span>Jobs</span>
        </Link>

        <Link href="/messages" className="pill">
          <MessagesSquare className="h-5" />
          <span>Messages</span>
        </Link>

        <Link href="/following" className="pill flex items-center gap-1">
          <Image src="/globe.svg" alt="Following" width={20} height={20} style={{ filter: 'invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%)' }} />
          <span>Following</span>
        </Link>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <Button asChild className="pill">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
