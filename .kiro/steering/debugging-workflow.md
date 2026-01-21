# Debugging and Analysis Workflow

## Quick Start

### 1. Automatic Analysis (On Save)
Files are automatically analyzed when you save:
- **Code files** (.ts, .tsx, .js, .jsx) → Lint + Quality check
- **SEO files** → SEO validation
- **Migration files** → Compatibility check
- **Auth/Security files** → Security audit

### 2. Manual Triggers
Use these commands to run on-demand analysis:

**Performance Analysis**
```
Ask Kiro: "Run performance analysis on the codebase"
```

**Full Codebase Audit**
```
Ask Kiro: "Run a complete codebase health check"
```

**Specific File Analysis**
```
Ask Kiro: "Analyze [filename] for issues"
```

## Analysis Types

### Code Quality Analysis
Detects:
- Syntax errors and type issues
- Code smells and anti-patterns
- Unused variables and imports
- Complex functions needing refactoring
- Missing error handling

### Performance Analysis
Checks:
- Bundle size and imports
- Inefficient loops and algorithms
- Memory leaks
- Database query efficiency
- Component re-render issues

### SEO Analysis
Validates:
- Metadata completeness
- Content optimization
- Internal linking
- Schema markup
- Backlink quality

### Security Analysis
Scans for:
- SQL injection vulnerabilities
- XSS vulnerabilities
- CSRF protection
- Authentication issues
- Sensitive data exposure

### Migration Analysis
Reviews:
- Breaking changes
- Data compatibility
- Rollback safety
- Performance impact
- Upgrade path

## Resolution Workflow

1. **Issue Detected** → Automatic analysis triggered
2. **Analysis Complete** → Detailed report provided
3. **Suggestions Given** → Specific fixes recommended
4. **One-Click Fix** → Apply suggested changes
5. **Verification** → Re-analyze to confirm fix
6. **Documentation** → Track resolution history

## Multi-Version Support

### Tracking Changes
- Automatically detects file modifications
- Compares against previous versions
- Identifies breaking changes
- Suggests migration paths

### Version Compatibility
- Checks TypeScript version compatibility
- Validates Node.js version requirements
- Reviews dependency updates
- Detects deprecations

## Integration with Git

### Pre-Commit Checks
- Runs linting on staged files
- Checks for security issues
- Validates migrations
- Ensures code quality

### Commit Message Analysis
- Validates commit message format
- Checks for issue references
- Ensures proper documentation

## Performance Monitoring

### Metrics Tracked
- Build time
- Bundle size
- Runtime performance
- Database query time
- API response time

### Optimization Recommendations
- Code splitting opportunities
- Lazy loading suggestions
- Caching strategies
- Database indexing
- Query optimization

## Best Practices

1. **Save Frequently** - Catch issues early
2. **Review Suggestions** - Understand recommendations
3. **Test Changes** - Verify fixes work
4. **Commit Often** - Smaller, focused commits
5. **Monitor Metrics** - Track improvements

## Troubleshooting

### If Analysis Doesn't Trigger
1. Check file pattern matches hook configuration
2. Ensure file is in supported format
3. Try manual trigger via chat

### If Suggestions Seem Wrong
1. Provide more context in chat
2. Ask for alternative approaches
3. Reference specific code sections

### For Complex Issues
1. Use context-gatherer to explore codebase
2. Ask for step-by-step debugging
3. Request detailed analysis with examples
