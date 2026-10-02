/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  basePath: "/E-portfolio",
  trailingSlash: true,
  images: {
    unoptimized: false,
    deviceSizes: [320, 480, 640, 768, 960, 1200],
    imageSizes: [160, 240],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};
export default config;
