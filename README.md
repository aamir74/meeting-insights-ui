# InsightBoard AI - Frontend

React-based frontend for the InsightBoard AI Dependency Engine with interactive task graph visualization.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Chakra UI
- **Graph Visualization**: React Flow
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Features

### Level 1: Basic UI
- Transcript input form with validation
- Task list display
- Status indicators (ready/blocked/completed/error)

### Level 2: Async Job Polling
- Immediate job ID response
- Real-time status updates via polling
- Loading states with spinners
- Duplicate detection notification

### Level 3: Interactive Graph Visualization
- **React Flow Integration**: Visual dependency graph
- **Color-coded Nodes**:
  - 🟢 Green: Ready to start (no unmet dependencies)
  - 🟡 Yellow: Blocked (dependencies not complete)
  - ⚫ Gray: Completed
  - 🔴 Red: Error (circular dependency)
- **Interactive Features**:
  - Click "Complete" button on ready tasks
  - Real-time graph updates
  - Automatic unlocking of dependent tasks
  - Smooth animations
- **Graph Controls**:
  - Zoom in/out
  - Pan around
  - Fit view
  - Hierarchical auto-layout

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskNode.tsx          # Custom React Flow node
│   │   └── TaskGraph.tsx         # Main graph component
│   ├── pages/
│   │   ├── Home.tsx              # Transcript input page
│   │   └── Results.tsx           # Job results & graph page
│   ├── services/
│   │   └── api.ts                # API client (Axios)
│   ├── context/
│   │   └── TaskStore.ts          # Zustand state management
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main app with routing
│   └── main.tsx                  # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## State Management

**Zustand Store** (`src/context/TaskStore.ts`)

Manages task state and completion logic:

```typescript
interface TaskStore {
  tasks: Task[];                    // All tasks
  completedTaskIds: Set<string>;    // Completed task IDs
  setTasks: (tasks) => void;        // Initialize tasks
  completeTask: (taskId) => void;   // Mark task complete
  updateTasks: (tasks) => void;     // Update from server
  reset: () => void;                // Clear state
}
```

**Key Features:**
- Client-side state updates for instant feedback
- Automatic dependency recalculation
- No page refresh required
- Optimistic UI updates

## Graph Layout Algorithm

**Hierarchical Layout** using topological sort:

1. Calculate "levels" for each task based on dependency depth
   - Tasks with no dependencies → Level 0
   - Tasks depending on Level 0 → Level 1
   - And so on...

2. Group tasks by level

3. Position nodes:
   - Horizontal spacing: 350px between tasks in same level
   - Vertical spacing: 150px between levels

4. Draw edges from dependencies to dependent tasks

**Code**: `src/components/TaskGraph.tsx:getLayoutedElements()`

## API Integration

**API Service** (`src/services/api.ts`)

All API calls use Axios with base URL from environment:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

**Methods:**
- `submitTranscript(transcript)`: Submit for processing
- `getJobStatus(jobId)`: Poll job status
- `completeTask(taskId)`: Mark task complete
- `healthCheck()`: Server health check

## Component Breakdown

### 1. Home.tsx

**Purpose**: Transcript submission page

**Features:**
- Large textarea for transcript input
- "Load Example" button with pre-filled meeting transcript
- Client-side validation (min 50 characters)
- Toast notifications for success/errors
- Automatic navigation to results page

**User Flow:**
1. User pastes transcript
2. Clicks "Generate Dependency Graph"
3. API returns job ID
4. Redirects to `/results/:jobId`

---

### 2. Results.tsx

**Purpose**: Job status and graph visualization

**Features:**
- **Polling Mechanism**:
  - Checks job status every 2 seconds
  - Shows loading spinner during processing
  - Displays error alerts if failed
- **Statistics Dashboard**:
  - Total tasks
  - Ready/Blocked/Completed/Error counts
  - Processing time
  - Cycle detection warning
- **Graph Display**: Renders TaskGraph component
- **Legend**: Explains node colors

**States:**
- `pending`: Job queued
- `processing`: AI analyzing (shows spinner)
- `completed`: Display graph
- `failed`: Show error message

---

### 3. TaskNode.tsx

**Purpose**: Custom React Flow node component

**Features:**
- Priority badge (high/medium/low)
- Task description (truncated)
- Status badge
- Dependency count
- "Complete" button (only for ready tasks)
- Error message display
- Color-coded borders

**Interactions:**
- Click "Complete" → Call API → Update Zustand store
- Disabled if task is blocked or has errors
- Shows "✓ Completed" if already done

---

### 4. TaskGraph.tsx

**Purpose**: React Flow graph container

**Features:**
- Automatic layout calculation
- Custom node type (TaskNode)
- Animated edges for blocked tasks
- Fit view on load
- Interactive controls (zoom, pan)
- Updates when task state changes

**React Flow Configuration:**
- `nodeTypes`: Custom TaskNode component
- `ConnectionLineType`: SmoothStep for curved edges
- `MarkerType`: ArrowClosed for dependency direction
- `fitView`: Auto-zoom to fit all nodes

---

## Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

**Production:**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend API running (see backend README)

### Installation

```bash
cd frontend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `VITE_API_URL` to point to your backend:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running

**Development:**
```bash
npm run dev
```

Opens browser at `http://localhost:5173`

**Build for Production:**
```bash
npm run build
```

Output: `dist/` directory

**Preview Production Build:**
```bash
npm run preview
```

---

## Deployment (Netlify)

### Option 1: Netlify UI

1. **Push code to GitHub**
2. **New Site** → Import from Git
3. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. **Environment Variables:**
   - `VITE_API_URL`: Your Render backend URL
5. **Deploy**

### Option 2: Netlify CLI

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Post-Deployment

1. Note your Netlify URL
2. Update backend `.env` with `FRONTEND_URL` for CORS
3. Redeploy backend if needed

---

## Key User Interactions

### 1. Submitting a Transcript

```
User enters transcript → Clicks submit
  ↓
API returns jobId (202 Accepted)
  ↓
Navigate to /results/:jobId
  ↓
Start polling every 2 seconds
```

### 2. Completing a Task

```
User clicks "Complete" on green node
  ↓
API PATCH /tasks/:id/complete
  ↓
Zustand store updates local state
  ↓
React Flow graph re-renders
  ↓
Node turns gray, dependent nodes turn green
```

**No Page Refresh Required!**

---

## Styling

**Chakra UI Theme** (`src/App.tsx`)

- Light mode only
- Custom color scheme
- Responsive containers
- Consistent spacing scale

**React Flow Styles**
- Custom node styling via Chakra components
- Edge colors based on task status
- Animated edges for blocked tasks

---

## Performance Optimizations

1. **Memoization**:
   - TaskNode wrapped in `React.memo`
   - Prevents unnecessary re-renders

2. **Efficient Polling**:
   - 2-second interval (balance between UX and server load)
   - Auto-stop when job completes
   - Cleanup on component unmount

3. **Lazy State Updates**:
   - Zustand only triggers re-renders for changed tasks
   - Set-based completion tracking (O(1) lookups)

4. **Graph Layout Caching**:
   - Layout recalculated only when tasks change
   - React Flow handles incremental updates

---

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support (React Flow)
- High contrast color scheme
- Focus indicators

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## Troubleshooting

**Graph not displaying:**
- Check browser console for errors
- Ensure React Flow CSS is imported
- Verify task data has valid structure

**Polling never completes:**
- Check backend logs for processing errors
- Verify Gemini API key is valid
- Check network tab for failed requests

**CORS errors:**
- Ensure backend `FRONTEND_URL` matches your Netlify URL
- Check backend CORS middleware configuration

---

## Future Enhancements

- [ ] WebSocket for real-time updates (replace polling)
- [ ] Dark mode toggle
- [ ] Export graph as PNG/SVG
- [ ] Task filtering and search
- [ ] Undo task completion
- [ ] Drag-and-drop to reorder tasks
- [ ] Mobile-responsive graph view

---

## License

MIT
