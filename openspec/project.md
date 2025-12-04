# Project Context

## Purpose
A CLI tool for automated invoice processing and file management. The tool accepts PDF files or ZIP archives containing invoices, uses vision models to extract invoice metadata (date and supplier name), and renames files to a standardized `date-supplier` format. Includes automatic translation of Thai supplier names to English.

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **CLI Framework**: Commander.js
- **Vision Models**:
  - Google Gemini (cloud-based primary)
  - Ollama (local models support)
  - OpenRouter (alternative cloud providers)
  - LM Studio (local OpenAI-compatible API)
- **File Processing**:
  - PDF parsing libraries
  - ZIP archive handling
- **Testing**: Jest for unit tests
- **Code Quality**: ESLint + Prettier

## Project Conventions

### Code Style
- Use ESLint with TypeScript-specific rules
- Prettier for consistent code formatting
- Follow naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
  - Descriptive names that reflect purpose
- Prefer explicit types over `any`
- Use async/await over raw promises

### Architecture Patterns
- **Plugin System Architecture**: Extensible design allowing for multiple LLM provider integrations
- **Provider Pattern**: Abstract vision model interactions behind a common interface
- **Separation of Concerns**:
  - CLI input/output handling
  - File system operations (reading, extracting, renaming)
  - Vision model API integration
  - Invoice data extraction and parsing
  - File naming logic
- **Modular Design**: Clear module boundaries with single responsibilities
- Use dependency injection for testability

### Testing Strategy
- **Unit Tests**: Test individual modules and functions in isolation
- **Coverage**: Focus on critical paths:
  - File name generation logic
  - Invoice data extraction
  - Thai to English translation
  - Error handling
- **Mocking**: Mock external API calls to vision models
- **Test Data**: Maintain sample invoices (anonymized) for testing

### Git Workflow
- Standard feature branch workflow
- Meaningful commit messages describing changes
- Test before committing changes
- Keep commits atomic and focused

## Domain Context
- **Invoice Processing**: Invoices contain dates and supplier information that must be accurately extracted
- **Date Formats**: Handle various date formats from different regions (Thai, English)
- **Thai Language**: Some invoices contain Thai text requiring translation
  - Supplier names in Thai should be transliterated to English
  - Use consistent translation approach
- **File Naming**: Standard format: `YYYY-MM-DD-SupplierName.pdf`
  - Date: ISO format (YYYY-MM-DD)
  - Supplier: English, spaces replaced with hyphens or underscores
  - Extension: Preserve original (.pdf)

## Important Constraints
- **Vision Model Availability**: Must handle cases where API services are unavailable
- **Cost Considerations**: Vision model API calls have costs; minimize unnecessary requests
- **File Size Limits**: Different vision models have different file size limits
- **Rate Limiting**: Respect API rate limits for external services
- **Privacy**: Invoice data may contain sensitive information; handle securely
- **Local vs Cloud**: Support both local models (Ollama) and cloud services
- **Batch Processing**: Must efficiently handle ZIP files with multiple invoices

## External Dependencies
- **Google Gemini API**: Primary vision model for invoice analysis
- **Ollama**: Local LLM support for offline/private processing
- **OpenRouter**: Alternative cloud-based vision model access
- **LM Studio**: Local OpenAI-compatible server for privacy-focused processing
- **Translation Services**: May need external translation API for Thai text (or use LLM capabilities)
