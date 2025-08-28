"use client";

import { IPostDocument } from "@/mongodb/models/post";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import ReactTimeago from "react-timeago";
import { Button } from "./ui/button";
import deletePostAction from "@/actions/deletePostAction";
import { Trash2, Heart, MessageCircle, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import React from "react";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();
  const isAuthor = user?.id === post.user.userId;
  
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [dislikes, setDislikes] = useState<string[]>(post.dislikes || []);
  const [isLiked, setIsLiked] = useState(likes.includes(user?.id || ""));
  const [isDisliked, setIsDisliked] = useState(dislikes.includes(user?.id || ""));
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        if (isLiked) {
          setLikes(likes.filter(id => id !== user.id));
          setIsLiked(false);
        } else {
          setLikes([...likes, user.id]);
          setIsLiked(true);
          // Remove from dislikes if previously disliked
          if (isDisliked) {
            setDislikes(dislikes.filter(id => id !== user.id));
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDislike = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        if (isDisliked) {
          setDislikes(dislikes.filter(id => id !== user.id));
          setIsDisliked(false);
        } else {
          setDislikes([...dislikes, user.id]);
          setIsDisliked(true);
          // Remove from likes if previously liked
          if (isLiked) {
            setLikes(likes.filter(id => id !== user.id));
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] mb-4 shadow-md overflow-hidden">
      {/* Post Header */}
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
            <p className="font-semibold text-white">
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
              size="sm"
              onClick={() => deletePostAction(post._id as string)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        <p className="text-white mb-4">{post.text}</p>

        {/* Post Image */}
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full rounded-lg mb-4"
          />
        )}

        {/* Interaction Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <span>{likes.length} likes</span>
            <span>{dislikes.length} dislikes</span>
            <span>{post.comments?.length || 0} comments</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[#3f3f46] pt-4">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>Like</span>
            </Button>

            {/* Dislike Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`flex items-center space-x-2 ${
                isDisliked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
              <span>Dislike</span>
            </Button>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-500"
            >
              <MessageCircle size={18} />
              <span>Comment</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#3f3f46]">
            <CommentSection postId={post._id as string} />
          </div>
        )}
      </div>
    </div>
  );
}

// Comment Section Component
function CommentSection({ postId }: { postId: string }) {
  const { user } = useUser();
  const [comments, setComments] = useState<Array<{
    _id: string;
    user: {
      userId: string;
      userImage: string;
      firstName: string;
      lastName: string;
    };
    text: string;
    createdAt: string;
  }>>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postId]);

  const addComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            userId: user.id,
            userImage: user.imageUrl,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          },
          text: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user?.id) return;

    console.log("Attempting to delete comment:", { commentId, userId: user.id });

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Remove comment from local state
        setComments(comments.filter(comment => comment._id !== commentId));
      } else {
        const errorData = await response.json();
        console.error("Error deleting comment:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Fetch comments when component mounts
  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <Button
          onClick={addComment}
          disabled={loading || !newComment.trim()}
          size="sm"
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const isCommentAuthor = user?.id === comment.user.userId;
          
          return (
            <div key={comment._id} className="bg-[#27272a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.user.userImage} />
                    <AvatarFallback className="text-xs">
                      {comment.user.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">
                    {comment.user.firstName} {comment.user.lastName}
                  </span>
                  <span className="text-xs text-gray-400">
                    <ReactTimeago date={new Date(comment.createdAt)} />
                  </span>
                </div>
                
                {/* Delete Button for Comment Author */}
                {isCommentAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment._id)}
                    className="text-red-500 hover:text-red-700 p-1 h-auto"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-300">{comment.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Post;



