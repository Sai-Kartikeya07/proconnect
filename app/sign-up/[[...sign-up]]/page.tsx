import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const appearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-transparent shadow-none p-0",
      headerTitle: "text-white text-2xl font-bold text-center mb-2",
      headerSubtitle: "text-gray-400 text-center mb-6",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors w-full",
      formFieldInput: "bg-[#27272a] border-[#3f3f46] text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-lg",
      formFieldLabel: "text-gray-300 font-medium",
      dividerLine: "bg-[#3f3f46]",
      dividerText: "text-gray-400",
      socialButtonsBlockButton: "bg-[#27272a] border-[#3f3f46] text-white hover:bg-[#3f3f46] transition-colors rounded-lg",
      footerActionLink: "text-blue-500 hover:text-blue-400 font-medium",
      footerActionText: "text-gray-400"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d0d0f] to-[#18181b]">
      <div className="w-full max-w-sm lg:w-96">
        <SignUp appearance={appearance} />
      </div>
    </div>
  );
}
