# 3WT App Icons Guide

This document explains the icon setup for the 3WT app and how to replace the placeholder icons with your final designs.

## Current Setup

All placeholder icons have been generated with a purple gradient design featuring "3WT" text. These are ready to use for development and can be replaced with your final design at any time.

## Icon Locations

### Source Files (SVG)
Edit these to change the icon design:
- `assets/svg/icon-source.svg` - Main app icon source
- `assets/svg/adaptive-icon-foreground.svg` - Android adaptive icon foreground

### Generated Icons

#### Main Icons (Required by Expo)
- `assets/icon.png` (1024x1024) - Main app icon
- `assets/adaptive-icon.png` (1024x1024) - Android adaptive foreground
- `assets/splash-icon.png` (1024x1024) - Splash screen
- `assets/favicon.png` (192x192) - Web favicon

#### iOS Icons
Location: `assets/ios/`

| File | Size | Purpose |
|------|------|---------|
| Icon-1024.png | 1024x1024 | App Store |
| Icon-180.png | 180x180 | iPhone 3x |
| Icon-167.png | 167x167 | iPad Pro |
| Icon-152.png | 152x152 | iPad 2x |
| Icon-120.png | 120x120 | iPhone 2x |
| Icon-87.png | 87x87 | Settings 3x |
| Icon-80.png | 80x80 | Spotlight 2x |
| Icon-76.png | 76x76 | iPad 1x |
| Icon-60.png | 60x60 | iPhone 1x |
| Icon-58.png | 58x58 | Settings 2x |
| Icon-40.png | 40x40 | Spotlight 1x |
| Icon-29.png | 29x29 | Settings 1x |

#### Android Icons
Location: `assets/android/mipmap-*/`

| Density | Size | Files |
|---------|------|-------|
| mdpi | 48x48 | ic_launcher.png, ic_launcher_foreground.png |
| hdpi | 72x72 | ic_launcher.png, ic_launcher_foreground.png |
| xhdpi | 96x96 | ic_launcher.png, ic_launcher_foreground.png |
| xxhdpi | 144x144 | ic_launcher.png, ic_launcher_foreground.png |
| xxxhdpi | 192x192 | ic_launcher.png, ic_launcher_foreground.png |

## How to Replace Icons

### Option 1: Edit SVG and Regenerate (Recommended)

1. **Edit the source SVG files** in `assets/svg/`:
   - `icon-source.svg` - Your main app icon design
   - `adaptive-icon-foreground.svg` - Android adaptive icon (optional)

2. **Regenerate all icons**:
   ```bash
   make icons
   # or
   npm run generate-icons
   ```

3. **Test on devices**:
   ```bash
   make ios
   make android
   ```

### Option 2: Replace PNG Files Manually

1. **Create your design at 1024x1024 pixels**
2. **Replace the main source files**:
   - `assets/icon.png`
   - `assets/adaptive-icon.png`
   - `assets/splash-icon.png`

3. **Expo will automatically generate platform-specific sizes** when you build

### Option 3: Use Design Tool Export

If using Figma, Sketch, or Adobe XD:

1. **Export your icon at these sizes**:
   - 1024x1024 for main icon
   - All iOS sizes (see table above)
   - All Android densities (see table above)

2. **Replace files in their respective directories**

## Icon Design Guidelines

### General Requirements
- **Minimum size**: 1024x1024 pixels
- **Format**: PNG (24-bit) or SVG
- **Color space**: RGB
- **No transparency** for iOS (use solid background)
- **Transparency allowed** for Android adaptive icons

### iOS Guidelines
- **No rounded corners** - iOS applies them automatically
- **Full bleed** - Design edge to edge
- **Simple design** - Works at small sizes (29x29)
- **No text** that's hard to read when small
- **High contrast** for visibility

### Android Adaptive Icon Guidelines
- **Safe zone**: Keep important content within center 66% circle
- **Outer 17%** may be masked/cropped by different launchers
- **Foreground**: Your icon design (can have transparency)
- **Background**: Solid color or simple pattern
- **Test**: Different launcher shapes (circle, squircle, rounded square)

### Visual Examples

```
Android Adaptive Icon Safe Zones:
┌─────────────────────────┐
│ ┌─────────────────────┐ │ ← Viewport (100%)
│ │   ┌───────────┐     │ │
│ │   │  CONTENT  │     │ │ ← Safe zone (66%)
│ │   └───────────┘     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Icon Specifications by Platform

### iOS App Store
- **Size**: 1024x1024
- **Format**: PNG (no transparency)
- **Color space**: RGB
- **Shape**: Square (no rounded corners)

### Android Play Store
- **Size**: 512x512
- **Format**: PNG (32-bit)
- **Shape**: Square with rounded corners acceptable

### PWA (Web)
- **Sizes**: 192x192, 512x512
- **Format**: PNG
- **Transparent background**: Optional

## Color Scheme

Current placeholder uses:
- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Dark Purple)
- **Gradient**: Linear from primary to secondary
- **Text**: #ffffff (White)

## Regenerating Icons

### Using Make
```bash
# Install dependencies (if not already installed)
make icons-install

# Generate all icons
make icons

# Check generation was successful
ls -la assets/ios/
ls -la assets/android/
```

### Using npm
```bash
# Install sharp (if not already installed)
npm install --save-dev sharp

# Run generation script
npm run generate-icons
# or
node scripts/generate-icons.js
```

## Troubleshooting

### Icons not showing in app
1. Clear cache: `make clean`
2. Rebuild: `expo prebuild --clean`
3. Restart Metro: `make stop-metro && make start`

### Wrong colors/appearance
1. Check `app.json` background colors match your design
2. For Android adaptive icons, verify backgroundColor in app.json

### Blurry icons
1. Ensure source is at least 1024x1024
2. Use PNG-24 (not PNG-8)
3. Disable any compression during export

### Icons cut off on Android
1. Keep content within 66% safe zone for adaptive icons
2. Test with different launcher shapes

## Testing Icons

### Preview on iOS Simulator
```bash
make ios
```

### Preview on Android Emulator
```bash
make android
```

### Preview Different Launcher Shapes (Android)
1. Long-press home screen
2. Try different launcher apps (Nova, Pixel Launcher, etc.)
3. Check: Circle, Squircle, Rounded Square, Teardrop

## Automated Icon Generation

The generation script (`scripts/generate-icons.js`) automatically:
1. ✅ Reads SVG source files
2. ✅ Generates all iOS sizes (12 files)
3. ✅ Generates all Android densities (10 files)
4. ✅ Creates adaptive icon variants
5. ✅ Optimizes PNG output

Total: **26 icon files** generated from 2 SVG sources.

## Resources

### Design Tools
- **Figma**: [Icon Template](https://www.figma.com/community/file/1057986008956801960)
- **Sketch**: Use built-in iOS/Android templates
- **Adobe XD**: App icon artboards

### Icon Generators
- [App Icon Generator](https://www.appicon.co/)
- [Icon Slayer](https://www.gieson.com/Library/projects/utilities/icon_slayer/)
- [Expo Asset Generator](https://docs.expo.dev/guides/app-icons/)

### Validation Tools
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [iOS Icon Validator](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## Questions?

If you encounter issues:
1. Check the [Expo Icons Documentation](https://docs.expo.dev/guides/app-icons/)
2. Review `app.json` configuration
3. Run `make icons` to regenerate
4. Clear cache with `make clean`

---

**Last Updated**: 2025-12-14
**Script Version**: 1.0.0
