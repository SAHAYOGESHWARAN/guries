# AI-Powered Issue Resolution Framework

## Overview
This steering guide enables comprehensive AI-driven issue analysis, debugging, and resolution across your entire codebase with domain-specific assistance for SEO, performance, and code quality.

## Core Capabilities

### 1. Automatic Code Analysis on Save
- Runs diagnostics on TypeScript/JavaScript files
- Detects syntax errors, type issues, and linting problems
- Provides instant feedback and auto-fix suggestions
- Supports both frontend and backend code

### 2. Multi-Version Support
- Tracks changes across file versions
- Analyzes migration compatibility
- Detects breaking changes
- Provides upgrade guidance

### 3. Domain-Specific Analysis

#### SEO Analysis
- Validates SEO asset structure
- Checks metadata completeness
- Analyzes content optimization
- Reviews backlink quality

#### Performance Analysis
- Identifies performance bottlenecks
- Analyzes bundle size impact
- Detects memory leaks
- Reviews database query efficiency

#### Code Quality
- Enforces coding standards
- Detects code smells
- Identifies security vulnerabilities
- Suggests refactoring opportunities

### 4. Automated Workflows
- Lint on file save
- Format on commit
- Run tests on changes
- Generate documentation

## Usage

### For Code Issues
When you encounter errors or warnings:
1. The system automatically analyzes the problem
2. Provides context-aware suggestions
3. Offers one-click fixes where applicable
4. Tracks resolution history

### For Performance Issues
1. Run performance analysis on specific files
2. Get detailed bottleneck reports
3. Receive optimization recommendations
4. Track improvements over time

### For SEO Issues
1. Validate SEO asset metadata
2. Check content optimization
3. Review linking structure
4. Get compliance recommendations

## Integration Points

- **File Events**: Triggers on save, create, delete
- **Git Events**: Triggers on commit, push
- **Manual Triggers**: On-demand analysis
- **Scheduled Tasks**: Periodic health checks

## Free AI Services Used
- Claude Haiku (via Kiro) - Code analysis and suggestions
- Open-source linters - Code quality checks
- Built-in diagnostics - Type checking and validation

## Best Practices

1. **Regular Analysis**: Run periodic codebase health checks
2. **Version Control**: Always commit before major refactors
3. **Documentation**: Keep migration guides updated
4. **Testing**: Validate fixes before deployment
5. **Monitoring**: Track performance metrics over time
