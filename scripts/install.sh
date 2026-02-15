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

VERSION="0.1.0"
REPO="idityaGE/foccus"

# Detect distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo $ID
    elif [ -f /etc/fedora-release ]; then
        echo "fedora"
    elif [ -f /etc/debian_version ]; then
        echo "debian"
    else
        echo "unknown"
    fi
}

# Detect package manager and install
install_package() {
    local distro=$(detect_distro)
    print_info "Detected distribution: $distro"

    case $distro in
        fedora|rhel|centos)
            local pkg="foccus-${VERSION}-1.x86_64.rpm"
            local url="https://github.com/${REPO}/releases/download/v${VERSION}/${pkg}"
            print_info "Downloading $pkg..."
            curl -LO "$url"
            print_info "Installing..."
            sudo dnf install -y "./$pkg"
            rm -f "$pkg"
            ;;
        ubuntu|debian|linuxmint|pop)
            local pkg="foccus_${VERSION}_amd64.deb"
            local url="https://github.com/${REPO}/releases/download/v${VERSION}/${pkg}"
            print_info "Downloading $pkg..."
            curl -LO "$url"
            print_info "Installing..."
            sudo apt install -y "./$pkg"
            rm -f "$pkg"
            ;;
        arch|manjaro|endeavouros)
            print_warn "For Arch Linux, please install from AUR or build from source:"
            echo "  git clone https://github.com/${REPO}.git"
            echo "  cd foccus && ./scripts/build.sh all"
            return 1
            ;;
        opensuse*|suse*)
            local pkg="foccus-${VERSION}-1.x86_64.rpm"
            local url="https://github.com/${REPO}/releases/download/v${VERSION}/${pkg}"
            print_info "Downloading $pkg..."
            curl -LO "$url"
            print_info "Installing..."
            sudo zypper install -y "./$pkg"
            rm -f "$pkg"
            ;;
        *)
            print_error "Unsupported distribution: $distro"
            print_info "Please download the appropriate package from:"
            echo "  https://github.com/${REPO}/releases"
            return 1
            ;;
    esac

    print_info "Foccus installed successfully!"
    print_info "Run 'foccus' to start the application."
}

# Uninstall
uninstall_package() {
    local distro=$(detect_distro)

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
            print_error "Unsupported distribution: $distro"
            return 1
            ;;
    esac

    print_info "Foccus uninstalled."
}

# Main
main() {
    local command=${1:-"install"}

    case $command in
        install)
            install_package
            ;;
        uninstall|remove)
            uninstall_package
            ;;
        *)
            echo "Foccus Install Script"
            echo ""
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  install     Download and install Foccus"
            echo "  uninstall   Remove Foccus"
            echo ""
            ;;
    esac
}

main "$@"
