#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        DISTRO_FAMILY=$ID_LIKE
    elif [ -f /etc/fedora-release ]; then
        DISTRO="fedora"
    elif [ -f /etc/debian_version ]; then
        DISTRO="debian"
    else
        DISTRO="unknown"
    fi
    echo $DISTRO
}

# Install dependencies based on distro
install_deps() {
    local distro=$(detect_distro)
    print_info "Detected distribution: $distro"

    case $distro in
        fedora|rhel|centos)
            print_info "Installing dependencies for Fedora/RHEL..."
            sudo dnf install -y \
                webkit2gtk4.1-devel \
                gtk3-devel \
                libayatana-appindicator-gtk3-devel \
                alsa-lib-devel \
                curl \
                wget \
                file \
                openssl-devel \
                librsvg2-devel \
                gcc \
                gcc-c++ \
                make
            ;;
        ubuntu|debian|linuxmint|pop)
            print_info "Installing dependencies for Ubuntu/Debian..."
            sudo apt update
            sudo apt install -y \
                libwebkit2gtk-4.1-dev \
                libgtk-3-dev \
                libayatana-appindicator3-dev \
                libasound2-dev \
                curl \
                wget \
                file \
                libssl-dev \
                librsvg2-dev \
                build-essential
            ;;
        arch|manjaro|endeavouros)
            print_info "Installing dependencies for Arch Linux..."
            sudo pacman -Syu --noconfirm \
                webkit2gtk-4.1 \
                gtk3 \
                libayatana-appindicator \
                alsa-lib \
                curl \
                wget \
                file \
                openssl \
                librsvg \
                base-devel
            ;;
        opensuse*|suse*)
            print_info "Installing dependencies for openSUSE..."
            sudo zypper install -y \
                webkit2gtk3-devel \
                gtk3-devel \
                libayatana-appindicator3-1 \
                alsa-devel \
                curl \
                wget \
                file \
                libopenssl-devel \
                librsvg-devel \
                gcc \
                gcc-c++ \
                make
            ;;
        *)
            print_warn "Unknown distribution: $distro"
            print_warn "Please install the following dependencies manually:"
            echo "  - webkit2gtk (4.1)"
            echo "  - gtk3"
            echo "  - libayatana-appindicator"
            echo "  - alsa-lib"
            echo "  - openssl"
            echo "  - librsvg"
            return 1
            ;;
    esac
}

# Check if Rust is installed
check_rust() {
    if ! command -v rustc &> /dev/null; then
        print_info "Rust not found. Installing..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    else
        print_info "Rust is installed: $(rustc --version)"
    fi
}

# Check if Bun is installed
check_bun() {
    if ! command -v bun &> /dev/null; then
        print_info "Bun not found. Installing..."
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
    else
        print_info "Bun is installed: $(bun --version)"
    fi
}

# Build the application
build_app() {
    local target=${1:-"all"}
    
    print_info "Installing npm dependencies..."
    bun install

    print_info "Building Foccus..."
    
    case $target in
        deb)
            bun run tauri build --bundles deb
            ;;
        rpm)
            bun run tauri build --bundles rpm
            ;;
        all)
            bun run tauri build --bundles deb,rpm
            ;;
        *)
            print_error "Unknown target: $target"
            echo "Available targets: deb, rpm, all"
            return 1
            ;;
    esac

    print_info "Build complete!"
    echo ""
    print_info "Built packages:"
    ls -la src-tauri/target/release/bundle/deb/*.deb 2>/dev/null || true
    ls -la src-tauri/target/release/bundle/rpm/*.rpm 2>/dev/null || true
}

# Main
main() {
    local command=${1:-"build"}
    
    case $command in
        deps)
            install_deps
            check_rust
            check_bun
            ;;
        build)
            shift || true
            build_app "$@"
            ;;
        all)
            install_deps
            check_rust
            check_bun
            shift || true
            build_app "$@"
            ;;
        *)
            echo "Foccus Build Script"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  deps          Install build dependencies"
            echo "  build [target] Build the application (targets: deb, rpm, all)"
            echo "  all [target]   Install deps and build"
            echo ""
            echo "Examples:"
            echo "  $0 deps        # Install dependencies only"
            echo "  $0 build       # Build all packages"
            echo "  $0 build deb   # Build .deb only"
            echo "  $0 all rpm     # Install deps and build .rpm"
            ;;
    esac
}

main "$@"
