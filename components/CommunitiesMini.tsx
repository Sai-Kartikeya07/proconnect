"use client";
import Link from 'next/link';
import { Users } from 'lucide-react';

const communities = [
  { slug: 'adventure-seekers', name: 'Adventure Seekers' },
  { slug: 'food-lovers', name: 'Food Lovers' },
  { slug: 'book-club', name: 'Book Club' },
  { slug: 'fitness-zone', name: 'Fitness Zone' },
];

export default function CommunitiesMini() {
  return (
  <nav className="hidden lg:block sticky top-6 self-start w-52 pr-4 ml-12 xl:ml-16" aria-label="Communities">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
        <Users className="h-4 w-4 text-purple-500" />
        <span className="text-gray-300 normal-case tracking-normal font-medium text-sm">Communities</span>
      </div>
      <ul className="space-y-1">
        {communities.map(c => (
          <li key={c.slug}>
            <Link
              href={`/communities/${c.slug}`}
              className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-[#27272a] transition-colors pressable"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}