import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs/promises';
import AdmZip from 'adm-zip';
import { providerRegistry } from '../providers';
import { InvoiceProcessor } from '../core/invoice-processor';
import { registerProviders } from '../bootstrap';
import { extractPdfsFromZip } from '../utils/zip-utils';
import type { VisionProvider } from '../providers/base-provider';
import { splitPdfIntoPages, isMultiPagePdf } from '../utils/pdf-split';

const app = express();
const PORT = 3000;

// Session storage for real-time progress
interface FailedFile {
  originalName: string;
  path: string;
  error: string;
}

interface ProcessingSession {
  sessionId: string;
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  files: string[];
  failedFiles: FailedFile[];
  error?: string;
  zipPath?: string;
  cancelled?: boolean;
}

const sessions = new Map<string, ProcessingSession>();

// Settings storage
interface AppSettings {
  preferredProvider: 'openrouter' | 'lmstudio' | 'auto';
  openrouterModel: string;
  lmstudioModel: string;
}

const appSettings: AppSettings = {
  preferredProvider: 'auto', // Try OpenRouter first, fallback to LM Studio
  openrouterModel: 'qwen/qwen3-vl-235b-a22b-instruct', // Best for OCR
  lmstudioModel: 'local-model',
};

// Register providers
registerProviders();

// Helper function to select provider based on settings
async function selectProvider(): Promise<{ name: string; provider: VisionProvider } | null> {
  if (appSettings.preferredProvider === 'openrouter') {
    const provider = providerRegistry.get('openrouter');
    if (provider && (await provider.isAvailable())) {
      return { name: 'openrouter', provider };
    }
    return null;
  } else if (appSettings.preferredProvider === 'lmstudio') {
    const provider = providerRegistry.get('lmstudio');
    if (provider && (await provider.isAvailable())) {
      return { name: 'lmstudio', provider };
    }
    return null;
  } else {
    // Auto mode: Try OpenRouter first, fallback to LM Studio
    let provider = providerRegistry.get('openrouter');
    if (provider && (await provider.isAvailable())) {
      return { name: 'openrouter', provider };
    }
    provider = providerRegistry.get('lmstudio');
    if (provider && (await provider.isAvailable())) {
      return { name: 'lmstudio', provider };
    }
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads with proper filename handling
const storage = multer.diskStorage({
  destination: '.temp/uploads/',
  filename: (_req, file, cb) => {
    // Generate unique filename while preserving the extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Shared provider data configuration
const getProviderData = () => {
  return {
    openrouter: {
      models: [
        { id: 'qwen/qwen3-vl-235b-a22b-instruct', name: 'Qwen3-VL-235B (Best OCR)', recommended: true },
        { id: 'qwen/qwen3-vl-30b-a3b-instruct', name: 'Qwen3-VL-30B (Fast & Accurate)' },
        { id: 'qwen/qwen-2.5-vl-72b-instruct', name: 'Qwen2.5-VL-72B (Proven for Thai)' },
        { id: 'qwen/qwen-2.5-vl-32b-instruct', name: 'Qwen2.5-VL-32B (Good Balance)' },
        { id: 'google/gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash (Fast & Smart)' },
        { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro (Latest)' },
        { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5 (High Quality)' },
        { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5 (Fast)' },
        { id: 'openai/gpt-5.1', name: 'GPT-5.1 (Latest OpenAI)' },
        { id: 'openai/gpt-4o', name: 'GPT-4o (Proven Quality)' },
      ],
    },
    lmstudio: {
      models: [{ id: 'local-model', name: 'Local Model' }],
    },
  };
};

// Helper to get model display name
const getModelDisplayName = (providerId: string, modelId: string): string => {
  const data = getProviderData();
  const providerData = data[providerId as keyof ReturnType<typeof getProviderData>];
  if (!providerData) return modelId;

  const model = providerData.models.find((m) => m.id === modelId);
  return model?.name.replace(/ \(.*?\)/, '') || modelId; // Remove descriptive text in parentheses
};

// Health check - shows which provider is available
app.get('/api/health', async (_req, res) => {
  // Try OpenRouter first
  let provider = providerRegistry.get('openrouter');
  if (provider && (await provider.isAvailable())) {
    const modelName = getModelDisplayName('openrouter', appSettings.openrouterModel);
    return res.json({ status: 'ok', provider: 'openrouter', model: modelName });
  }

  // Fallback to LM Studio
  provider = providerRegistry.get('lmstudio');
  if (provider && (await provider.isAvailable())) {
    const modelName = getModelDisplayName('lmstudio', appSettings.lmstudioModel);
    return res.json({ status: 'ok', provider: 'lmstudio', model: modelName });
  }

  // No providers available
  return res.status(503).json({ status: 'error', error: 'No providers available' });
});

// Get available providers with details
app.get('/api/providers', async (_req, res) => {
  try {
    const providers = [];

    // Check OpenRouter
    const openrouter = providerRegistry.get('openrouter');
    if (openrouter) {
      const available = await openrouter.isAvailable();
      providers.push({
        name: 'openrouter',
        displayName: 'OpenRouter',
        description: 'Cloud-based, multiple models',
        available,
        models: [
          // Best for Thai OCR - Qwen VL series excels at OCR tasks
          {
            id: 'qwen/qwen3-vl-235b-a22b-instruct',
            name: 'Qwen3-VL-235B (Best OCR)',
            recommended: true,
          },
          { id: 'qwen/qwen3-vl-30b-a3b-instruct', name: 'Qwen3-VL-30B (Fast & Accurate)' },
          { id: 'qwen/qwen-2.5-vl-72b-instruct', name: 'Qwen2.5-VL-72B (Proven for Thai)' },
          { id: 'qwen/qwen-2.5-vl-32b-instruct', name: 'Qwen2.5-VL-32B (Good Balance)' },
          // Premium models
          {
            id: 'google/gemini-2.5-flash-preview-09-2025',
            name: 'Gemini 2.5 Flash (Fast & Smart)',
          },
          { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro (Latest)' },
          { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5 (High Quality)' },
          { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5 (Fast)' },
          { id: 'openai/gpt-5.1', name: 'GPT-5.1 (Latest OpenAI)' },
          { id: 'openai/gpt-4o', name: 'GPT-4o (Proven Quality)' },
        ],
      });
    }

    // Check LM Studio
    const lmstudio = providerRegistry.get('lmstudio');
    if (lmstudio) {
      const available = await lmstudio.isAvailable();
      providers.push({
        name: 'lmstudio',
        displayName: 'LM Studio (Local)',
        description: 'Local inference',
        available,
        models: [{ id: 'local-model', name: 'Local Model' }],
      });
    }

    res.json({
      providers,
      providerOptions: [
        { value: 'auto', name: 'Auto', description: 'Try OpenRouter first, fallback to LM Studio' },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

// Get current settings
app.get('/api/settings', (_req, res) => {
  res.json(appSettings);
});

// Update settings
app.post('/api/settings', (req, res) => {
  const { preferredProvider, openrouterModel, lmstudioModel } = req.body;

  if (preferredProvider && !['openrouter', 'lmstudio', 'auto'].includes(preferredProvider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  if (preferredProvider) appSettings.preferredProvider = preferredProvider;
  if (openrouterModel) appSettings.openrouterModel = openrouterModel;
  if (lmstudioModel) appSettings.lmstudioModel = lmstudioModel;

  return res.json({ success: true, settings: appSettings });
});

// Get processing progress
app.get('/api/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json({
    status: session.status,
    total: session.total,
    processed: session.processed,
    successful: session.successful,
    failed: session.failed,
    files: session.files,
    failedFiles: session.failedFiles,
    error: session.error,
  });
});

// Download processed ZIP
app.get('/api/download/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Allow download for both completed and cancelled status (partial results)
  if (session.status !== 'completed' && session.status !== 'cancelled') {
    return res.status(400).json({ error: 'Processing not completed' });
  }

  if (!session.zipPath) {
    return res.status(404).json({ error: 'ZIP file not found' });
  }

  try {
    const zipBuffer = await fs.readFile(session.zipPath);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="processed-invoices.zip"');
    return res.send(zipBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to download ZIP' });
  }
});

// Cancel processing
app.post('/api/cancel/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.status === 'completed') {
    return res.status(400).json({ error: 'Processing already completed' });
  }

  if (session.status === 'cancelled') {
    return res.status(400).json({ error: 'Processing already cancelled' });
  }

  // Mark session as cancelled
  session.cancelled = true;
  session.status = 'cancelled';

  return res.json({ message: 'Processing cancelled', sessionId });
});

// Retry failed files
app.post('/api/retry/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.failedFiles.length === 0) {
    return res.status(400).json({ error: 'No failed files to retry' });
  }

  if (session.status === 'processing') {
    return res.status(400).json({ error: 'Already processing' });
  }

  // Create new session for retry
  const retrySessionId = `${sessionId}-retry-${Date.now()}`;
  const retryOutputDir = path.join('.temp', retrySessionId, 'processed');

  const retrySession: ProcessingSession = {
    sessionId: retrySessionId,
    status: 'processing',
    total: session.failedFiles.length,
    processed: 0,
    successful: 0,
    failed: 0,
    files: [],
    failedFiles: [],
  };
  sessions.set(retrySessionId, retrySession);

  // Return new session ID immediately
  return res.json({ sessionId: retrySessionId, total: retrySession.total });

  // Get provider based on settings
  try {
    const selected = await selectProvider();

    if (!selected) {
      retrySession.status = 'error';
      retrySession.error = 'No provider available';
      return;
    }

    // Process failed files in background
    const filesToRetry = session!.failedFiles.map((f) => f.path);
    processFilesInBackground(
      retrySessionId,
      filesToRetry,
      retryOutputDir,
      '',
      selected!.name,
      selected!.provider
    );
  } catch (err: unknown) {
    retrySession.status = 'error';
    const error = err as Error;
    retrySession.error = error.message || String(err);
  }
});

// Process uploaded file
app.post('/api/process', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const sessionId = `session-${Date.now()}`;
  const uploadedFile = req.file.path;
  const outputDir = path.join('.temp', sessionId, 'processed');

  // Create session
  const session: ProcessingSession = {
    sessionId,
    status: 'uploading',
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    files: [],
    failedFiles: [],
  };
  sessions.set(sessionId, session);

  try {
    // Get provider based on settings
    const selected = await selectProvider();

    if (!selected) {
      session.status = 'error';
      session.error = 'No provider available. Please check settings or start required provider.';
      return res.status(503).json({
        error: 'No provider available. Please check settings or start required provider.',
      });
    }

    const providerName = selected.name;
    const provider = selected.provider;

    // Determine file type and extract PDFs if needed
    let filesToProcess: string[] = [];
    let tempExtractDir: string | null = null;

    const fileExt = path.extname(req.file.originalname).toLowerCase();

    if (fileExt === '.zip') {
      // Extract ZIP file
      tempExtractDir = path.join('.temp', sessionId, 'extracted');
      const extractedPdfs = await extractPdfsFromZip(uploadedFile, tempExtractDir);

      // Check each extracted PDF and split if multi-page
      const splitDir = path.join('.temp', sessionId, 'split');
      for (const pdfPath of extractedPdfs) {
        if (await isMultiPagePdf(pdfPath)) {
          const splitPdfs = await splitPdfIntoPages(pdfPath, splitDir);
          filesToProcess.push(...splitPdfs);
        } else {
          filesToProcess.push(pdfPath);
        }
      }
    } else if (fileExt === '.pdf') {
      // Check if PDF has multiple pages and split if needed
      if (await isMultiPagePdf(uploadedFile)) {
        const splitDir = path.join('.temp', sessionId, 'split');
        filesToProcess = await splitPdfIntoPages(uploadedFile, splitDir);
      } else {
        filesToProcess = [uploadedFile];
      }
    } else {
      session.status = 'error';
      session.error = 'Only PDF and ZIP files are supported';
      return res.status(400).json({ error: 'Only PDF and ZIP files are supported' });
    }

    // Update session with total count
    session.total = filesToProcess.length;
    session.status = 'processing';

    // Return session ID immediately
    res.json({ sessionId, total: session.total });

    // Process files in background
    processFilesInBackground(
      sessionId,
      filesToProcess,
      outputDir,
      uploadedFile,
      providerName,
      provider
    );
    return;
  } catch (error) {
    session.status = 'error';
    session.error = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Upload failed' });
    }
    return;
  }
});

// Background processing function
async function processFilesInBackground(
  sessionId: string,
  filesToProcess: string[],
  outputDir: string,
  uploadedFile: string,
  providerName: string,
  provider: VisionProvider
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) return;

  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    const processor = new InvoiceProcessor(provider);
    const zip = new AdmZip();

    // Process files one by one for real-time updates
    for (const filePath of filesToProcess) {
      // Check if cancelled
      if (session.cancelled) {
        console.log(`Processing cancelled for session ${sessionId}`);
        break;
      }

      try {
        const startTime = Date.now();
        const result = await processor.processInvoice(filePath, {
          provider: providerName,
          outputDir,
          dryRun: false,
          verbose: true, // Enable verbose for better logging
          maxRetries: 2, // Retry failed files up to 2 times
        });
        const processingTime = Date.now() - startTime;

        session.processed++;
        if (result.success && result.newPath) {
          session.successful++;
          const filename = path.basename(result.newPath);
          session.files.push(filename);
          zip.addLocalFile(result.newPath);
          console.log(
            `✓ [${session.processed}/${session.total}] ${path.basename(filePath)} → ${filename} (${processingTime}ms)`
          );
        } else {
          session.failed++;
          const errorDetail = result.error || 'Processing failed';
          console.error(
            `✗ [${session.processed}/${session.total}] ${path.basename(filePath)}: ${errorDetail}`
          );
          session.failedFiles.push({
            originalName: path.basename(filePath),
            path: filePath,
            error: errorDetail,
          });
        }
      } catch (error) {
        session.processed++;
        session.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        // Categorize error type for better debugging
        let errorCategory = 'Unknown';
        if (errorMessage.includes('PDF')) errorCategory = 'PDF Processing';
        else if (errorMessage.includes('API') || errorMessage.includes('fetch'))
          errorCategory = 'API Error';
        else if (errorMessage.includes('date') || errorMessage.includes('year'))
          errorCategory = 'Date Parsing';
        else if (errorMessage.includes('supplier')) errorCategory = 'Supplier Extraction';
        else if (errorMessage.includes('JSON')) errorCategory = 'JSON Parsing';

        console.error(`✗ [${session.processed}/${session.total}] ${path.basename(filePath)}`);
        console.error(`  Category: ${errorCategory}`);
        console.error(`  Error: ${errorMessage}`);
        if (errorStack && process.env.DEBUG) {
          console.error(`  Stack: ${errorStack}`);
        }

        session.failedFiles.push({
          originalName: path.basename(filePath),
          path: filePath,
          error: `[${errorCategory}] ${errorMessage}`,
        });
      }
    }

    // Save ZIP file (even if cancelled, save partial results)
    const zipPath = path.join('.temp', sessionId, 'processed-invoices.zip');
    zip.writeZip(zipPath);
    session.zipPath = zipPath;

    // Only mark as completed if not cancelled
    if (!session.cancelled) {
      session.status = 'completed';
    }

    // Cleanup after 1 hour
    setTimeout(async () => {
      try {
        await fs.rm(path.join('.temp', sessionId), { recursive: true, force: true });
        await fs.rm(uploadedFile, { force: true });
        sessions.delete(sessionId);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }, 3600000); // 1 hour
  } catch (error) {
    session.status = 'error';
    session.error = error instanceof Error ? error.message : String(error);
    console.error('Processing error:', error);

    // Cleanup on error
    try {
      await fs.rm(path.join('.temp', sessionId), { recursive: true, force: true });
      await fs.rm(uploadedFile, { force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  // Check which provider is available
  let providerInfo = 'Checking...';
  const openrouter = providerRegistry.get('openrouter');
  const lmstudio = providerRegistry.get('lmstudio');

  if (openrouter && (await openrouter.isAvailable())) {
    providerInfo = 'OpenRouter (Qwen2.5-VL-72B) ✓';
  } else if (lmstudio && (await lmstudio.isAvailable())) {
    providerInfo = 'LM Studio (Local) ✓';
  } else {
    providerInfo = 'None available ✗';
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Invoice Renamer Web UI - Running! 🎉               ║
╚══════════════════════════════════════════════════════════════╝

Server:    http://0.0.0.0:${PORT}
Provider:  ${providerInfo}
Status:    Ready to process Thai invoices

Open your browser and drag & drop PDF or ZIP files!
  `);
});
