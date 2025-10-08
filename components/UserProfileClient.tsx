"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUserProfile } from "@/types/profile";
import EducationSection from "./EducationSection";
import { 
  User, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Calendar,
  MapPin,
  Mail,
  Users,
  FileText,
  GraduationCap
} from "lucide-react";
import ReactTimeago from "react-timeago";

interface UserProfileClientProps {
  profile: IUserProfile;
  isOwnProfile: boolean;
  currentUserId?: string;
}

export default function UserProfileClient({ 
  profile, 
  isOwnProfile, 
  currentUserId 
}: UserProfileClientProps) {
  const { user: _user } = useUser();
  const [isFollowing, setIsFollowing] = useState(profile.is_following);
  const [followersCount, setFollowersCount] = useState(profile.followers_count || 0);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: profile.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowersCount(prev => data.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = () => {
    window.location.href = `/messages?user=${profile.id}`;
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
  <div className="surface-card glow overflow-hidden">
        {/* Cover/Header Section */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="p-8 -mt-16">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-end space-x-6">
              <Avatar className="h-32 w-32 border-4 border-[#18181b]">
                <AvatarImage src={profile.image_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.first_name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined <ReactTimeago date={new Date(profile.created_at)} />
                    </span>
                  </div>
                  {profile.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!isOwnProfile && currentUserId && (
              <div className="flex space-x-3">
                <Button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  className={`px-6 py-2 ${
                    isFollowing 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                
                {profile.can_message && (
                  <Button
                    onClick={handleMessageUser}
                    variant="outline"
                    className="px-6 py-2 border-[#3f3f46] text-gray-300 hover:text-white hover:bg-[#3f3f46]"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium">{profile.posts_count}</span>
              <span className="text-gray-400">Posts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium">{followersCount}</span>
              <span className="text-gray-400">Followers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium">{profile.following_count}</span>
              <span className="text-gray-400">Following</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium">{profile.education.length}</span>
              <span className="text-gray-400">Education</span>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
  <div className="surface-card glow p-8">
        <EducationSection 
          education={profile.education}
          isOwnProfile={isOwnProfile}
          userId={profile.id}
        />
      </div>

      {/* Recent Activity Placeholder */}
  <div className="surface-card glow p-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Recent posts and activity will appear here</p>
        </div>
      </div>
    </div>
  );
}