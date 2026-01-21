# Automation Hooks Reference

## Overview
All automation hooks are located in `.kiro/hooks/` and are active by default.

---

## Hook Directory

### 1. Lint on Save
**File**: `lint-on-save.json`
**Trigger**: Save TypeScript/JavaScript files
**Pattern**: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
**Action**: Automatic code quality check
**Output**: Linting violations, type issues, suggestions

```
When: Save any .ts, .tsx, .js, .jsx file
Then: Analyze for syntax errors, type issues, linting problems
```

---

### 2. Code Quality Check
**File**: `code-quality-check.json`
**Trigger**: Save code files
**Pattern**: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
**Action**: Detect code smells and quality issues
**Output**: Code smells, complexity, duplication, refactoring suggestions

```
When: Save any code file
Then: Check for code smells, complexity, duplication
```

---

### 3. SEO Validation
**File**: `seo-validation.json`
**Trigger**: Save SEO-related files
**Pattern**: `**/seoAsset*`, `**/SEO*`, `**/*seo*.ts`, `**/*seo*.tsx`
**Action**: Validate SEO assets and metadata
**Output**: Metadata completeness, content optimization, linking structure

```
When: Save any SEO file
Then: Validate SEO structure, metadata, content optimization
```

---

### 4. Migration Compatibility Check
**File**: `migration-compatibility.json`
**Trigger**: Save migration files
**Pattern**: `**/migrations/**`, `**/*migration*`
**Action**: Analyze migration compatibility
**Output**: Breaking changes, data safety, rollback safety

```
When: Save any migration file
Then: Check for breaking changes, data compatibility, rollback safety
```

---

### 5. Security Audit
**File**: `security-audit.json`
**Trigger**: Save auth/security files
**Pattern**: `**/auth*`, `**/controllers/**`, `**/routes/**`, `**/*security*`
**Action**: Security vulnerability scanning
**Output**: Vulnerabilities, authentication issues, data protection

```
When: Save any auth/security file
Then: Scan for vulnerabilities, check authentication, validate data handling
```

---

### 6. Performance Analysis
**File**: `performance-analysis.json`
**Trigger**: Manual trigger (user-triggered)
**Pattern**: N/A (manual)
**Action**: Analyze performance bottlenecks
**Output**: Bundle size, queries, memory, components, optimization tips

```
When: User manually triggers
Then: Analyze performance bottlenecks, bundle size, queries, memory
```

---

### 7. Codebase Health Check
**File**: `codebase-health-check.json`
**Trigger**: Manual trigger (user-triggered)
**Pattern**: N/A (manual)
**Action**: Complete codebase audit
**Output**: Code quality, performance, security, SEO, migrations

```
When: User manually triggers
Then: Run complete codebase health check across all domains
```

---

### 8. Format on Commit
**File**: `format-on-commit.json`
**Trigger**: On prompt submit (commit)
**Pattern**: N/A (prompt-based)
**Action**: Format and lint before commit
**Output**: Formatted code, linting results

```
When: User submits prompt (commit)
Then: Run npm run lint:fix and format code
```

---

### 9. File Creation Template
**File**: `file-creation-template.json`
**Trigger**: Create new code file
**Pattern**: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
**Action**: Suggest best practices for new files
**Output**: Best practices, structure suggestions, testing recommendations

```
When: New code file is created
Then: Suggest best practices, structure, testing, documentation
```

---

### 10. Dependency Impact Analysis
**File**: `dependency-impact-analysis.json`
**Trigger**: Delete code file
**Pattern**: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
**Action**: Analyze impact of file deletion
**Output**: Broken dependencies, files to update, migration path

```
When: Code file is deleted
Then: Analyze broken dependencies, files to update, migration path
```

---

## How to Use Hooks

### Automatic Hooks (No Action Required)
These hooks run automatically when you save files:
- Lint on Save
- Code Quality Check
- SEO Validation
- Migration Compatibility Check
- Security Audit
- File Creation Template
- Dependency Impact Analysis

### Manual Hooks (Ask Kiro)
These hooks require manual trigger:

**Performance Analysis**
```
Ask Kiro: "Run performance analysis on the codebase"
```

**Codebase Health Check**
```
Ask Kiro: "Run a complete codebase health check"
```

### Commit Hooks
These hooks run on commit:

**Format on Commit**
```
Automatically runs when you commit code
```

---

## Hook Configuration

### Hook Structure
```json
{
  "name": "Hook Name",
  "version": "1.0.0",
  "description": "What this hook does",
  "when": {
    "type": "fileEdited|fileCreated|fileDeleted|userTriggered|promptSubmit",
    "patterns": ["**/*.ts", "**/*.tsx"]
  },
  "then": {
    "type": "askAgent|runCommand",
    "prompt": "Instructions for analysis"
  }
}
```

### Trigger Types
- `fileEdited` - Runs when file is saved
- `fileCreated` - Runs when new file is created
- `fileDeleted` - Runs when file is deleted
- `userTriggered` - Runs on manual trigger
- `promptSubmit` - Runs on prompt submission

### Action Types
- `askAgent` - Ask Kiro to analyze
- `runCommand` - Run shell command

---

## Customizing Hooks

### Modify File Patterns
Edit the `patterns` array to match different files:

```json
"patterns": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
```

### Modify Analysis Prompt
Edit the `prompt` to change analysis behavior:

```json
"prompt": "Analyze for specific issues..."
```

### Add New Patterns
Add more patterns to trigger on additional files:

```json
"patterns": ["**/*.ts", "**/*.tsx", "**/custom/**"]
```

---

## Creating New Hooks

### Step 1: Create File
Create a new JSON file in `.kiro/hooks/`:
```
.kiro/hooks/my-custom-hook.json
```

### Step 2: Define Structure
```json
{
  "name": "My Custom Hook",
  "version": "1.0.0",
  "description": "What this hook does",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Analyze for specific issues"
  }
}
```

### Step 3: Save
Save the file and it's active immediately.

---

## Hook Execution Order

When multiple hooks trigger:
1. All matching hooks run in parallel
2. Results appear in chat
3. User can apply fixes

---

## Troubleshooting Hooks

### Hook Not Triggering

**Check:**
1. File extension matches pattern
2. File is in correct directory
3. File is saved (not just edited)
4. JSON syntax is valid

**Fix:**
1. Verify pattern in hook configuration
2. Check file location
3. Ensure file is saved
4. Try manual trigger

### Hook Running Unexpectedly

**Check:**
1. File pattern is too broad
2. Multiple hooks match same file
3. Hook is enabled

**Fix:**
1. Make pattern more specific
2. Review all hook patterns
3. Disable hook if not needed

### Hook Performance Issues

**Check:**
1. File size is very large
2. Pattern is too broad
3. Codebase is very large

**Fix:**
1. Split large files
2. Make pattern more specific
3. Optimize analysis scope

---

## Hook Best Practices

### Do's
✅ Keep patterns specific
✅ Use meaningful names
✅ Document purpose
✅ Test before deploying
✅ Monitor performance

### Don'ts
❌ Use overly broad patterns
❌ Create duplicate hooks
❌ Ignore performance issues
❌ Leave hooks unconfigured
❌ Forget to save changes

---

## Common Hook Patterns

### TypeScript/JavaScript Files
```json
"patterns": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
```

### Backend Files
```json
"patterns": ["backend/**/*.ts", "backend/**/*.js"]
```

### Frontend Files
```json
"patterns": ["frontend/**/*.tsx", "frontend/**/*.ts"]
```

### Specific Directories
```json
"patterns": ["**/controllers/**", "**/services/**"]
```

### Specific File Names
```json
"patterns": ["**/*migration*", "**/*auth*"]
```

---

## Hook Monitoring

### View Hook Status
Check `.kiro/hooks/` directory to see all active hooks.

### Monitor Execution
Review chat history to see hook execution results.

### Track Performance
Monitor how long hooks take to execute.

---

## Support

### Getting Help
1. Ask Kiro about hook issues
2. Check hook configuration
3. Review steering guides
4. Check troubleshooting section

### Common Commands
```
Ask Kiro: "Why didn't the hook trigger?"
Ask Kiro: "How do I modify this hook?"
Ask Kiro: "Create a new hook for [purpose]"
```

---

## Summary

You have 10 powerful automation hooks that:
- ✅ Run automatically on file save
- ✅ Provide instant feedback
- ✅ Detect issues early
- ✅ Suggest fixes
- ✅ Are fully customizable
- ✅ Integrate seamlessly

**Start using them now by saving a file!**

---

**Last Updated**: January 21, 2026
**Version**: 1.0.0
**Status**: ✅ Active and Ready
