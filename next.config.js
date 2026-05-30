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
      const dest1 = path.join(__dirname, '.next/server/chunks/data');
      const dest2 = path.join(__dirname, '.next/server/vendor-chunks/data');
      if (!fs.existsSync(dest1)) {
        fs.mkdirSync(dest1, { recursive: true });
        fs.cpSync(src, dest1, { recursive: true });
        console.log('[CopyPdfkitFonts] Copied pdfkit font files to', dest1);
      }
      if (!fs.existsSync(dest2)) {
        fs.mkdirSync(dest2, { recursive: true });
        fs.cpSync(src, dest2, { recursive: true });
        console.log('[CopyPdfkitFonts] Copied pdfkit font files to', dest2);
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