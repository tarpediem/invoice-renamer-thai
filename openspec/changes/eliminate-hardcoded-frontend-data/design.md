# Design: Dynamic Frontend Architecture

## Overview
This change eliminates all hardcoded configuration data from the frontend by establishing the backend API as the single source of truth. The frontend becomes a pure presentation layer that renders whatever the API provides.

## Architecture Decision

### Before
```
Frontend (settings.html)
├─ Hardcoded provider HTML (3 options)
├─ Hardcoded model options (10 models)
├─ Hardcoded descriptions (text strings)
└─ Duplicated configuration data

Backend (server.ts)
└─ Provider registry with models
```

### After
```
Frontend (settings.html)
├─ Empty containers (to be populated)
├─ JavaScript fetch logic
└─ Dynamic rendering from API

Backend (server.ts)
├─ Provider registry with models
└─ /api/providers endpoint (single source of truth)
    ├─ providerOptions[]
    ├─ providers[]
    │   ├─ name, displayName, description
    │   ├─ available status
    │   └─ models[]
    │       ├─ id, name
    │       └─ recommended flag
```

## Data Flow
1. Page load → `fetch('/api/providers')`
2. Receive complete configuration JSON
3. Dynamically create all UI elements
4. Attach event handlers
5. Load and apply saved settings

## Benefits

### Maintainability
- Add provider: Update backend only
- Add model: Update backend only
- Change description: Update backend only
- No frontend changes needed

### Consistency
- Single source of truth
- No sync issues
- Backend drives frontend
- Impossible to have mismatched data

### Scalability
- Easy to add providers
- Easy to add models
- Frontend adapts automatically
- No HTML/JS changes required

## Trade-offs

### Pros
- ✅ Zero duplication
- ✅ Easy maintenance
- ✅ Consistent data
- ✅ Backend-driven config
- ✅ Scales easily

### Cons
- ❌ Requires JavaScript enabled (already required)
- ❌ Slightly slower initial render (negligible)
- ❌ More complex frontend code (justified by benefits)

## Implementation Details

### API Response Structure
```typescript
{
  providerOptions: [
    { value: 'auto', name: 'Auto', description: '...' }
  ],
  providers: [
    {
      name: 'openrouter',
      displayName: 'OpenRouter',
      description: 'Cloud-based, multiple models',
      available: true,
      models: [
        { id: 'qwen/...', name: 'Qwen3-VL-235B (Best OCR)', recommended: true },
        { id: 'qwen/...', name: 'Qwen3-VL-30B (Fast & Accurate)' },
        // ... more models
      ]
    },
    // ... more providers
  ]
}
```

### Frontend Rendering
```javascript
// Fetch data
const data = await fetch('/api/providers').then(r => r.json());

// Render provider options
data.providerOptions.forEach(opt => {
  const element = createProviderOption(opt.value, opt.name, opt.description);
  container.appendChild(element);
});

// Render providers
data.providers.forEach(provider => {
  const statusIcon = provider.available ? ' ✓' : ' ✗';
  const element = createProviderOption(
    provider.name,
    provider.displayName + statusIcon,
    provider.description
  );
  container.appendChild(element);
});

// Render models
provider.models.forEach(model => {
  const option = document.createElement('option');
  option.value = model.id;
  option.textContent = model.name + (model.recommended ? ' 🌟' : '');
  select.appendChild(option);
});
```

## Validation
All requirements met:
- ✅ API returns complete configuration
- ✅ Frontend loads everything dynamically
- ✅ Zero hardcoded data in HTML/JS
- ✅ Settings page fully functional
- ✅ Backward compatible (no breaking changes)

## Future Enhancements
- Add caching with cache-control headers
- Add loading states for better UX
- Add error handling for API failures
- Consider WebSocket for real-time updates
