#!/bin/bash
set -e

# Foccus Universal Install Script
# Supports: Linux (Fedora, Ubuntu, Arch, etc.), macOS, Windows (via Git Bash/WSL)

VERSION="0.1.0"
REPO="idityaGE/foccus"
REPO_URL="https://github.com/${REPO}.git"

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
    elif [ -f /etc/fedora-release ]; then
        echo "fedora"
    elif [ -f /etc/debian_version ]; then
        echo "debian"
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
        print_info "Rust already installed: $(rustc --version)"
        return 0
    fi
    print_step "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
}

# Install Bun
install_bun() {
    if has_cmd bun; then
        print_info "Bun already installed: $(bun --version)"
        return 0
    fi
    print_step "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
}

# Install Linux dependencies
install_linux_deps() {
    local distro=$(detect_linux_distro)
    print_step "Installing build dependencies for $distro..."

    case $distro in
        fedora|rhel|centos)
            sudo dnf install -y \
                webkit2gtk4.1-devel gtk3-devel libayatana-appindicator-gtk3-devel \
                alsa-lib-devel curl wget file openssl-devel librsvg2-devel \
                gcc gcc-c++ make git
            ;;
        ubuntu|debian|linuxmint|pop)
            sudo apt update
            sudo apt install -y \
                libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev \
                libasound2-dev curl wget file libssl-dev librsvg2-dev \
                build-essential git
            ;;
        arch|manjaro|endeavouros)
            sudo pacman -Syu --noconfirm \
                webkit2gtk-4.1 gtk3 libayatana-appindicator alsa-lib \
                curl wget file openssl librsvg base-devel git
            ;;
        opensuse*|suse*)
            sudo zypper install -y \
                webkit2gtk3-devel gtk3-devel libayatana-appindicator3-1 \
                alsa-devel curl wget file libopenssl-devel librsvg-devel \
                gcc gcc-c++ make git
            ;;
        *)
            print_warn "Unknown distro. Please install dependencies manually."
            print_warn "Required: webkit2gtk-4.1, gtk3, libayatana-appindicator, alsa-lib, openssl"
            return 1
            ;;
    esac
}

# Install macOS dependencies
install_macos_deps() {
    print_step "Installing macOS dependencies..."
    
    if ! has_cmd brew; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install git curl
}

# Install Windows dependencies (via Chocolatey or manual)
install_windows_deps() {
    print_step "Installing Windows dependencies..."
    
    if has_cmd choco; then
        choco install git nodejs -y
    else
        print_warn "Please install manually:"
        echo "  - Git: https://git-scm.com/download/win"
        echo "  - Node.js: https://nodejs.org/"
        echo "  - Visual Studio Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
        return 1
    fi
}

# Build from source
build_from_source() {
    local tmp_dir=$(mktemp -d)
    print_step "Cloning repository to $tmp_dir..."
    
    git clone --depth 1 "$REPO_URL" "$tmp_dir/foccus"
    cd "$tmp_dir/foccus"
    
    print_step "Installing npm dependencies..."
    bun install
    
    print_step "Building Foccus..."
    bun run tauri build
    
    echo ""
    print_info "Build complete!"
    print_info "Built packages are in: $tmp_dir/foccus/src-tauri/target/release/bundle/"
    
    # Return the path for potential installation
    echo "$tmp_dir/foccus"
}

# Download and install from release (Linux only)
install_from_release() {
    local distro=$(detect_linux_distro)
    local pkg_name=""
    local pkg_url=""
    local install_cmd=""

    case $distro in
        fedora|rhel|centos|opensuse*|suse*)
            pkg_name="foccus-${VERSION}-1.x86_64.rpm"
            pkg_url="https://github.com/${REPO}/releases/download/v${VERSION}/${pkg_name}"
            if [ "$distro" = "opensuse" ] || [ "$distro" = "suse" ]; then
                install_cmd="sudo zypper install -y"
            else
                install_cmd="sudo dnf install -y"
            fi
            ;;
        ubuntu|debian|linuxmint|pop)
            pkg_name="foccus_${VERSION}_amd64.deb"
            pkg_url="https://github.com/${REPO}/releases/download/v${VERSION}/${pkg_name}"
            install_cmd="sudo apt install -y"
            ;;
        *)
            return 1  # No release available, need to build
            ;;
    esac

    print_step "Downloading $pkg_name..."
    local tmp_dir=$(mktemp -d)
    curl -fSL "$pkg_url" -o "$tmp_dir/$pkg_name"
    
    print_step "Installing..."
    $install_cmd "$tmp_dir/$pkg_name"
    
    rm -rf "$tmp_dir"
    print_info "Foccus installed successfully!"
    print_info "Run 'foccus' to start."
}

# Main install function
install_foccus() {
    local os=$(detect_os)
    print_info "Detected OS: $os"

    case $os in
        linux)
            local distro=$(detect_linux_distro)
            print_info "Detected distribution: $distro"
            
            # Check if we can install from release
            case $distro in
                fedora|rhel|centos|ubuntu|debian|linuxmint|pop|opensuse*|suse*)
                    print_info "Pre-built package available for $distro"
                    install_from_release
                    ;;
                *)
                    print_info "No pre-built package for $distro, building from source..."
                    install_linux_deps
                    install_rust
                    install_bun
                    local build_dir=$(build_from_source)
                    echo ""
                    print_warn "Please install the built package manually from:"
                    echo "  $build_dir/src-tauri/target/release/bundle/"
                    ;;
            esac
            ;;
        macos)
            print_info "Building from source for macOS..."
            install_macos_deps
            install_rust
            install_bun
            local build_dir=$(build_from_source)
            
            # Install the .app bundle
            local app_path="$build_dir/src-tauri/target/release/bundle/macos/Foccus.app"
            if [ -d "$app_path" ]; then
                print_step "Installing to /Applications..."
                cp -r "$app_path" /Applications/
                print_info "Foccus installed to /Applications/Foccus.app"
            else
                print_warn "Please install manually from: $build_dir/src-tauri/target/release/bundle/"
            fi
            ;;
        windows)
            print_info "Building from source for Windows..."
            install_windows_deps
            install_rust
            install_bun
            local build_dir=$(build_from_source)
            
            print_info "Build complete!"
            print_warn "Please install the .msi or .exe from:"
            echo "  $build_dir/src-tauri/target/release/bundle/"
            ;;
        *)
            print_error "Unsupported operating system"
            exit 1
            ;;
    esac
}

# Uninstall function
uninstall_foccus() {
    local os=$(detect_os)

    case $os in
        linux)
            local distro=$(detect_linux_distro)
            case $distro in
                fedora|rhel|centos)
                    sudo dnf remove -y foccus
                    ;;
                ubuntu|debian|linuxmint|pop)
                    sudo apt remove -y foccus
                    ;;
                opensuse*|suse*)
                    sudo zypper remove -y foccus
                    ;;
                *)
                    print_warn "Please uninstall manually"
                    ;;
            esac
            ;;
        macos)
            rm -rf /Applications/Foccus.app
            print_info "Removed /Applications/Foccus.app"
            ;;
        windows)
            print_warn "Please uninstall from Windows Settings > Apps"
            ;;
    esac
    print_info "Foccus uninstalled."
}

# Help
show_help() {
    echo "Foccus Universal Install Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install Foccus (default)"
    echo "  uninstall   Remove Foccus"
    echo "  help        Show this help"
    echo ""
    echo "Supported platforms:"
    echo "  Linux:   Fedora, Ubuntu, Debian, Arch, openSUSE, etc."
    echo "  macOS:   Intel and Apple Silicon"
    echo "  Windows: Via Git Bash, WSL, or native"
    echo ""
    echo "Examples:"
    echo "  curl -fsSL https://raw.githubusercontent.com/idityaGE/foccus/main/scripts/install.sh | bash"
    echo "  ./install.sh install"
    echo "  ./install.sh uninstall"
}

# Main
main() {
    local cmd=${1:-"install"}

    case $cmd in
        install)
            install_foccus
            ;;
        uninstall|remove)
            uninstall_foccus
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
