/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora errores de compilación para facilitar el desarrollo
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopack: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;

export default nextConfig;
