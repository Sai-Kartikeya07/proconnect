"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import ReactTimeago from "react-timeago";
import { Button } from "./ui/button";
import deletePostAction from "@/actions/deletePostAction";
import { Trash2, Heart, MessageCircle, ThumbsDown, Bookmark } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import React from "react";

function Post({ post }: { post: any }) {
  const { user } = useUser();
  const isAuthor = user?.id === post.user_id;
  
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [dislikes, setDislikes] = useState<string[]>(post.dislikes || []);
  const [isLiked, setIsLiked] = useState(likes.includes(user?.id || ""));
  const [isDisliked, setIsDisliked] = useState(dislikes.includes(user?.id || ""));
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState<boolean>(!!post.saved);
  const handleSaveToggle = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } catch (e) {
      console.error('Error toggling save', e);
    }
  };

  const handleLike = async () => {
    if (!user?.id) return;

    try {
  const response = await fetch(`/api/posts/${post.id}/like`, {
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
  const response = await fetch(`/api/posts/${post.id}/dislike`, {
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
  <div className="surface-card glow mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="flex p-4 space-x-4 items-start">
        <Avatar className="h-16 w-16 rounded-full border-4 border-[#18181b] shadow">
          <AvatarImage src={post.user_image} />
          <AvatarFallback>
            {post.first_name?.charAt(0)}
            {post.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex justify-between flex-1">
          <div>
            <p className="typ-sub text-white font-semibold">
              {post.first_name} {post.last_name}{" "}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
            </p>
            <p className="typ-small text-gray-400">
              @{post.first_name}
              {post.first_name}-{post.user_id?.toString().slice(-4)}
            </p>
            <p className="typ-small text-gray-400">
              <ReactTimeago date={new Date(post.created_at)} />
            </p>
          </div>

          {isAuthor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deletePostAction(post.id as string)}
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
        {post.image_url && (
          <Image
            src={post.image_url}
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
                isLiked ? "text-purple-400" : "text-gray-400 hover:text-purple-400"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>Like</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={`flex items-center space-x-2 ${
                isDisliked ? "text-purple-400" : "text-gray-400 hover:text-purple-400"
              }`}
            >
              <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
              <span>Dislike</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400"
            >
              <MessageCircle size={18} />
              <span>Comment</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveToggle}
              className={`flex items-center space-x-2 ${saved ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#3f3f46]">
            <CommentSection postId={post.id as string} />
          </div>
        )}
      </div>
    </div>
  );
}

// Comment Section Component
function CommentSection({ postId }: { postId: string }) {
  const { user } = useUser();
  const [comments, setComments] = useState<Array<any>>([]);
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
          className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
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
          const isCommentAuthor = user?.id === comment.user_id;
          return (
            <div key={comment.id || comment._id} className="bg-[#27272a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.user_image || undefined} />
                    <AvatarFallback className="text-xs">
                      {comment.first_name ? comment.first_name.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">
                    {comment.first_name} {comment.last_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    <ReactTimeago date={new Date(comment.created_at || comment.createdAt)} />
                  </span>
                </div>
                {/* Delete Button for Comment Author */}
                {isCommentAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment.id || comment._id)}
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



