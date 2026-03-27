/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      // DUPLICATE URL FIX (2026-03-23): 301 redirect old slug → canonical 2026 version
      {
        source: "/first-aid-kit-checklist",
        destination: "/first-aid-kit-checklist-2026",
        permanent: true,
      },
      {
        source: "/best-first-aid-kit-car",
        destination: "/best-first-aid-kit-for-car",
        permanent: true,
      },
      {
        source: "/best-first-aid-kit-home",
        destination: "/best-first-aid-kits-for-home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
