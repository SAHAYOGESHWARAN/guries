# Dashboard Dynamic Update Implementation

## Overview
The dashboard now dynamically updates based on actual user activity from the database. All data is fetched from the backend in real-time and refreshes every 30 seconds.

## Backend Changes

### New API Endpoints (backend/routes/analytics-dashboard.ts)

#### 1. Dashboard Stats Endpoint
**Route:** `GET /api/v1/analytics/dashboard/stats`

Returns dynamic statistics:
- `activeCampaigns` - Count of active campaigns
- `campaignsTrendPercent` - Percentage change from last 30 days
- `contentPublished` - Count of published content
- `contentTrendPercent` - Percentage change from last 30 days
- `tasksCompleted` - Count of completed tasks
- `tasksTrendPercent` - Percentage change from last 30 days
- `teamMembers` - Total team members count

**Calculation Logic:**
- Compares current 30-day period with previous 30-day period
- Calculates percentage change: `((current - previous) / previous) * 100`
- Handles edge cases (zero previous values)

#### 2. Dashboard Projects Endpoint
**Route:** `GET /api/v1/analytics/dashboard/projects`

Returns recent projects with:
- Project ID, name, status, progress
- Created and updated timestamps
- Limited to 10 most recent projects

#### 3. Dashboard Tasks Endpoint
**Route:** `GET /api/v1/analytics/dashboard/tasks`

Returns upcoming tasks with:
- Task ID, name, status, priority
- Due date and timestamps
- Filtered to exclude completed tasks
- Sorted by priority (high first) and due date

#### 4. Dashboard Activity Endpoint
**Route:** `GET /api/v1/analytics/dashboard/activity`

Returns recent activity from:
- Task completions
- Content publications
- Campaign updates

Combines all activities and sorts by timestamp (newest first).

## Frontend Changes

### DashboardView Component (frontend/views/DashboardView.tsx)

#### Data Fetching
- Fetches all dashboard data on component mount
- Auto-refreshes every 30 seconds
- Handles loading state with spinner
- Error handling with console logging

#### Dynamic Display
- **Stats Cards:** Show real counts with trend percentages
- **Projects Section:** Displays actual projects from database
- **Tasks Section:** Shows upcoming tasks with priorities
- **Activity Section:** Shows recent team activity

#### Helper Functions
- `getTrendType()` - Determines if trend is up/down/neutral
- `formatTrendText()` - Formats trend percentage as readable text
- `getStatusColor()` - Maps project status to color
- `getPriorityColor()` - Maps task priority to color
- `formatDate()` - Converts timestamps to relative time (e.g., "2 hours ago")

## Data Flow

```
User Activity (Database)
    ↓
Backend Queries (analytics-dashboard.ts)
    ↓
API Endpoints (/api/v1/analytics/dashboard/*)
    ↓
Frontend Fetch (DashboardView.tsx)
    ↓
State Update (setStats, setProjects, setTasks, setActivity)
    ↓
Component Re-render
    ↓
Display Updated Dashboard
```

## Real-Time Updates

### Refresh Interval
- Initial load on component mount
- Auto-refresh every 30 seconds
- Cleanup interval on component unmount

### Data Sources
- **Campaigns Table:** Active campaigns with status filtering
- **Content Table:** Published content
- **Tasks Table:** Incomplete tasks sorted by priority
- **Projects Table:** Recent projects with progress
- **Users Table:** Team member count

## Trend Calculation

### Formula
```
Trend % = ((Current Period - Previous Period) / Previous Period) * 100
```

### Example
- Last 30 days: 20 campaigns
- Previous 30 days: 18 campaigns
- Trend: ((20 - 18) / 18) * 100 = +11%

## Status Indicators

### Project Status Colors
- **Blue:** In Progress
- **Yellow:** QC Pending
- **Green:** QC Passed / Completed
- **Gray:** Draft

### Task Priority Colors
- **Red:** High priority
- **Orange:** Medium priority
- **Green:** Low priority

## Time Formatting

Relative time display:
- Less than 1 minute: "just now"
- Less than 1 hour: "X minutes ago"
- Less than 24 hours: "X hours ago"
- Less than 7 days: "X days ago"
- Older: Full date

## Error Handling

- API errors logged to console
- Dashboard shows empty states if no data
- Loading spinner during initial fetch
- Graceful fallbacks for missing data

## Performance Considerations

- 30-second refresh interval balances freshness and performance
- Limits queries to recent data (last 30 days for trends)
- Pagination/limiting on activity queries
- Efficient database queries with proper indexing

## Testing

To test the dynamic updates:

1. Create a new campaign/task/project
2. Dashboard should update within 30 seconds
3. Check trend percentages update correctly
4. Verify activity log shows new entries
5. Test with multiple users for concurrent updates

## Future Enhancements

- Real-time updates via WebSocket instead of polling
- Customizable refresh intervals
- User preference for data display
- Advanced filtering options
- Export functionality
- Custom date ranges for trends
