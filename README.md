# 🧾 Invoice Renamer - Thai Invoice OCR Processing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Automated Thai invoice processing and file renaming using vision AI models. Supports Buddhist Era calendar conversion, OCR from PDFs, and batch processing.

> **📖 Quick Start Guides**: [English](./QUICKSTART-EN.md) | [Français](./README-DEMARRAGE.md) | [ไทย](./QUICKSTART-TH.md)

## ✨ Features

- 🔍 **AI-Powered OCR**: Extract invoice data using state-of-the-art vision models
- 📅 **Thai Calendar Support**: Automatic Buddhist Era (พ.ศ.) to Common Era conversion
- 🌐 **Multiple Providers**: OpenRouter (10+ models) or LM Studio (local)
- 🎯 **High Accuracy**: Specialized prompts for Thai invoices and receipts
- 📦 **Batch Processing**: Process directories and ZIP archives
- 💻 **Web Interface**: Drag-and-drop UI + CLI
- 🚀 **Easy Setup**: One-command startup scripts
- 🔒 **Secure**: No hardcoded secrets, .env configuration

### Supported Models

| Provider | Models | Use Case |
|----------|--------|----------|
| **OpenRouter** | Qwen3-VL-235B, Qwen3-VL-30B, Gemini 2.5 Flash, Gemini 3 Pro, Claude Sonnet/Haiku 4.5, GPT-5.1, GPT-4o | Cloud, best accuracy |
| **LM Studio** | Any vision model (Qwen2-VL, LLaVA, etc.) | Local, private, free |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- OpenRouter API key ([get one](https://openrouter.ai/)) or LM Studio for local

### Installation

```bash
# Clone the repository
git clone https://github.com/tarpediem/invoice-renamer-thai.git
cd invoice-renamer-thai

# Copy environment template
cp .env.example .env

# Edit .env and add your OpenRouter API key
nano .env  # or vim, code, etc.

# Start the application
./start.sh  # Linux/macOS
# OR
start.bat   # Windows
```

Open http://localhost:3000 in your browser 🎉

## 📖 Usage

### Web Interface

1. Launch: `./start.sh`
2. Open: http://localhost:3000
3. Drag & drop PDF/ZIP files
4. Download renamed files

### Command Line

```bash
# Process a single invoice
npm run dev process invoice.pdf

# Process a directory
npm run dev process ./invoices/

# Process a ZIP archive
npm run dev process invoices.zip

# Dry run (preview without renaming)
npm run dev process invoice.pdf --dry-run --verbose

# Specify provider and output
npm run dev process invoice.pdf --provider openrouter --output ./renamed/
```

## 🔧 Configuration

### OpenRouter (Recommended)

1. Get API key from https://openrouter.ai/
2. Add to `.env`:
   ```env
   OPENROUTER_API_KEY=your-key-here
   OPENROUTER_MODEL=qwen/qwen3-vl-235b-a22b-instruct
   ```

### LM Studio (Local)

1. Download [LM Studio](https://lmstudio.ai/)
2. Load a vision model (e.g., Qwen2-VL)
3. Start local server (port 1234)
4. Configure in web UI or `.env`:
   ```env
   LMSTUDIO_BASE_URL=http://localhost:1234/v1
   LMSTUDIO_MODEL=qwen2-vl
   ```

## 📁 Output Format

Files are renamed to: `YYYY-MM-DD-SupplierName.pdf`

Examples:
- `2025-11-15-7-Eleven.pdf`
- `2024-03-20-Makro.pdf`
- `2025-01-05-Lotus.pdf`

## 🎯 Thai-Specific Features

### Buddhist Era Conversion

Automatically converts Thai Buddhist Era (พ.ศ.) to Common Era:
- 2568 BE → 2025 CE
- 2567 BE → 2024 CE
- 2566 BE → 2023 CE

### Supplier Translation

Common Thai retailers automatically translated:
- เซเว่น อีเลฟเว่น → 7-Eleven
- แม็คโคร → Makro
- โลตัส → Lotus
- บิ๊กซี → Big C
- And more...

### Small Receipt Handling

Optimized for tiny convenience store receipts (7-Eleven, Family Mart, etc.)

## 🏗️ Project Structure

```
invoice-renamer-thai/
├── src/
│   ├── cli.ts                              # CLI entry point
│   ├── server/                             # Web server
│   │   └── index.ts
│   ├── providers/                          # Vision providers
│   │   ├── openai-compatible-provider.ts   # Base for OpenAI-compatible APIs
│   │   ├── openrouter-provider.ts          # OpenRouter implementation
│   │   └── lmstudio-provider.ts            # LM Studio implementation
│   ├── core/                               # Processing logic
│   │   └── invoice-processor.ts
│   └── utils/                              # Utilities
│       ├── pdf-to-image.ts                 # PDF conversion
│       ├── date-utils.ts                   # Thai calendar conversion
│       └── file-utils.ts
├── public/                                 # Web UI
├── start.sh                                # Startup script (Linux/Mac)
├── start.bat                               # Startup script (Windows)
└── .env.example                            # Configuration template
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint & format
npm run lint
npm run format
```

## 🔒 Security

- ✅ No API keys in code
- ✅ `.gitignore` protects sensitive files
- ✅ Environment variable configuration
- ✅ Automatic cleanup of temporary files
- ✅ API timeouts prevent hanging requests

## 📊 Performance

| Model | Speed | Accuracy | Cost/Invoice |
|-------|-------|----------|--------------|
| Qwen3-VL-235B | ~5-8s | ⭐⭐⭐⭐⭐ | ~$0.015 |
| Qwen3-VL-30B | ~3-5s | ⭐⭐⭐⭐ | ~$0.008 |
| Gemini 2.5 Flash | ~2-4s | ⭐⭐⭐⭐ | ~$0.012 |
| LM Studio (local) | ~15-30s | ⭐⭐⭐ | Free |

## 📚 Documentation

### Quick Start Guides
- **[QUICKSTART-EN.md](./QUICKSTART-EN.md)** - English quick-start guide
- **[README-DEMARRAGE.md](./README-DEMARRAGE.md)** - Guide de démarrage rapide (Français)
- **[QUICKSTART-TH.md](./QUICKSTART-TH.md)** - คู่มือเริ่มต้นใช้งานด่วน (ไทย)

### Additional Documentation
- **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation guide
- **[QUICK-START.txt](./QUICK-START.txt)** - Quick reference
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New Providers

1. Extend `OpenAICompatibleProvider` or `BaseVisionProvider`
2. Implement `extractInvoiceData()` and `isAvailable()`
3. Register in `src/bootstrap.ts`

See existing providers for examples.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- OpenRouter for multi-model API access
- Qwen team for excellent vision models
- LM Studio for local inference capabilities

## 📞 Support

- 📖 Documentation: See docs above
- 🐛 Issues: [GitHub Issues](https://github.com/tarpediem/invoice-renamer-thai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tarpediem/invoice-renamer-thai/discussions)

---

**Made with ❤️ for Thai invoice automation**
