#!/usr/bin/env node

/**
 * Generate placeholder PWA icons
 * Creates simple solid-color icons with text for development
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas if available, otherwise create SVG placeholders
let useCanvas = false;
let Canvas;

try {
  Canvas = require('canvas');
  useCanvas = true;
} catch (e) {
  console.log('canvas not available, creating SVG placeholders instead');
}

const sizes = [
  { size: 180, filename: 'icon-180.png', purpose: 'Apple Touch Icon' },
  { size: 192, filename: 'icon-192.png', purpose: 'Android Icon' },
  { size: 512, filename: 'icon-512.png', purpose: 'Android Splash' }
];

const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (useCanvas) {
  // Generate PNG icons using canvas
  sizes.forEach(({ size, filename, purpose }) => {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6'); // blue-600
    gradient.addColorStop(1, '#2563eb'); // blue-700
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw gift icon (simple box with bow)
    ctx.fillStyle = '#ffffff';
    const iconSize = size * 0.5;
    const x = (size - iconSize) / 2;
    const y = (size - iconSize) / 2;

    // Gift box
    ctx.fillRect(x, y + iconSize * 0.2, iconSize, iconSize * 0.8);

    // Ribbon vertical
    ctx.fillRect(x + iconSize * 0.4, y + iconSize * 0.2, iconSize * 0.2, iconSize * 0.8);

    // Bow
    ctx.beginPath();
    ctx.arc(x + iconSize * 0.3, y + iconSize * 0.15, iconSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + iconSize * 0.7, y + iconSize * 0.15, iconSize * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Save
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(iconsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`Created ${filename} (${size}x${size}) - ${purpose}`);
  });

  // Copy 180px as apple-touch-icon
  fs.copyFileSync(
    path.join(iconsDir, 'icon-180.png'),
    path.join(__dirname, '../public/apple-touch-icon.png')
  );
  console.log('Created apple-touch-icon.png');
} else {
  // Generate SVG placeholders
  sizes.forEach(({ size, filename, purpose }) => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <!-- Gift box -->
  <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.5}" height="${size * 0.4}" fill="white"/>
  <!-- Ribbon vertical -->
  <rect x="${size * 0.45}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.4}" fill="white"/>
  <!-- Bow left -->
  <circle cx="${size * 0.4}" cy="${size * 0.3}" r="${size * 0.075}" fill="white"/>
  <!-- Bow right -->
  <circle cx="${size * 0.6}" cy="${size * 0.3}" r="${size * 0.075}" fill="white"/>
</svg>`;

    const svgPath = path.join(iconsDir, filename.replace('.png', '.svg'));
    fs.writeFileSync(svgPath, svg);
    console.log(`Created ${filename.replace('.png', '.svg')} (${size}x${size}) - ${purpose}`);
  });

  // Copy SVG as apple-touch-icon
  fs.copyFileSync(
    path.join(iconsDir, 'icon-180.svg'),
    path.join(__dirname, '../public/apple-touch-icon.svg')
  );
  console.log('Created apple-touch-icon.svg');
  console.log('\nNote: SVG placeholders created. Install "canvas" package for PNG icons:');
  console.log('  pnpm add -D canvas');
}

console.log('\nPWA icons generated successfully!');
