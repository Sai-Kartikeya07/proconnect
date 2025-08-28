import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d0d0f] to-[#18181b]">
      <div className="w-full max-w-sm lg:w-96 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-white text-lg font-medium">Completing authentication...</div>
        <div className="text-gray-400 text-sm mt-2">Please wait while we process your request</div>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
