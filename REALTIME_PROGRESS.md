# Real-Time Progress Updates - Web UI

## Feature Added

The web UI now displays processed files **in real-time** as they are being processed, instead of waiting until all processing is complete.

## How It Works

### Architecture

**Before** (synchronous):
1. Upload file → wait for all processing → download ZIP
2. No progress updates during processing
3. Files list shown only at the end

**After** (real-time with polling):
1. Upload file → get session ID immediately
2. Poll `/api/progress/:sessionId` every second
3. Update UI as each file completes
4. Download ZIP when done

### Flow Diagram

```
┌─────────┐     ┌──────────┐     ┌─────────────┐
│ Browser │     │  Server  │     │  Background │
│         │     │          │     │  Processor  │
└────┬────┘     └────┬─────┘     └──────┬──────┘
     │               │                   │
     │  POST /api/   │                   │
     │  process      │                   │
     ├──────────────>│                   │
     │               │ Create session    │
     │               ├──────────────────>│
     │ { sessionId } │                   │
     │<──────────────┤                   │
     │               │                   │
     │  GET /api/    │   Process file 1  │
     │  progress/ID  │<──────────────────┤
     ├──────────────>│                   │
     │ { processed:1,│                   │
     │   files:[...]}│                   │
     │<──────────────┤                   │
     │               │   Process file 2  │
     │  (Poll every  │<──────────────────┤
     │   1 second)   │                   │
     ├──────────────>│                   │
     │ { processed:2,│                   │
     │   files:[...]}│                   │
     │<──────────────┤                   │
     │               │                   │
     │  ... continues until completed    │
     │               │                   │
     │ GET /api/     │                   │
     │ download/ID   │                   │
     ├──────────────>│                   │
     │ ZIP file      │                   │
     │<──────────────┤                   │
```

## Backend Changes

### Session Management

Added in-memory session storage:

```typescript
interface ProcessingSession {
  sessionId: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  files: string[];
  error?: string;
  zipPath?: string;
}

const sessions = new Map<string, ProcessingSession>();
```

### New Endpoints

#### `POST /api/process`
- **Before**: Processed all files synchronously, returned ZIP
- **After**: Returns session ID immediately, processes in background

**Request**: `multipart/form-data` with file
**Response**:
```json
{
  "sessionId": "session-1733195123456",
  "total": 10
}
```

#### `GET /api/progress/:sessionId` (NEW!)
- Returns current processing progress
- Updates in real-time as files complete

**Response**:
```json
{
  "status": "processing",
  "total": 10,
  "processed": 5,
  "successful": 4,
  "failed": 1,
  "files": [
    "2025-11-21-La-Vanille-Co-Ltd.pdf",
    "2025-11-18-Vinum-Lector-Co-Ltd.pdf",
    "2025-11-16-Villa-Market-JP-Co-Ltd.pdf",
    "2025-11-29-Villa-Market-JP-Co-Ltd.pdf"
  ]
}
```

#### `GET /api/download/:sessionId` (NEW!)
- Downloads the completed ZIP file
- Only available when `status === 'completed'`

**Response**: ZIP file download

### Background Processing

```typescript
async function processFilesInBackground(
  sessionId, filesToProcess, outputDir, ...
) {
  // Process files one by one
  for (const filePath of filesToProcess) {
    const result = await processor.processInvoice(filePath, {...});

    session.processed++;
    if (result.success) {
      session.successful++;
      session.files.push(filename); // <-- Added to session immediately!
      zip.addLocalFile(result.newPath);
    } else {
      session.failed++;
    }
  }

  // Save ZIP and mark complete
  session.zipPath = zipPath;
  session.status = 'completed';
}
```

## Frontend Changes

### Upload and Poll

```javascript
async function handleFile(file) {
  // Upload file
  const uploadResponse = await fetch('/api/process', {
    method: 'POST',
    body: formData,
  });

  const { sessionId, total } = await uploadResponse.json();

  // Start polling for progress
  pollProgress(sessionId, total);
}
```

### Real-Time Polling

```javascript
async function pollProgress(sessionId, total) {
  const pollInterval = setInterval(async () => {
    const response = await fetch(`/api/progress/${sessionId}`);
    const progress = await response.json();

    // Update stats in real-time
    document.getElementById('stat-success').textContent = progress.successful;

    // Update files list immediately
    updateFilesList(progress.files);

    // Update progress bar
    const percentComplete = (progress.processed / total) * 100;
    progressFill.style.width = percentComplete + '%';

    // Check if completed
    if (progress.status === 'completed') {
      clearInterval(pollInterval);
      // Download ZIP
      window.location.href = `/api/download/${sessionId}`;
    }
  }, 1000); // Poll every second
}
```

### Dynamic Files List Update

```javascript
function updateFilesList(files) {
  // Clear and rebuild list
  filesContainer.innerHTML = '';

  // Add each file
  files.forEach((filename) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span class="file-icon">📄</span>
      <span class="file-name">${filename}</span>
    `;
    filesContainer.appendChild(fileItem);
  });
}
```

## User Experience

### Before (Synchronous)

```
1. Upload file
2. [Loading spinner for 10 minutes...]
3. Suddenly: "Processing complete!"
4. Files list appears all at once
5. ZIP downloads
```

### After (Real-Time)

```
1. Upload file
2. "Processing... (1/10)"
   📄 2025-11-21-La-Vanille-Co-Ltd.pdf
3. "Processing... (2/10)"
   📄 2025-11-21-La-Vanille-Co-Ltd.pdf
   📄 2025-11-18-Vinum-Lector-Co-Ltd.pdf
4. "Processing... (3/10)"
   📄 2025-11-21-La-Vanille-Co-Ltd.pdf
   📄 2025-11-18-Vinum-Lector-Co-Ltd.pdf
   📄 2025-11-16-Villa-Market-JP-Co-Ltd.pdf
... continues in real-time ...
```

## Benefits

### For Users
- ✅ **Immediate Feedback**: See files as they're processed
- ✅ **Progress Visibility**: Know exactly how many files are done
- ✅ **No More Waiting**: Engaging experience instead of blank loading screen
- ✅ **Better UX**: Can see if processing is working correctly
- ✅ **Confidence**: Visual confirmation that work is happening

### For Development
- ✅ **Debugging**: Can see which files are failing in real-time
- ✅ **Monitoring**: Track processing speed and bottlenecks
- ✅ **Scalability**: Server responds immediately, handles long-running tasks in background
- ✅ **Error Handling**: Better error reporting per file

## Technical Details

### Polling Interval
- **1 second** between requests
- Balances responsiveness vs server load
- Can be adjusted based on needs

### Session Cleanup
- Sessions auto-delete after **1 hour** (3600000ms)
- Prevents memory leaks
- Temporary files cleaned up automatically

### Error Handling

If processing fails:
```json
{
  "status": "error",
  "error": "LM Studio not available",
  "processed": 3,
  "successful": 2,
  "failed": 1
}
```

UI shows error message and stops polling.

### Memory Management

Sessions stored in-memory Map:
- Pros: Fast, simple, no database needed
- Cons: Lost on server restart
- Acceptable: Sessions are temporary (1 hour max)

For production with multiple servers, consider:
- Redis for shared session storage
- Database for persistence
- Message queue for processing

## Files Modified

1. **`src/server/index.ts`**
   - Added `ProcessingSession` interface
   - Added `sessions` Map for storage
   - Modified `/api/process` to return session ID
   - Added `/api/progress/:sessionId` endpoint
   - Added `/api/download/:sessionId` endpoint
   - Added `processFilesInBackground()` function

2. **`public/index.html`**
   - Modified `handleFile()` to upload and start polling
   - Added `pollProgress()` function
   - Added `updateFilesList()` for real-time updates
   - Removed old synchronous processing code

## Testing

### Test Real-Time Updates

```bash
# Start server
npm run web

# Open browser to http://localhost:3000

# Upload a ZIP with multiple PDFs

# Watch as:
# - Stats update in real-time
# - Files appear one by one
# - Progress bar moves
# - Status shows "Processing... (X/Y)"
```

### Expected Behavior

1. **Upload**: Immediate response with session ID
2. **Processing**: Files appear ~4-6 seconds apart
3. **Progress**: Bar updates smoothly from 0% to 100%
4. **Completion**: "Processing complete!" message
5. **Download**: ZIP file downloads automatically

## Performance

### Polling Overhead
- Request every 1 second
- Minimal response size (~500 bytes JSON)
- Negligible server impact

### Processing Speed
- Same as before (4-6 seconds per invoice)
- No slowdown from polling
- Background processing doesn't block server

## Future Enhancements

Possible improvements:

1. **WebSocket/SSE**: Replace polling with push updates
   - More efficient
   - True real-time updates
   - Lower latency

2. **Pause/Resume**: Allow pausing long-running jobs

3. **Batch Priority**: Process important files first

4. **Error Details**: Show specific error per failed file

5. **Retry Failed**: Retry individual failed files

6. **Cancel**: Stop processing mid-batch

---

**Status**: ✅ Complete and tested
**Server**: Running at `http://localhost:3000`
**Feature**: Real-time file display with 1-second polling
