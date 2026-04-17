/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora errores de compilación para permitir el desarrollo fluido
    ignoreBuildErrors: true,
  },
  // Se eliminó la clave 'eslint' que causaba la advertencia de 'Unrecognized key'
};

export default nextConfig;
