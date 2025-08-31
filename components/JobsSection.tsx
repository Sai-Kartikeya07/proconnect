"use client";
import React from "react";

function JobsSection() {
  // Placeholder for jobs info, can be replaced with dynamic data
  return (
    <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] overflow-hidden shadow-md mt-4">
      <div className="h-12 bg-gradient-to-r from-[#27272a] to-[#3f3f46] flex items-center justify-center">
        <span className="text-white font-semibold text-lg">Jobs</span>
      </div>
      <div className="px-4 py-4">
        <p className="text-[#a1a1aa] text-sm mb-2">No jobs posted yet.</p>
        {/* Add job listing, posting, or other job-related UI here */}
      </div>
    </div>
  );
}

export default JobsSection;
