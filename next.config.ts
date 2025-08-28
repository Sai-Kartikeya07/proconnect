import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "links.papareact.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
            {
        protocol: "https",
        hostname: "newdbms1.blob.core.windows.net",
      },
    ],
  },
}

export default nextConfig;
