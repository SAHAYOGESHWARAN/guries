# Domain-Specific Analysis Guide

## SEO Analysis Framework

### What Gets Analyzed
- **Asset Structure**: Validates SEO asset tables and relationships
- **Metadata**: Title, description, keywords, canonical URLs
- **Content**: Headings hierarchy, keyword density, readability
- **Linking**: Internal links, backlinks, anchor text quality
- **Schema**: Structured data markup (JSON-LD, microdata)
- **Performance**: Page speed, Core Web Vitals impact

### Files Monitored
- `**/seoAsset*` - SEO asset components
- `**/SEO*` - SEO-related files
- `**/*seo*.ts` - SEO TypeScript files
- `**/*seo*.tsx` - SEO React components

### Analysis Output
```
SEO Validation Report
├── Metadata Completeness: 85%
├── Content Optimization: 90%
├── Linking Structure: 75%
├── Schema Markup: Valid
├── Performance Impact: Good
└── Recommendations: [list of improvements]
```

### Common Issues Found
1. Missing meta descriptions
2. Duplicate content
3. Broken internal links
4. Missing schema markup
5. Poor heading structure
6. Keyword stuffing
7. Slow page load

### Fixes Applied
- Auto-generate missing descriptions
- Add schema markup
- Fix broken links
- Optimize heading structure
- Improve keyword distribution

---

## Performance Analysis Framework

### What Gets Analyzed
- **Bundle Size**: JavaScript, CSS, assets
- **Imports**: Unused imports, circular dependencies
- **Algorithms**: Time complexity, inefficient loops
- **Memory**: Potential leaks, large allocations
- **Database**: Query efficiency, N+1 problems
- **Components**: Re-render issues, prop drilling

### Analysis Scope
- Frontend: React components, hooks, state management
- Backend: Controllers, services, database queries
- Build: Webpack/Vite configuration, code splitting

### Performance Metrics
```
Performance Report
├── Bundle Size: 245KB (target: 200KB)
├── Import Efficiency: 92%
├── Algorithm Complexity: O(n²) detected
├── Memory Usage: Normal
├── Query Performance: 3 slow queries
└── Component Performance: 2 re-render issues
```

### Optimization Recommendations
1. **Code Splitting**: Lazy load routes and components
2. **Tree Shaking**: Remove unused code
3. **Caching**: Implement memoization
4. **Database**: Add indexes, optimize queries
5. **Assets**: Compress images, use WebP
6. **Lazy Loading**: Defer non-critical resources

### Tools Used
- Webpack Bundle Analyzer
- Lighthouse
- Chrome DevTools
- Query analysis
- Memory profiling

---

## Security Analysis Framework

### What Gets Analyzed
- **Authentication**: Login logic, token handling
- **Authorization**: Role-based access control
- **Input Validation**: SQL injection, XSS prevention
- **Data Protection**: Encryption, sensitive data handling
- **API Security**: Rate limiting, CORS, headers
- **Dependencies**: Known vulnerabilities

### Files Monitored
- `**/auth*` - Authentication files
- `**/controllers/**` - API controllers
- `**/routes/**` - Route definitions
- `**/*security*` - Security-related files

### Security Scan Output
```
Security Audit Report
├── Authentication: ✓ Secure
├── Authorization: ⚠ Review needed
├── Input Validation: ✓ Secure
├── Data Protection: ✓ Encrypted
├── API Security: ⚠ Missing CORS headers
└── Vulnerabilities: 0 critical, 1 medium
```

### Common Vulnerabilities
1. SQL injection risks
2. XSS vulnerabilities
3. CSRF token missing
4. Weak password validation
5. Exposed sensitive data
6. Missing rate limiting
7. Insecure dependencies

### Security Fixes
- Parameterized queries
- Input sanitization
- CSRF tokens
- Strong password requirements
- Data encryption
- Rate limiting
- Dependency updates

---

## Code Quality Analysis Framework

### What Gets Analyzed
- **Syntax**: Errors and warnings
- **Types**: Type safety, missing types
- **Complexity**: Cyclomatic complexity
- **Duplication**: Code duplication
- **Naming**: Unclear variable/function names
- **Error Handling**: Missing try-catch, error propagation
- **Testing**: Test coverage, missing tests

### Metrics Tracked
```
Code Quality Report
├── Syntax Errors: 0
├── Type Safety: 98%
├── Complexity: Average
├── Duplication: 5%
├── Naming Quality: Good
├── Error Handling: 90%
└── Test Coverage: 75%
```

### Code Smells Detected
1. Long functions (>50 lines)
2. Deep nesting (>4 levels)
3. Large classes/components
4. Duplicate code
5. Magic numbers
6. Unclear naming
7. Missing documentation

### Refactoring Suggestions
- Extract functions
- Reduce nesting
- Split components
- Remove duplication
- Use constants
- Improve naming
- Add documentation

---

## Migration Analysis Framework

### What Gets Analyzed
- **Syntax**: Valid migration syntax
- **Breaking Changes**: Incompatible changes
- **Data Safety**: Data loss risks
- **Rollback**: Rollback feasibility
- **Performance**: Migration performance impact
- **Dependencies**: Dependency compatibility

### Migration Validation
```
Migration Analysis Report
├── Syntax: ✓ Valid
├── Breaking Changes: 1 detected
├── Data Safety: ⚠ Review needed
├── Rollback: ✓ Safe
├── Performance: Good
└── Risk Level: Medium
```

### Issues Detected
1. Dropping columns without backup
2. Renaming tables without aliases
3. Incompatible type changes
4. Missing rollback logic
5. Performance-impacting changes
6. Dependency conflicts

### Migration Guidance
- Backup data before migration
- Create rollback procedures
- Test on staging first
- Monitor performance
- Document changes
- Verify data integrity

---

## How to Trigger Analysis

### Automatic (On File Save)
```typescript
// Save any SEO file → SEO validation runs
// Save any auth file → Security audit runs
// Save any migration → Compatibility check runs
```

### Manual Triggers
```
Ask Kiro: "Run SEO analysis on the codebase"
Ask Kiro: "Analyze performance bottlenecks"
Ask Kiro: "Run security audit"
Ask Kiro: "Check code quality"
Ask Kiro: "Validate migrations"
```

### Scheduled Analysis
```
Ask Kiro: "Run a complete codebase health check"
Ask Kiro: "Generate performance report"
Ask Kiro: "Create security audit report"
```

---

## Integration with Development Workflow

### Pre-Commit
1. Code quality check
2. Security scan
3. Performance impact
4. Type checking

### Pre-Push
1. Full security audit
2. Performance analysis
3. Migration validation
4. Dependency check

### Pre-Deploy
1. Complete codebase audit
2. Performance report
3. Security report
4. Migration readiness

---

## Best Practices by Domain

### SEO Best Practices
- Keep descriptions under 160 characters
- Use descriptive, keyword-rich titles
- Maintain proper heading hierarchy
- Use internal links strategically
- Add schema markup
- Optimize images
- Monitor Core Web Vitals

### Performance Best Practices
- Monitor bundle size
- Use code splitting
- Implement caching
- Optimize database queries
- Lazy load components
- Compress assets
- Track metrics

### Security Best Practices
- Use parameterized queries
- Validate all inputs
- Implement rate limiting
- Use HTTPS everywhere
- Keep dependencies updated
- Encrypt sensitive data
- Regular security audits

### Code Quality Best Practices
- Keep functions small
- Use meaningful names
- Add documentation
- Write tests
- Reduce duplication
- Handle errors properly
- Follow conventions
