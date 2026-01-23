# Dashboard Dynamic Updates - Quick Start

## What Changed

The dashboard now displays **real, live data** from your database instead of demo data. All metrics update automatically every 30 seconds.

## How It Works

### Backend (Node.js/Express)
New endpoints in `backend/routes/analytics-dashboard.ts`:
- `/api/v1/analytics/dashboard/stats` - Campaign, content, task, team counts with trends
- `/api/v1/analytics/dashboard/projects` - Recent projects with progress
- `/api/v1/analytics/dashboard/tasks` - Upcoming tasks by priority
- `/api/v1/analytics/dashboard/activity` - Recent team activity

### Frontend (React)
Updated `frontend/views/DashboardView.tsx`:
- Fetches data from backend on load
- Auto-refreshes every 30 seconds
- Displays real counts and trends
- Shows actual projects, tasks, and activity

## Key Features

✅ **Dynamic Stats**
- Active campaigns count with trend %
- Published content count with trend %
- Completed tasks count with trend %
- Team members count

✅ **Real Projects**
- Shows actual projects from database
- Displays progress bars
- Shows project status (In Progress, QC Pending, etc.)
- Shows last updated time

✅ **Upcoming Tasks**
- Shows incomplete tasks
- Sorted by priority (high first)
- Shows due dates
- Color-coded by priority

✅ **Recent Activity**
- Task completions
- Content publications
- Campaign updates
- Shows who did what and when

## Data Sources

| Component | Source | Query |
|-----------|--------|-------|
| Active Campaigns | campaigns table | WHERE status IN ('active', 'In Progress') |
| Content Published | content table | WHERE status = 'Published' |
| Tasks Completed | tasks table | WHERE status = 'completed' |
| Team Members | users table | COUNT(*) |
| Projects | projects table | ORDER BY updated_at DESC LIMIT 10 |
| Tasks | tasks table | WHERE status != 'completed' ORDER BY priority |
| Activity | tasks, content, campaigns | Combined and sorted by timestamp |

## Trend Calculation

Compares last 30 days with previous 30 days:
- **+12%** = 12% increase
- **-3%** = 3% decrease
- **0%** = No change

## Refresh Behavior

- **Initial Load:** Fetches data when dashboard opens
- **Auto-Refresh:** Updates every 30 seconds
- **Cleanup:** Stops refreshing when dashboard closes

## Testing

1. Create a new campaign/task/project
2. Wait up to 30 seconds
3. Dashboard updates automatically
4. Check trends update correctly

## Troubleshooting

### Dashboard shows "No data"
- Check if campaigns/tasks/projects exist in database
- Verify backend is running on port 3003
- Check browser console for API errors

### Data not updating
- Verify refresh interval (30 seconds)
- Check network tab for API calls
- Ensure backend endpoints are accessible

### Trends showing 0%
- Need data from both 30-day periods
- Create more campaigns/tasks to see trends

## API Response Examples

### Stats Response
```json
{
  "activeCampaigns": 24,
  "campaignsTrendPercent": 12,
  "contentPublished": 156,
  "contentTrendPercent": 8,
  "tasksCompleted": 89,
  "tasksTrendPercent": -3,
  "teamMembers": 12
}
```

### Projects Response
```json
[
  {
    "id": 1,
    "name": "Q4 Marketing Campaign",
    "status": "In Progress",
    "progress": 65,
    "updated_at": "2024-01-23T10:30:00Z"
  }
]
```

### Activity Response
```json
[
  {
    "id": 1,
    "user_name": "Jane Smith",
    "action": "completed task",
    "target": "SEO Content Optimization",
    "timestamp": "2024-01-23T10:25:00Z"
  }
]
```

## Files Modified

- `backend/routes/analytics-dashboard.ts` - Added 4 new endpoints
- `frontend/views/DashboardView.tsx` - Complete rewrite for dynamic data

## No Breaking Changes

- All existing functionality preserved
- Same UI/UX as before
- Just now with real data instead of demo data
- Backward compatible with existing database schema
