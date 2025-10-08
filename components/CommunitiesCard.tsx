"use client";
import Link from 'next/link';
import { Users, Compass, BookOpen, Utensils, Dumbbell } from 'lucide-react';
import React from 'react';

interface CommunitiesCardProps {
  variant?: 'sidebar' | 'inline';
  className?: string;
}

const communities = [
  { slug: 'adventure-seekers', name: 'Adventure Seekers', icon: <Compass className="h-4 w-4 text-purple-400" /> },
  { slug: 'food-lovers', name: 'Food Lovers', icon: <Utensils className="h-4 w-4 text-rose-400" /> },
  { slug: 'book-club', name: 'Book Club', icon: <BookOpen className="h-4 w-4 text-amber-400" /> },
  { slug: 'fitness-zone', name: 'Fitness Zone', icon: <Dumbbell className="h-4 w-4 text-green-400" /> },
];

export default function CommunitiesCard({ variant = 'sidebar', className = '' }: CommunitiesCardProps) {
  const base = 'surface-card glow overflow-hidden';
  const wrapperClasses = variant === 'sidebar'
    ? `hidden lg:block self-start ${base} ${className}`
    : `lg:hidden mt-6 ${base} ${className}`;

  return (
  <div className={wrapperClasses}>
      {/* Header (match Jobs/UserInformation gradient bar style) */}
  <div className="h-16 bg-gradient-to-r from-[#27272a] to-[#3f3f46] flex items-center px-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-white" />
          <h2 className="text-white font-semibold text-lg tracking-tight">Communities</h2>
        </div>
      </div>

      {/* List */}
  <ul className="px-6 pt-6 pb-5 space-y-3 flex-1 overflow-y-auto">
        {communities.map(c => (
          <li key={c.slug}>
            <Link
              href={`/communities/${c.slug}`}
              className="group flex items-center gap-3 w-full rounded-md border border-[#2d2d31] bg-[#1f1f23] px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#27272a] hover:border-[#3f3f46] transition-colors pressable"
            >
              <span className="flex items-center justify-center h-8 w-8 rounded-md bg-[#27272a] group-hover:bg-[#303036] transition-colors">
                {c.icon}
              </span>
              <span className="font-medium truncate">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
