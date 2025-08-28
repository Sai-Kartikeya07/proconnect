"use client";

import { IPostDocument } from "@/mongodb/models/post";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import ReactTimeago from "react-timeago";
import { Button } from "./ui/button";
import deletePostAction from "@/actions/deletePostAction";
import { Trash2 } from "lucide-react";
import Image from "next/image";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();
  const isAuthor = user?.id === post.user.userId;

  console.log("Post image URL:", post.imageUrl);


  return (
    <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] mb-4 shadow-md overflow-hidden">
      <div className="flex p-4 space-x-4 items-start">
        <Avatar className="h-16 w-16 rounded-full border-4 border-[#18181b] shadow">
          <AvatarImage src={post.user.userImage} />
          <AvatarFallback>
            {post.user.firstName?.charAt(0)}
            {post.user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex justify-between flex-1">
          <div>
            <p className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
            </p>
            <p className="text-xs text-gray-400">
              @{post.user.firstName}
              {post.user.firstName}-{post.user.userId.toString().slice(-4)}
            </p>
            <p className="text-xs text-gray-400">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          {isAuthor && (
            <Button
              variant="outline"
              onClick={() => deletePostAction(post._id as string)}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {/*<div className="flex-1">
        <p className="font-semibold text-white text-lg">
          {post.user.firstName} {post.user.lastName}
        </p>
        <p className="text-[#a1a1aa]">{post.text}</p>
      </div>*/}

        <div className="">
        <p className="px-4 pb-2 mt-2">{post.text}</p>

        {/* If image uploaded put it here... */}
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        )}
      </div>

      
    </div>
  );
}

export default Post;



