# Today's Report Feature

## Overview

A comprehensive daily report feature has been added to the Marketing Control Center that provides a detailed summary of all activities, metrics, and status for the current day.

## What you should do each day (quick checklist)

1. **Start required services**
   - Make sure **PostgreSQL** is running and reachable on the port configured in `backend/.env` (default `5432` and DB name `mcc_db`).
   - Start the **backend API**:
     ```bash
     cd backend
     npm run dev
     ```
   - (Optional, for UI usage) Start the **frontend**:
     ```bash
     npm run dev:client
     ```

2. **Verify the system is healthy**
   - Open in browser or use curl:
     - `http://localhost:3001/health` → should return status `OK`.
     - `http://localhost:3001/api/v1/system/stats` → should return system + DB stats.

3. **Run the automated project tests (optional but recommended)**
   - From the project root:
     ```bash
     node test-project.js
     ```
   - Confirm that most/all tests are **Passed**. If they all fail with connection errors, fix DB/Backend first, then re-run.

4. **Generate today's report**
   - Use one of the options below (Node script, direct API, or frontend).


## API Endpoint

**GET** `/api/v1/reports/today`

Returns a JSON object containing:
- Summary statistics (total activities, tasks completed/created, traffic)
- Detailed activities breakdown (campaigns, tasks, content, projects, SMM posts, backlinks, submissions, QC runs)
- Today's notifications
- Current system status
- Performance metrics (completion rate, productivity score)

## Usage

### Option 1: Using the Node.js Script

1. **Start the backend server** (if not already running):
   ```bash
   npm run dev
   # or
   cd backend && npm start
   ```

2. **Run the report script**:
   ```bash
   node get-today-report.js
   ```

This will display a formatted report in the terminal.

### Option 2: Direct API Call

You can call the API directly using curl, Postman, or any HTTP client:

```bash
curl http://localhost:3001/api/v1/reports/today
```

Or in a browser (if CORS is configured):
```
http://localhost:3001/api/v1/reports/today
```

### Option 3: From Frontend

Add to your React component:

```typescript
const fetchTodayReport = async () => {
  const response = await fetch('http://localhost:3001/api/v1/reports/today');
  const report = await response.json();
  console.log(report);
};
```

## Report Structure

The report includes:

### Summary
- Total activities today
- Tasks completed
- Tasks created
- Today's traffic
- Task completion rate
- Productivity score

### Activities
- **Campaigns**: New campaigns created today
- **Tasks**: Tasks created today with status and priority
- **Content**: Content items created with type and pipeline stage
- **Projects**: New projects created
- **SMM Posts**: Social media posts created
- **Backlinks**: Backlinks added
- **Submissions**: Backlink submissions with status breakdown
- **QC Runs**: Quality control runs performed

### Notifications
- Total notifications today
- Unread count
- Recent notifications list

### Current Status
- Active campaigns count
- Pending tasks count
- Toxic link alerts

## Example Output

```
================================================================================
📊 TODAY'S REPORT - Marketing Control Center
================================================================================

--------------------------------------------------------------------------------

📈 SUMMARY
--------------------------------------------------------------------------------
Total Activities Today: 15
Tasks Completed: 8
Tasks Created: 12
Today's Traffic: 1,234
Task Completion Rate: 67%
Productivity Score: 95/100

📋 TODAY'S ACTIVITIES
--------------------------------------------------------------------------------

🎯 Campaigns Created: 2
   - Summer Campaign (SEO) - active
   - Product Launch (Content) - active

✅ Tasks Created: 12
   - Write blog post - completed (Priority: high)
   - Review content - in_progress (Priority: medium)
   ...

📝 Content Created: 5
   - Blog Post: Marketing Tips - blog_post - Stage: draft
   ...

🔔 NOTIFICATIONS
--------------------------------------------------------------------------------
Total: 3
Unread: 1
   ○ [task] New task assigned to you
   ✓ [campaign] Campaign approved
   ✓ [content] Content published

## Files Created

1. **backend/controllers/reportController.ts** - Controller with `getTodayReport` function
2. **backend/routes/api.ts** - Updated with new `/reports/today` route
3. **get-today-report.js** - Node.js script to fetch and display the report

## Notes

- The report uses `DATE(created_at) = $1` to filter records created today
- All queries run in parallel for optimal performance
- The report includes both today's activities and current system status
- Traffic data comes from the `analytics_daily_traffic` table

## Troubleshooting

If you get a connection error:
1. Ensure the backend server is running on port 3001
2. Check that the database is connected
3. Verify the API endpoint is accessible: `http://localhost:3001/api/v1/reports/today`

If the report shows zero activities:
- This is normal if no records were created today
- The report will still show current system status and metrics

