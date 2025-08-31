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
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-[#18181b] rounded-xl border border-[#3f3f46] shadow-md">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">Following</h2>
          <Image src="/globe.svg" alt="Following" width={28} height={28} className="ml-1" />
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Box: Who you are following */}
        <div className="bg-[#23232a] rounded-xl p-6 border border-[#3f3f46] shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image src="/window.svg" alt="Following" width={22} height={22} />
            You are following
          </h3>
          {followingUsers.length === 0 ? (
            <div className="text-gray-400">You are not following anyone yet.</div>
          ) : (
            <div className="space-y-4">
              {followingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-[#23232a] hover:bg-[#2a2a33] transition">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image_url} />
                      <AvatarFallback>{u.first_name?.charAt(0)}{u.last_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium text-base">{u.first_name} {u.last_name}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUnfollow(u.id)}>
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Box: Who you can follow */}
        <div className="bg-[#23232a] rounded-xl p-6 border border-[#3f3f46] shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image src="/globe.svg" alt="Accounts" width={22} height={22} />
            Accounts you can follow
          </h3>
          {notFollowingUsers.length === 0 ? (
            <div className="text-gray-400">No more accounts to follow.</div>
          ) : (
            <div className="space-y-4">
              {notFollowingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-[#23232a] hover:bg-[#2a2a33] transition">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.image_url} />
                      <AvatarFallback>{u.first_name?.charAt(0)}{u.last_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium text-base">{u.first_name} {u.last_name}</span>
                  </div>
                  <Button size="sm" onClick={() => handleFollow(u.id)}>
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowingPage;
