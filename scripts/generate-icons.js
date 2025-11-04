#!/usr/bin/env node

/**
 * Icon generation script for PWA
 * Generates PNG icons in various sizes using sharp
 */

const fs = require("fs");
const path = require("path");

async function generateIcons() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch (error) {
    console.error(
      "Error: sharp is not installed. Please install it with: npm install --save-dev sharp"
    );
    process.exit(1);
  }

  const iconsDir = path.join(__dirname, "..", "public", "icons");

  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Icon sizes to generate
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  // Generate regular icons
  for (const size of sizes) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#171717"/>
  <text x="${size / 2}" y="${size / 2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">JC</text>
</svg>`;

    const filename = `icon-${size}x${size}.png`;
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, filename));

    console.log(`Generated ${filename}`);
  }

  // Generate maskable icon (with rounded corners and padding)
  const maskableSize = 512;
  const padding = maskableSize * 0.1;
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maskableSize}" height="${maskableSize}" viewBox="0 0 ${maskableSize} ${maskableSize}">
  <rect width="${maskableSize}" height="${maskableSize}" fill="#171717" rx="${maskableSize * 0.2}"/>
  <text x="${maskableSize / 2}" y="${maskableSize / 2}" font-family="Arial, sans-serif" font-size="${(maskableSize - padding * 2) * 0.3}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">JC</text>
</svg>`;

  await sharp(Buffer.from(maskableSvg))
    .png()
    .toFile(path.join(iconsDir, "maskable-icon-512x512.png"));

  console.log(`Generated maskable-icon-512x512.png`);

  console.log("\n✅ All icons generated successfully!");
  console.log(
    "\n💡 Tip: For production, replace these placeholder icons with professionally designed icons."
  );
}

// Run the script
generateIcons().catch((error) => {
  console.error("Error generating icons:", error);
  process.exit(1);
});
