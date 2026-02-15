# Contributing to Foccus

Thanks for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/foccus.git`
3. Create a branch: `git checkout -b my-feature`
4. Make your changes
5. Test locally: `bun run tauri dev`
6. Commit with a clear message
7. Push and open a Pull Request

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

## Project Structure

```
foccus/
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities and types
│   └── stores/           # Zustand state stores
└── src-tauri/            # Rust backend
    └── src/              # Tauri commands and logic
```

## Guidelines

- Keep changes focused and minimal
- Test your changes before submitting
- Follow existing code style
- Update documentation if needed

## Reporting Issues

Open an issue with:
- Clear description of the problem
- Steps to reproduce
- System info (distro, desktop environment)

## Questions?

Open an issue or start a discussion.
