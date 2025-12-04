# Eliminate Hardcoded Frontend Data

## Summary
Replace all hardcoded provider and model data in the frontend with dynamic API-driven configuration. This eliminates duplication, ensures consistency, and establishes the backend as the single source of truth for all configuration data.

## Problem
The settings page had hardcoded:
- Provider names and descriptions (OpenRouter, LM Studio)
- Model lists (10+ vision models)
- Provider options (Auto, manual selection)
- Static UI text that should be dynamic

This creates:
- Maintenance burden (update in 2 places)
- Sync issues between frontend/backend
- Inconsistent data representation
- Difficult to add new providers/models

## Solution
1. Extend `/api/providers` endpoint to return all configuration
2. Update frontend to dynamically load everything from API
3. Remove all hardcoded configuration from HTML/JavaScript

## Benefits
- Single source of truth (backend API)
- Easy to add providers/models (backend only)
- No frontend changes needed for new config
- Consistent data across application
- Better maintainability

## Scope
- Backend API enhancement
- Frontend dynamic rendering
- Documentation updates

## Non-Goals
- Changing provider registration mechanism
- Adding new providers
- Modifying model selection logic

## Risks
- None (improvement only, backward compatible)

## Related Changes
- None (standalone improvement)
