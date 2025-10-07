"use client";
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import { User } from "lucide-react";

function UserInformation() {
  const { user } = useUser();
  useEffect(() => {
    if (user?.id) {
      fetch("/api/sync-user", { method: "POST" });
    }
  }, [user?.id]);
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const imageUrl = user?.imageUrl;
  const [postCount, setPostCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user-info?userId=${user.id}`)
        .then(res => res.ok ? res.json() : { postCount: 0, commentCount: 0 })
        .then(data => {
          setPostCount(data.postCount ?? 0);
          setCommentCount(data.commentCount ?? 0);
        })
        .catch(() => {
          setPostCount(0);
          setCommentCount(0);
        });
    }
  }, [user?.id]);

  return (
    <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] overflow-hidden shadow-md">
      {/* Header Section with gradient */}
      <div className="h-20 bg-gradient-to-r from-[#27272a] to-[#3f3f46]" />
      {/* Profile Content */}
      <div className="flex flex-col items-center -mt-10 px-4 pb-4">
        <Avatar className="h-20 w-20 border-4 border-[#18181b] rounded-full shadow">
          {user?.id ? (
            <AvatarImage src={imageUrl} />
          ) : (
            <AvatarImage src="https://github.com/shadcn.png" />
          )}
          <AvatarFallback>
            {firstName?.charAt(0)}{lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <SignedIn>
          <div className="mt-3 text-center">
            <p className="font-semibold text-white text-lg">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-[#a1a1aa] mt-1 bg-[#27272a] px-2 py-0.5 rounded-full">
              @{firstName}{lastName}-{user?.id?.slice(-4)}
            </p>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="mt-3 text-center space-y-2">
            <p className="font-semibold text-white">You are not signed in</p>
            <Button 
              asChild 
              className="bg-[#27272a] text-white hover:bg-[#3f3f43]">
              <SignInButton>Sign In</SignInButton>
            </Button>
          </div>
        </SignedOut>
        {/* Divider */}
        <hr className="w-full border-[#3f3f46] my-4" />
        
        {/* Profile Button */}
        <SignedIn>
          <Link href={`/profile/${user?.id}`} className="w-full">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </SignedIn>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center w-full">
          <div>
            <p className="text-[#a1a1aa] text-sm">Posts</p>
            <p className="font-semibold text-white">{postCount}</p>
          </div>
          <div>
            <p className="text-[#a1a1aa] text-sm">Comments</p>
            <p className="font-semibold text-white">{commentCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInformation


