# 🚀 Quick Start - Invoice Renamer

This guide helps you get started with the application in minutes.

## 📋 Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **OpenRouter API Key** (recommended) or **LM Studio** for local

## ⚡ Start in 1 Command

```bash
./start.sh
```

That's it! The script automatically:
- ✓ Checks Node.js
- ✓ Installs dependencies
- ✓ Builds the project
- ✓ Starts the web server

## 🌐 Access the Interface

Once started, open your browser:

- **Main Interface**: http://localhost:3000
- **Settings**: http://localhost:3000/settings.html

## 🔑 API Key Configuration

### Option 1: Environment Variable (Quick)

```bash
export OPENROUTER_API_KEY='your-api-key-here'
./start.sh
```

### Option 2: .env File (Permanent)

Create a `.env` file in the project directory:

```bash
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_MODEL=qwen/qwen3-vl-235b-a22b-instruct
```

Then run:
```bash
./start.sh
```

### Option 3: LM Studio (Local, No API)

1. Download [LM Studio](https://lmstudio.ai/)
2. Load a vision model (e.g., LLaVA, Qwen-VL)
3. Start the local server (port 1234)
4. In web settings, select "LM Studio"

## 📖 Usage

### Web Interface

1. Drag & drop your PDFs or ZIPs into the zone
2. Processing starts automatically
3. Download the ZIP with renamed files

### CLI (Command Line)

```bash
# Process a single file
npm run dev process invoice.pdf

# Process a directory
npm run dev process ./invoice-folder/

# Process a ZIP
npm run dev process invoices.zip

# With options
npm run dev process invoices.zip --provider openrouter --dry-run
```

## 🎯 Recommended Models

Best models for Thai invoice OCR:

| Model | Quality | Speed | Cost |
|-------|---------|-------|------|
| **Qwen3-VL-235B** | ⭐⭐⭐⭐⭐ | ⭐⭐ | $$ |
| **Qwen3-VL-30B** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $ |
| **Qwen2.5-VL-72B** | ⭐⭐⭐⭐ | ⭐⭐⭐ | $ |
| **Gemini 2.5 Flash** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $$ |
| **Claude Sonnet 4.5** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $$$ |

## 🔧 Troubleshooting

### Server won't start

```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
./start.sh
```

### Error "OPENROUTER_API_KEY not found"

Check your API key:
```bash
echo $OPENROUTER_API_KEY
```

If empty, export it:
```bash
export OPENROUTER_API_KEY='your-key'
```

### Port 3000 already in use

Stop the existing process:
```bash
lsof -ti:3000 | xargs kill -9
```

Or change the port in `src/server/index.ts` (line 15):
```typescript
const PORT = 3001; // Instead of 3000
```

## 📁 Renamed File Structure

Format: `YYYY-MM-DD-SupplierName.pdf`

Examples:
- `2025-11-15-7-Eleven.pdf`
- `2024-03-20-Makro.pdf`
- `2025-01-05-Lotus.pdf`

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal.

## 💡 Tips

- **Batch Processing**: Drop a ZIP containing multiple PDFs
- **Multi-page**: Multi-page PDFs are automatically split
- **Buddhist Era**: Thai dates (พ.ศ.) are automatically converted
- **Retry**: Failed files can be retried individually

## 📞 Support

- Complete documentation: See main README.md
- Issues: [GitHub Issues](https://github.com/tarpediem/invoice-renamer-thai/issues)
- Examples: `examples/` folder

---

**Happy invoice processing! 🎉**
