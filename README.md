# Invoice Renamer

A CLI tool for automated invoice processing and file renaming using vision models.

## Features

- Extract invoice metadata (date, supplier) from PDF files using vision models
- Automatically rename files to standardized format: `YYYY-MM-DD-SupplierName.pdf`
- Support for multiple vision model providers (OpenRouter, LM Studio)
- Translate Thai supplier names to English
- Plugin-based architecture for easy provider extension
- Batch processing support
- Dry-run mode for testing

## Installation

```bash
npm install
npm run build
```

## Usage

### Process a single invoice

```bash
invoice-renamer process invoice.pdf --provider openrouter
```

### Process all PDFs in a directory

```bash
invoice-renamer process ./invoices/ --provider openrouter
```

### Dry run (preview without renaming)

```bash
invoice-renamer process invoice.pdf --dry-run --verbose
```

### Specify output directory

```bash
invoice-renamer process invoice.pdf --output ./renamed/
```

### List available providers

```bash
invoice-renamer providers
```

## Configuration

Providers need to be configured with API keys and settings. Configuration will be loaded from environment variables or a config file.

### Environment Variables

- `OPENROUTER_API_KEY` - API key for OpenRouter
- `LMSTUDIO_BASE_URL` - Base URL for LM Studio (default: http://localhost:1234/v1)
- `LMSTUDIO_MODEL` - Model name to use in LM Studio (default: local-model)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── cli.ts              # CLI entry point
├── index.ts            # Main exports
├── types/              # TypeScript type definitions
├── providers/          # Vision model provider plugins
│   ├── base-provider.ts
│   └── provider-registry.ts
├── core/               # Core processing logic
│   └── invoice-processor.ts
└── utils/              # Utility functions
    └── file-utils.ts
```

## Adding New Providers

To add a new vision model provider:

1. Create a new class extending `BaseVisionProvider`
2. Implement the `extractInvoiceData()` and `isAvailable()` methods
3. Register the provider with `providerRegistry.register()`

See `src/providers/base-provider.ts` for the interface definition.

## License

MIT
