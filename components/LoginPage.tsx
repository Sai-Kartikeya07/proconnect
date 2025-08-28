'use client'

import { Users, MessageCircle, Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to <span className="text-blue-500">ProConnect</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Connect, share, and engage with your community. Join thousands of users sharing their thoughts and experiences.
            </p>
            
            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Users className="text-blue-500" size={20} />
                <span className="text-gray-300">Connect with friends and communities</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="text-blue-500" size={20} />
                <span className="text-gray-300">Share your thoughts and stories</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="text-blue-500" size={20} />
                <span className="text-gray-300">Engage with meaningful content</span>
              </div>
              <div className="flex items-center space-x-3">
                <Share2 className="text-blue-500" size={20} />
                <span className="text-gray-300">Build your digital presence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login CTA */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 lg:w-1/2">
        <div className="w-full max-w-sm lg:w-96 text-center">
          <div className="bg-[#18181b] rounded-2xl p-8 border border-[#3f3f46] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Connect?</h2>
            <p className="text-gray-400 mb-8">
              Join the ProConnect community and start sharing your stories with the world.
            </p>
            
            <Button 
              onClick={() => router.push('/sign-in')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mb-4"
            >
              Sign In to ProConnect
            </Button>
            
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <span 
                onClick={() => router.push('/sign-up')}
                className="text-blue-500 cursor-pointer hover:text-blue-400 font-medium"
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
