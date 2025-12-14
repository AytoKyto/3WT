#!/usr/bin/env node

/**
 * Icon Generator Script for 3WT App
 *
 * Generates all required icon sizes for iOS, Android, and Web
 * from SVG source files using sharp.
 *
 * Usage:
 *   node scripts/generate-icons.js
 *   or
 *   make icons
 */

const fs = require('fs');
const path = require('path');

// Try to import sharp
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('\n❌ Error: sharp is not installed.');
  console.error('Please run: npm install --save-dev sharp');
  console.error('Or use: make icons-install\n');
  process.exit(1);
}

const PROJECT_ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');
const SVG_DIR = path.join(ASSETS_DIR, 'svg');

// Source files
const SOURCES = {
  icon: path.join(SVG_DIR, 'icon-source.svg'),
  adaptiveIcon: path.join(SVG_DIR, 'adaptive-icon-foreground.svg'),
};

// Output configurations
const OUTPUTS = {
  // Main source images (1024x1024)
  mainSources: [
    { input: 'icon', output: path.join(ASSETS_DIR, 'icon.png'), size: 1024 },
    { input: 'icon', output: path.join(ASSETS_DIR, 'splash-icon.png'), size: 1024 },
    { input: 'adaptiveIcon', output: path.join(ASSETS_DIR, 'adaptive-icon.png'), size: 1024 },
  ],

  // Web favicons
  web: [
    { input: 'icon', output: path.join(ASSETS_DIR, 'favicon.png'), size: 192 },
  ],

  // iOS icons (all required sizes)
  ios: [
    { size: 1024, name: 'Icon-1024.png' },
    { size: 180, name: 'Icon-180.png' },   // iPhone 3x
    { size: 167, name: 'Icon-167.png' },   // iPad Pro
    { size: 152, name: 'Icon-152.png' },   // iPad 2x
    { size: 120, name: 'Icon-120.png' },   // iPhone 2x
    { size: 87, name: 'Icon-87.png' },     // Settings 3x
    { size: 80, name: 'Icon-80.png' },     // Spotlight 2x
    { size: 76, name: 'Icon-76.png' },     // iPad 1x
    { size: 60, name: 'Icon-60.png' },     // iPhone 1x
    { size: 58, name: 'Icon-58.png' },     // Settings 2x
    { size: 40, name: 'Icon-40.png' },     // Spotlight 1x
    { size: 29, name: 'Icon-29.png' },     // Settings 1x
  ],

  // Android icons (all densities)
  android: [
    { size: 192, density: 'xxxhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 72, density: 'hdpi' },
    { size: 48, density: 'mdpi' },
  ],
};

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate a PNG from SVG source
 */
async function generateIcon(svgPath, outputPath, size, options = {}) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'contain',
        background: options.background || { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error.message);
    return false;
  }
}

/**
 * Main generation function
 */
async function generateAllIcons() {
  console.log('🎨 3WT Icon Generator\n');
  console.log('━'.repeat(50));

  // Check if source files exist
  for (const [key, sourcePath] of Object.entries(SOURCES)) {
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Source file not found: ${sourcePath}`);
      process.exit(1);
    }
  }

  let successCount = 0;
  let totalCount = 0;

  // 1. Generate main source images
  console.log('\n📦 Generating main source images (1024x1024)...');
  for (const config of OUTPUTS.mainSources) {
    totalCount++;
    const sourceSvg = SOURCES[config.input];
    const success = await generateIcon(sourceSvg, config.output, config.size);
    if (success) {
      successCount++;
      console.log(`  ✓ ${path.basename(config.output)}`);
    }
  }

  // 2. Generate web favicons
  console.log('\n🌐 Generating web favicons...');
  for (const config of OUTPUTS.web) {
    totalCount++;
    const sourceSvg = SOURCES[config.input];
    const success = await generateIcon(sourceSvg, config.output, config.size);
    if (success) {
      successCount++;
      console.log(`  ✓ ${path.basename(config.output)} (${config.size}x${config.size})`);
    }
  }

  // 3. Generate iOS icons
  console.log('\n🍎 Generating iOS icons...');
  const iosDir = path.join(ASSETS_DIR, 'ios');
  ensureDir(iosDir);

  for (const config of OUTPUTS.ios) {
    totalCount++;
    const outputPath = path.join(iosDir, config.name);
    const success = await generateIcon(SOURCES.icon, outputPath, config.size);
    if (success) {
      successCount++;
      console.log(`  ✓ ${config.name} (${config.size}x${config.size})`);
    }
  }

  // 4. Generate Android icons
  console.log('\n🤖 Generating Android icons...');
  for (const config of OUTPUTS.android) {
    const densityDir = path.join(ASSETS_DIR, 'android', `mipmap-${config.density}`);
    ensureDir(densityDir);

    totalCount++;
    const outputPath = path.join(densityDir, 'ic_launcher.png');
    const success = await generateIcon(SOURCES.icon, outputPath, config.size);
    if (success) {
      successCount++;
      console.log(`  ✓ mipmap-${config.density}/ic_launcher.png (${config.size}x${config.size})`);
    }
  }

  // 5. Generate Android adaptive icon foreground
  console.log('\n🎯 Generating Android adaptive icons...');
  for (const config of OUTPUTS.android) {
    const densityDir = path.join(ASSETS_DIR, 'android', `mipmap-${config.density}`);
    ensureDir(densityDir);

    totalCount++;
    const outputPath = path.join(densityDir, 'ic_launcher_foreground.png');
    const success = await generateIcon(SOURCES.adaptiveIcon, outputPath, config.size);
    if (success) {
      successCount++;
      console.log(`  ✓ mipmap-${config.density}/ic_launcher_foreground.png (${config.size}x${config.size})`);
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log(`\n✅ Generated ${successCount}/${totalCount} icons successfully!`);

  if (successCount < totalCount) {
    console.log(`⚠️  ${totalCount - successCount} icon(s) failed to generate.`);
  }

  console.log('\n📁 Icon locations:');
  console.log(`   • Main icons: ${ASSETS_DIR}/`);
  console.log(`   • iOS icons: ${ASSETS_DIR}/ios/`);
  console.log(`   • Android icons: ${ASSETS_DIR}/android/mipmap-*/`);
  console.log(`   • Source SVGs: ${SVG_DIR}/\n`);
}

// Run the generator
generateAllIcons().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
