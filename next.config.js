/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desabilitar ESLint durante o build
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 