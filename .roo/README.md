# DXM369 Rules Organization System (.roo)

This directory contains organized rule files for different agent contexts and purposes.

## Structure

- **`rules-architect/AGENTS.md`** - Architecture and system design rules
  - DXM Scoring Engine Architecture
  - Amazon API Integration Architecture
  - Affiliate Revenue Architecture
  - Environment Validation Architecture
  - Component Architecture Constraints
  - Database Architecture Patterns
  - API Route Architecture
  - Caching and Performance Architecture
  - Build and Deployment Architecture
  - Development Workflow Architecture
  - Operational Architecture
  - Security Architecture
  - Analytics and Monitoring Architecture

- **`rules-ask/AGENTS.md`** - Documentation and context rules for Q&A
  - DXM Scoring System Context
  - Amazon API Integration Details
  - Affiliate Revenue System
  - Environment Architecture
  - Component Architecture Patterns
  - Database Schema Understanding
  - API Route Patterns
  - Build and Deployment Context
  - Performance Optimization Details
  - Development Workflow Context
  - Operational Documentation

- **`rules-code/AGENTS.md`** - Coding implementation rules
  - DXM Scoring Integration
  - Affiliate Link Generation
  - API Route Patterns
  - Environment Variable Access
  - Amazon API Integration
  - Logging Requirements

- **`rules-debug/AGENTS.md`** - Debugging and troubleshooting rules
  - Environment Validation Debugging
  - API Route Debugging
  - Amazon API Debugging
  - Database Debugging
  - DXM Scoring Debugging
  - Affiliate Link Debugging
  - Component Debugging
  - Logging Debugging
  - Build Debugging
  - Performance Debugging
  - Deployment Debugging

## Usage

These rules are automatically referenced by Cursor agents based on context:
- **Architecture questions** → `rules-architect/AGENTS.md`
- **General questions** → `rules-ask/AGENTS.md`
- **Code implementation** → `rules-code/AGENTS.md`
- **Debugging issues** → `rules-debug/AGENTS.md`

## Integration

The main `.cursorrules` file contains project-wide rules that apply to all contexts. The `.roo/` directory provides specialized rules for specific agent interactions.

## Maintenance

When updating rules:
1. Update the relevant `.roo/rules-*/AGENTS.md` file
2. Update this README if structure changes
3. Consider if changes affect other rule files
4. Document changes in `ops/` directory

---

**Last Updated:** 2025-12-07  
**Status:** Active

