# Dynamic Provider API Specification

## Purpose
Provide complete provider and model configuration through a single API endpoint, eliminating the need for hardcoded frontend data.

## ADDED Requirements

### Requirement: API must return provider metadata
The `/api/providers` endpoint must include complete metadata for each provider including name, display name, description, availability status, and model list.

#### Scenario: Fetch provider configuration
```
GIVEN the server is running
WHEN client requests GET /api/providers
THEN response includes providers array
AND each provider has name, displayName, description, available fields
AND each provider includes models array with id, name, and optional recommended flag
```

#### Scenario: Provider availability reflected in API
```
GIVEN OpenRouter is available
WHEN client requests GET /api/providers
THEN OpenRouter provider has available: true
AND LM Studio provider has available: true
```

### Requirement: API must return provider selection options
The `/api/providers` endpoint must include predefined provider selection options like "Auto" mode.

#### Scenario: Fetch provider options
```
GIVEN the server is running
WHEN client requests GET /api/providers
THEN response includes providerOptions array
AND providerOptions contains {value: 'auto', name: 'Auto', description: ...}
```

### Requirement: Model recommendations indicated in API
Models marked as recommended must include a `recommended: true` flag in the API response.

#### Scenario: Recommended model flagged
```
GIVEN Qwen3-VL-235B is the recommended model
WHEN client requests GET /api/providers
THEN Qwen3-VL-235B model object includes recommended: true
AND other models do not have recommended flag or have recommended: false
```

## Success Criteria
- `/api/providers` returns complete configuration
- No configuration data hardcoded in frontend
- Frontend can render all UI from API response alone
- Adding new providers requires backend changes only
