# Contributing to AIOBD

Thank you for your interest in contributing to the AIOBD project!

## Ways to Contribute

- 🐛 **Bug reports** - File issues on GitHub
- 🔧 **Bug fixes** - Submit pull requests
- 📊 **OEM PID packs** - Add manufacturer-specific PIDs
- 📖 **Documentation** - Improve docs and guides
- 🧪 **Tests** - Add unit and integration tests
- 💡 **Features** - Propose and implement new capabilities

## Development Setup

```bash
# Clone the repository
git clone https://github.com/rezahmatthee/aiobd.git
cd aiobd

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup
cd ../frontend
npm install
npm run dev
```

## Code Standards

- TypeScript strict mode
- ESLint for code style
- Jest for testing
- Conventional commits

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit: `git commit -m "feat: add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a pull request

## OEM Pack Contributions

See [docs/OEM_PACKS.md](docs/OEM_PACKS.md) for a guide on adding manufacturer-specific PID definitions.

## Code of Conduct

Be respectful, inclusive, and constructive. All contributions are welcome.
