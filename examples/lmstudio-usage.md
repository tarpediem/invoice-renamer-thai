# Using LM Studio with Invoice Renamer

LM Studio is a desktop application that runs large language models locally on your machine. It provides an OpenAI-compatible API, making it easy to use with the invoice renamer tool.

## Setup

### 1. Install and Configure LM Studio

1. Download LM Studio from [https://lmstudio.ai](https://lmstudio.ai)
2. Install and launch LM Studio
3. Download a vision-capable model (e.g., LLaVA, BakLLaVA, or similar)
4. Start the local server:
   - Go to the "Local Server" tab in LM Studio
   - Click "Start Server"
   - Default port is `1234`

### 2. Configure Environment

Create a `.env` file or set environment variables:

```bash
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model  # or the specific model name you loaded
```

### 3. Verify LM Studio is Running

```bash
# Test if the server is responding
curl http://localhost:1234/v1/models
```

## Usage

### Process a Single Invoice

```bash
invoice-renamer process invoice.pdf --provider lmstudio --verbose
```

### Process Multiple Invoices

```bash
invoice-renamer process ./invoices/ --provider lmstudio
```

### Dry Run (Preview Only)

```bash
invoice-renamer process invoice.pdf --provider lmstudio --dry-run --verbose
```

## Recommended Models for LM Studio

Vision-capable models that work well with invoice processing:

- **LLaVA 1.6** - Good balance of speed and accuracy
- **BakLLaVA** - Optimized for document understanding
- **LLaVA 13B** - Higher accuracy, slower processing

## Tips

1. **Model Selection**: Use models with vision capabilities (multimodal models)
2. **Performance**: Larger models provide better accuracy but are slower
3. **Privacy**: All processing happens locally - no data leaves your machine
4. **GPU**: Enable GPU acceleration in LM Studio for faster processing
5. **Context Length**: Ensure your model supports sufficient context for invoice images

## Troubleshooting

### Provider Not Available

If you see "Provider 'lmstudio' is not available":

1. Check if LM Studio server is running
2. Verify the base URL is correct (default: `http://localhost:1234/v1`)
3. Ensure a vision-capable model is loaded in LM Studio

### Low Accuracy

If the extracted data is incorrect:

1. Try a larger or more capable model
2. Adjust the temperature (lower = more deterministic)
3. Ensure invoice images are clear and readable
4. Check if the model supports the document format

### Connection Errors

```bash
# Check if LM Studio is listening
netstat -an | grep 1234

# Test the API directly
curl http://localhost:1234/v1/models
```
