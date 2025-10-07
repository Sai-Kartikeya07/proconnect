"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserType = {
  id: string;
  first_name: string;
  last_name: string;
  image_url?: string;
};

function FollowingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [users, setUsers] = useState<UserType[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/all-users")
      .then(res => res.ok ? res.json() : [])
      .then((data: UserType[]) => setUsers(data));
    if (user?.id) {
      fetch(`/api/follows?followerId=${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setFollowing(data.map((f: any) => f.following_id)));
    }
  }, [user?.id]);

  const handleFollow = async (id: string) => {
    await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id })
    });
    setFollowing(f => [...f, id]);
  };

  const handleUnfollow = async (id: string) => {
    await fetch("/api/follows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id })
    });
    setFollowing(f => f.filter(fid => fid !== id));
  };

  // Split users into following and not following
  const followingUsers = users.filter(u => following.includes(u.id) && u.id !== user?.id);
  const notFollowingUsers = users.filter(u => !following.includes(u.id) && u.id !== user?.id);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8">
      <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 will-animate fade-up" style={{animationDelay:'0ms'}}>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Following</h2>
            <Image src="/globe.svg" alt="Following" width={32} height={32} />
          </div>
          <Button
            onClick={() => router.back()}
            className="pill pill-go-back pressable px-4 py-2 text-sm font-medium"
            variant="ghost"
          >
            <span>Go Back</span>
          </Button>
        </div>
        {/* Dual Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* You are following */}
          <div className="surface-card glow p-6 rounded-xl will-animate fade-up" style={{animationDelay:'80ms'}}>
            <h3 className="typ-sub text-white font-semibold mb-5 flex items-center gap-2">
              <Image src="/window.svg" alt="Following" width={22} height={22} />
              You are following
            </h3>
            {followingUsers.length === 0 ? (
              <div className="text-gray-400 text-sm">You are not following anyone yet.</div>
            ) : (
              <div className="space-y-3">
                {followingUsers.map((u, idx) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#23232a] hover:bg-[#2a2a33] transition will-animate fade-up"
                    style={{animationDelay: `${Math.min(120 + idx*50, 460)}ms`}}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.image_url} />
                        <AvatarFallback>{u.first_name?.charAt(0)}{u.last_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium text-sm md:text-base">{u.first_name} {u.last_name}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUnfollow(u.id)}>
                      Unfollow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Accounts you can follow */}
          <div className="surface-card glow p-6 rounded-xl will-animate fade-up" style={{animationDelay:'120ms'}}>
            <h3 className="typ-sub text-white font-semibold mb-5 flex items-center gap-2">
              <Image src="/globe.svg" alt="Accounts" width={22} height={22} />
              Accounts you can follow
            </h3>
            {notFollowingUsers.length === 0 ? (
              <div className="text-gray-400 text-sm">No more accounts to follow.</div>
            ) : (
              <div className="space-y-3">
                {notFollowingUsers.map((u, idx) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#23232a] hover:bg-[#2a2a33] transition will-animate fade-up"
                    style={{animationDelay: `${Math.min(160 + idx*50, 500)}ms`}}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.image_url} />
                        <AvatarFallback>{u.first_name?.charAt(0)}{u.last_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium text-sm md:text-base">{u.first_name} {u.last_name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleFollow(u.id)}
                      className="btn-accent-follow pressable"
                      data-accent="true"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowingPage;
