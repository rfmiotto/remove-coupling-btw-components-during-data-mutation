/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "cdn.fakercloud.com"],
  },
  experimental: {
    reactRoot: true,
  }
}

module.exports = nextConfig
