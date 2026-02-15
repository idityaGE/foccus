# Foccus

A minimal Pomodoro timer for Linux with a retro flip-clock display.

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

### Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/idityaGE/foccus/main/scripts/install.sh | bash
```

### Download from Releases

Download the appropriate package for your system from [Releases](https://github.com/idityaGE/foccus/releases):

| Distribution | Package | Install Command |
|--------------|---------|-----------------|
| Fedora, RHEL, openSUSE | `.rpm` | `sudo dnf install foccus-*.rpm` |
| Ubuntu, Debian, Mint | `.deb` | `sudo apt install ./foccus_*.deb` |

### Build from Source

**Option 1: Using the build script (recommended)**

```bash
git clone https://github.com/idityaGE/foccus.git
cd foccus

# Install dependencies and build
./scripts/build.sh all

# Or step by step:
./scripts/build.sh deps    # Install system dependencies
./scripts/build.sh build   # Build the application
```

**Option 2: Manual build**

Prerequisites: [Rust](https://rustup.rs/), [Bun](https://bun.sh/)

<details>
<summary>Fedora / RHEL dependencies</summary>

```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libayatana-appindicator-gtk3-devel \
    alsa-lib-devel curl wget file openssl-devel librsvg2-devel gcc gcc-c++ make
```
</details>

<details>
<summary>Ubuntu / Debian dependencies</summary>

```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev \
    libasound2-dev curl wget file libssl-dev librsvg2-dev build-essential
```
</details>

<details>
<summary>Arch Linux dependencies</summary>

```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator alsa-lib \
    curl wget file openssl librsvg base-devel
```
</details>

Then build:

```bash
git clone https://github.com/idityaGE/foccus.git
cd foccus
bun install
bun run tauri build
```

The built packages will be in `src-tauri/target/release/bundle/`.

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
# Fedora/RHEL
sudo dnf remove foccus

# Ubuntu/Debian
sudo apt remove foccus
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE.md)
