#!/bin/bash
set -e

echo "🔨 Building Foccus..."

# Build the app
bun run tauri build

echo "✅ Build complete!"
echo ""
echo "📦 Built packages:"

# Define paths
BUNDLE_DIR="src-tauri/target/release/bundle"

# Find built files
DEB_FILE=$(find $BUNDLE_DIR/deb -name "*.deb" 2>/dev/null | head -n 1)
RPM_FILE=$(find $BUNDLE_DIR/rpm -name "*.rpm" 2>/dev/null | head -n 1)
APPIMAGE_FILE=$(find $BUNDLE_DIR/appimage -name "*.AppImage" 2>/dev/null | head -n 1)

# Sign RPM
if [ -n "$RPM_FILE" ]; then
    echo "🔐 Signing RPM package..."
    rpm --addsign "$RPM_FILE"
    echo "✅ RPM signed: $RPM_FILE"
    
    # Verify signature
    echo "🔍 Verifying RPM signature..."
    rpm --checksig "$RPM_FILE"
fi

# Sign DEB
if [ -n "$DEB_FILE" ]; then
    echo "🔐 Signing DEB package..."
    dpkg-sig --sign builder "$DEB_FILE" 2>/dev/null || {
        echo "⚠️  Note: dpkg-sig not installed. DEB not signed."
        echo "   Install with: sudo dnf install dpkg-sig"
    }
    [ -f "$DEB_FILE" ] && echo "✅ DEB: $DEB_FILE"
fi

# Sign AppImage
if [ -n "$APPIMAGE_FILE" ]; then
    echo "🔐 Creating GPG signature for AppImage..."
    gpg --detach-sign --armor "$APPIMAGE_FILE"
    echo "✅ AppImage signed: $APPIMAGE_FILE"
    echo "✅ Signature: $APPIMAGE_FILE.asc"
fi

echo ""
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ -n "$RPM_FILE" ] && echo "RPM:      $RPM_FILE"
[ -n "$DEB_FILE" ] && echo "DEB:      $DEB_FILE"
[ -n "$APPIMAGE_FILE" ] && echo "AppImage: $APPIMAGE_FILE"
[ -f "$APPIMAGE_FILE.asc" ] && echo "Signature: $APPIMAGE_FILE.asc"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Upload these files to GitHub Releases"