import React from 'react'
import Image from 'next/image';
import { HomeIcon, MessagesSquare, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'

function Header() {
  return (
    <div className="flex items-center justify-between p-3 max-w-6xl mx-auto">
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
      <form className="flex items-center space-x-2 bg-[#1e1e22] border border-[#2f2f36] px-3 py-2 rounded-full max-w-sm flex-1 mx-4 shadow-inner focus-within:border-accent/70 transition">
        <SearchIcon className="h-4 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent flex-1 outline-none text-[#f4f4f5] placeholder-[#71717a]"
        />
      </form>

      {/* Nav + Auth */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="pill">
          <HomeIcon className="h-5" />
          <span>Home</span>
        </Link>

        <Link href="/" className="pill">
          <MessagesSquare className="h-5" />
          <span>Messaging</span>
        </Link>

        <Link href="/following" className="pill flex items-center gap-1">
          <Image src="/globe.svg" alt="Following" width={20} height={20} style={{ filter: 'invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%)' }} />
          <span>Following</span>
        </Link>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <Button asChild className="pill bg-[#27272a] text-white hover:bg-coral">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
