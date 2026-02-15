#!/bin/bash
set -e

# Foccus Build Script
# Supports: Linux, macOS, Windows (via Git Bash/WSL)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Linux*)  echo "linux" ;;
        Darwin*) echo "macos" ;;
        MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
        *)       echo "unknown" ;;
    esac
}

# Detect Linux distribution
detect_linux_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

# Check if command exists
has_cmd() {
    command -v "$1" &> /dev/null
}

# Install Rust
install_rust() {
    if has_cmd rustc; then
        print_info "Rust: $(rustc --version)"
        return 0
    fi
    print_step "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
}

# Install Bun
install_bun() {
    if has_cmd bun; then
        print_info "Bun: $(bun --version)"
        return 0
    fi
    print_step "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
}

# Install dependencies based on OS
install_deps() {
    local os=$(detect_os)
    print_info "Detected OS: $os"

    case $os in
        linux)
            install_linux_deps
            ;;
        macos)
            install_macos_deps
            ;;
        windows)
            install_windows_deps
            ;;
        *)
            print_error "Unsupported OS"
            exit 1
            ;;
    esac

    install_rust
    install_bun
}

install_linux_deps() {
    local distro=$(detect_linux_distro)
    print_step "Installing dependencies for $distro..."

    case $distro in
        fedora|rhel|centos)
            sudo dnf install -y \
                webkit2gtk4.1-devel gtk3-devel libayatana-appindicator-gtk3-devel \
                alsa-lib-devel curl wget file openssl-devel librsvg2-devel \
                gcc gcc-c++ make
            ;;
        ubuntu|debian|linuxmint|pop)
            sudo apt update
            sudo apt install -y \
                libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev \
                libasound2-dev curl wget file libssl-dev librsvg2-dev \
                build-essential
            ;;
        arch|manjaro|endeavouros)
            sudo pacman -Syu --noconfirm \
                webkit2gtk-4.1 gtk3 libayatana-appindicator alsa-lib \
                curl wget file openssl librsvg base-devel
            ;;
        opensuse*|suse*)
            sudo zypper install -y \
                webkit2gtk3-devel gtk3-devel libayatana-appindicator3-1 \
                alsa-devel curl wget file libopenssl-devel librsvg-devel \
                gcc gcc-c++ make
            ;;
        *)
            print_warn "Unknown distribution: $distro"
            print_warn "Please install: webkit2gtk-4.1, gtk3, libayatana-appindicator, alsa-lib, openssl"
            ;;
    esac
}

install_macos_deps() {
    print_step "Checking macOS dependencies..."
    
    if ! has_cmd brew; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Xcode command line tools
    if ! xcode-select -p &> /dev/null; then
        print_step "Installing Xcode Command Line Tools..."
        xcode-select --install
    fi
}

install_windows_deps() {
    print_step "Checking Windows dependencies..."
    
    # Check for Visual Studio Build Tools
    if ! has_cmd cl; then
        print_warn "Visual Studio Build Tools required"
        print_warn "Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
        print_warn "Select 'Desktop development with C++' workload"
    fi
    
    # Check for WebView2
    print_info "Note: WebView2 Runtime is required (usually pre-installed on Windows 10/11)"
}

# Build the application
build_app() {
    local os=$(detect_os)
    local target=${1:-""}

    print_step "Installing npm dependencies..."
    bun install

    print_step "Building Foccus..."
    
    if [ -n "$target" ]; then
        bun run tauri build --bundles "$target"
    else
        # Default bundles based on OS
        case $os in
            linux)
                bun run tauri build --bundles deb,rpm
                ;;
            macos)
                bun run tauri build --bundles dmg,app
                ;;
            windows)
                bun run tauri build --bundles msi,nsis
                ;;
        esac
    fi

    echo ""
    print_info "Build complete!"
    print_info "Packages location: src-tauri/target/release/bundle/"
    ls -la src-tauri/target/release/bundle/*/* 2>/dev/null || true
}

# Help
show_help() {
    echo "Foccus Build Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  deps              Install build dependencies only"
    echo "  build [target]    Build the application"
    echo "  all [target]      Install dependencies and build"
    echo "  help              Show this help"
    echo ""
    echo "Build targets:"
    echo "  Linux:   deb, rpm, appimage"
    echo "  macOS:   dmg, app"
    echo "  Windows: msi, nsis"
    echo ""
    echo "Examples:"
    echo "  $0 deps           # Install dependencies"
    echo "  $0 build          # Build with default targets"
    echo "  $0 build deb      # Build .deb only"
    echo "  $0 all            # Full setup and build"
}

# Main
main() {
    local cmd=${1:-"help"}

    case $cmd in
        deps)
            install_deps
            ;;
        build)
            shift || true
            build_app "$@"
            ;;
        all)
            shift || true
            install_deps
            build_app "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $cmd"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
