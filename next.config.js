/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'ui-avatars.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: '*.cloudinary.com' },
    ],
  },
}

module.exports = nextConfig
