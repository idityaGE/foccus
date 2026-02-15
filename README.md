# Foccus

A minimal Pomodoro timer with a retro flip-clock display.

![Foccus Screenshot](.github/image0.png)
![Foccus Screenshot](.github/image1.png)
![Foccus Screenshot](.github/image2.png)

## Features

- Retro flip-clock animation
- Customizable work/break sessions
- Built-in presets (Classic Pomodoro, Short Focus, Deep Work)
- Desktop notifications with sound
- System tray integration
- Mini mode for a compact view
- Keyboard shortcuts
- Always-on-top option

## Installation

### One-Line Install (Linux/macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/idityaGE/foccus/main/scripts/install.sh | bash
```

This script automatically:
- **Fedora/Ubuntu/Debian/openSUSE** → Downloads pre-built package from releases
- **Arch/other Linux** → Installs dependencies and builds from source
- **macOS** → Installs dependencies and builds from source

### Manual Download (Linux)

Download from [Releases](https://github.com/idityaGE/foccus/releases):

| Distribution | Package | Install Command |
|--------------|---------|-----------------|
| Fedora, RHEL, openSUSE | `.rpm` | `sudo dnf install ./foccus-*.rpm` |
| Ubuntu, Debian, Mint | `.deb` | `sudo apt install ./foccus_*.deb` |

### Build from Source

Works on **Linux**, **macOS**, and **Windows**.

```bash
git clone https://github.com/idityaGE/foccus.git
cd foccus

# Option 1: Use the build script (installs deps + builds)
./scripts/build.sh all

# Option 2: Step by step
./scripts/build.sh deps    # Install dependencies
./scripts/build.sh build   # Build the app
```

<details>
<summary>Manual dependency installation</summary>

**Prerequisites:** [Rust](https://rustup.rs/), [Bun](https://bun.sh/)

**Fedora/RHEL:**
```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libayatana-appindicator-gtk3-devel \
    alsa-lib-devel curl wget file openssl-devel librsvg2-devel gcc gcc-c++ make
```

**Ubuntu/Debian:**
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev \
    libasound2-dev curl wget file libssl-dev librsvg2-dev build-essential
```

**Arch Linux:**
```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator alsa-lib \
    curl wget file openssl librsvg base-devel
```

**macOS:**
```bash
xcode-select --install  # Xcode Command Line Tools
```

**Windows:**
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with "Desktop development with C++"
- WebView2 Runtime (pre-installed on Windows 10/11)

Then build manually:
```bash
bun install
bun run tauri build
```
</details>

Built packages will be in `src-tauri/target/release/bundle/`.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / Pause |
| `S` | Skip segment |
| `Esc` | Stop timer |
| `F` | Toggle fullscreen |
| `M` | Toggle mini mode |
| `P` | Pin on top |

## Uninstall

```bash
# Using the script
curl -fsSL https://raw.githubusercontent.com/idityaGE/foccus/main/scripts/install.sh | bash -s uninstall

# Or manually:
# Fedora/RHEL: sudo dnf remove foccus
# Ubuntu/Debian: sudo apt remove foccus
# macOS: rm -rf /Applications/Foccus.app
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE.md)
