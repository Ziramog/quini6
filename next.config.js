/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

/**
 * Webpack plugin that copies pdfkit font files to the build output
 * after compilation completes (so webpack doesn't clean them up).
 */
class CopyPdfkitFontsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('CopyPdfkitFontsPlugin', (_, callback) => {
      const src = path.join(__dirname, 'node_modules/pdfkit/js/data');
      const dest = path.join(__dirname, '.next/server/chunks/data');
      if (!fs.existsSync(dest)) {
        fs.cpSync(src, dest, { recursive: true });
        console.log('[CopyPdfkitFonts] Copied pdfkit font files to', dest);
      }
      callback();
    });
  }
}

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new CopyPdfkitFontsPlugin());
    }
    return config;
  },
};

module.exports = nextConfig;