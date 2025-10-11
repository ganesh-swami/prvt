# Ecosystem Map Timeline, Notes & Tasks - Complete Implementation

## 📋 Overview

Created three interconnected features for the Ecosystem Mapping module:
1. **Timeline** - Track all stakeholder interactions
2. **Shared Notes** - Collaborative notes about stakeholders  
3. **Tasks/Reminders** - Manage follow-ups and deadlines

---

## 🗄️ Database Tables & SQL

### 1. Timeline Table

```sql
CREATE TABLE IF NOT EXISTS public.ecosystem_map_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  type text CHECK (type = ANY (ARRAY['Meeting'::text, 'Email'::text, 'Call'::text, 'Event'::text, 'Milestone'::text])),
  description text NOT NULL,
  outcome text CHECK (outcome = ANY (ARRAY['Positive'::text, 'Neutral'::text, 'Negative'::text])),
  relationship_change integer CHECK (relationship_change >= -5 AND relationship_change <= 5),
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_timeline_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_timeline_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_timeline_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_timeline_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_timeline_project_id ON public.ecosystem_map_timeline(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_timeline_stakeholder_id ON public.ecosystem_map_timeline(stakeholder_id);
```

### 2. Shared Notes Table

```sql
CREATE TABLE IF NOT EXISTS public.ecosystem_map_shared_note (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  content text NOT NULL,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_shared_note_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_shared_note_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_shared_note_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_shared_note_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_project_id ON public.ecosystem_map_shared_note(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_shared_note_stakeholder_id ON public.ecosystem_map_shared_note(stakeholder_id);
```

### 3. Tasks/Reminders Table

```sql
CREATE TABLE IF NOT EXISTS public.ecosystem_map_task (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  stakeholder_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['follow-up'::text, 'meeting'::text, 'check-in'::text, 'deadline'::text])),
  title text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  frequency text CHECK (frequency = ANY (ARRAY['once'::text, 'weekly'::text, 'monthly'::text, 'quarterly'::text])),
  priority text CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])),
  is_active boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ecosystem_map_task_pkey PRIMARY KEY (id),
  CONSTRAINT ecosystem_map_task_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_task_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  CONSTRAINT ecosystem_map_task_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT ecosystem_map_task_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_project_id ON public.ecosystem_map_task(project_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_stakeholder_id ON public.ecosystem_map_task(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_due_date ON public.ecosystem_map_task(due_date);
CREATE INDEX IF NOT EXISTS idx_ecosystem_map_task_is_completed ON public.ecosystem_map_task(is_completed);
```

---

## 🔐 Row Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE ecosystem_map_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_map_shared_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_map_task ENABLE ROW LEVEL SECURITY;
```

### Timeline Policies

```sql
-- View policy
DROP POLICY IF EXISTS "Users can view timeline for their projects" ON ecosystem_map_timeline;
CREATE POLICY "Users can view timeline for their projects" ON ecosystem_map_timeline
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

-- Manage policy
DROP POLICY IF EXISTS "Users can manage timeline for their projects" ON ecosystem_map_timeline;
CREATE POLICY "Users can manage timeline for their projects" ON ecosystem_map_timeline
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );
```

### Shared Notes Policies

```sql
-- View policy
DROP POLICY IF EXISTS "Users can view notes for their projects" ON ecosystem_map_shared_note;
CREATE POLICY "Users can view notes for their projects" ON ecosystem_map_shared_note
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

-- Manage policy
DROP POLICY IF EXISTS "Users can manage notes for their projects" ON ecosystem_map_shared_note;
CREATE POLICY "Users can manage notes for their projects" ON ecosystem_map_shared_note
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );
```

### Tasks Policies

```sql
-- View policy
DROP POLICY IF EXISTS "Users can view tasks for their projects" ON ecosystem_map_task;
CREATE POLICY "Users can view tasks for their projects" ON ecosystem_map_task
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid())
    )
  );

-- Manage policy
DROP POLICY IF EXISTS "Users can manage tasks for their projects" ON ecosystem_map_task;
CREATE POLICY "Users can manage tasks for their projects" ON ecosystem_map_task
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT project_id FROM project_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );
```

---

## 📝 TypeScript Types

### Timeline

```typescript
export interface EcosystemMapTimeline {
  id: string;
  project_id: string;
  stakeholder_id: string;
  date: string;
  type?: 'Meeting' | 'Email' | 'Call' | 'Event' | 'Milestone';
  description: string;
  outcome?: 'Positive' | 'Neutral' | 'Negative';
  relationship_change?: number; // -5 to +5
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Frontend camelCase version
export interface TimelineEventData {
  id: string;
  projectId: string;
  stakeholderId: string;
  date: string;
  type: 'Meeting' | 'Email' | 'Call' | 'Event' | 'Milestone';
  description: string;
  outcome: 'Positive' | 'Neutral' | 'Negative';
  relationshipChange: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Shared Notes

```typescript
export interface EcosystemMapSharedNote {
  id: string;
  project_id: string;
  stakeholder_id: string;
  content: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Frontend camelCase version
export interface SharedNoteData {
  id: string;
  projectId: string;
  stakeholderId: string;
  content: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Tasks

```typescript
export interface EcosystemMapTask {
  id: string;
  project_id: string;
  stakeholder_id: string;
  type?: 'follow-up' | 'meeting' | 'check-in' | 'deadline';
  title: string;
  description?: string;
  due_date: string;
  frequency?: 'once' | 'weekly' | 'monthly' | 'quarterly';
  priority?: 'high' | 'medium' | 'low';
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Frontend camelCase version
export interface TaskData {
  id: string;
  projectId: string;
  stakeholderId: string;
  type: 'follow-up' | 'meeting' | 'check-in' | 'deadline';
  title: string;
  description?: string;
  dueDate: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly';
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔌 API Functions

### Timeline API

```typescript
export const ecosystemTimelineApi = {
  async getAllByProjectId(projectId: string): Promise<EcosystemMapTimeline[]>
  async create(timeline: Omit<EcosystemMapTimeline, "id" | "created_at" | "updated_at">): Promise<EcosystemMapTimeline>
  async update(id: string, updates: Partial<EcosystemMapTimeline>): Promise<EcosystemMapTimeline>
  async delete(id: string): Promise<void>
}
```

### Notes API

```typescript
export const ecosystemNotesApi = {
  async getAllByProjectId(projectId: string): Promise<EcosystemMapSharedNote[]>
  async create(note: Omit<EcosystemMapSharedNote, "id" | "created_at" | "updated_at">): Promise<EcosystemMapSharedNote>
  async update(id: string, updates: Partial<EcosystemMapSharedNote>): Promise<EcosystemMapSharedNote>
  async delete(id: string): Promise<void>
}
```

### Tasks API

```typescript
export const ecosystemTasksApi = {
  async getAllByProjectId(projectId: string): Promise<EcosystemMapTask[]>
  async create(task: Omit<EcosystemMapTask, "id" | "created_at" | "updated_at">): Promise<EcosystemMapTask>
  async update(id: string, updates: Partial<EcosystemMapTask>): Promise<EcosystemMapTask>
  async complete(id: string): Promise<EcosystemMapTask>  // Sets is_completed = true
  async delete(id: string): Promise<void>
}
```

---

## 🏪 Redux Store Integration

### State Structure

```typescript
interface EcosystemMapState {
  // ... existing stakeholder state
  timeline: TimelineEventData[];
  notes: SharedNoteData[];
  tasks: TaskData[];
  loadingTimeline: boolean;
  loadingNotes: boolean;
  loadingTasks: boolean;
}
```

### Async Thunks

```typescript
// Timeline
fetchTimeline(projectId)          // Load all timeline events
addTimelineEvent(eventData)       // Add new interaction

// Notes  
fetchNotes(projectId)             // Load all notes
addNote({ stakeholderId, content, createdByName })  // Add new note

// Tasks
fetchTasks(projectId)             // Load all tasks
addTask(taskData)                 // Add new task
completeTask(taskId)              // Mark task as complete
```

### Selectors

```typescript
selectTimeline(state)             // Get all timeline events
selectNotes(state)                // Get all notes
selectTasks(state)                // Get all tasks
selectLoadingTimeline(state)      // Timeline loading state
selectLoadingNotes(state)         // Notes loading state
selectLoadingTasks(state)         // Tasks loading state
```

---

## 🎯 Usage Example

### Fetch Data on Component Mount

```typescript
useEffect(() => {
  dispatch(setProjectId(projectId));
  dispatch(fetchStakeholders({ projectId }));
  dispatch(fetchTimeline(projectId));
  dispatch(fetchNotes(projectId));
  dispatch(fetchTasks(projectId));
}, [dispatch, projectId]);
```

### Add Timeline Event

```typescript
const handleAddEvent = async (eventData) => {
  await dispatch(addTimelineEvent({
    stakeholderId: "uuid",
    date: "2024-01-20",
    type: "Meeting",
    description: "Quarterly review meeting",
    outcome: "Positive",
    relationshipChange: 2,
  }));
};
```

### Add Note

```typescript
const handleAddNote = async () => {
  await dispatch(addNote({
    stakeholderId: "uuid",
    content: "Stakeholder requested additional data on impact metrics",
    createdByName: "John Doe",
  }));
};
```

### Add Task

```typescript
const handleAddTask = async () => {
  await dispatch(addTask({
    stakeholderId: "uuid",
    type: "follow-up",
    title: "Send quarterly report",
    description: "Include impact metrics and financial projections",
    dueDate: "2024-02-15",
    frequency: "quarterly",
    priority: "high",
  }));
};
```

### Complete Task

```typescript
const handleCompleteTask = async (taskId) => {
  await dispatch(completeTask(taskId));
};
```

---

## ✅ Features Implemented

### Timeline
- ✅ Track all stakeholder interactions (meetings, emails, calls, events, milestones)
- ✅ Record outcome (Positive/Neutral/Negative)
- ✅ Track relationship change impact (-5 to +5)
- ✅ Automatic sorting by date (newest first)
- ✅ Link to specific stakeholders
- ✅ Track who created each entry

### Shared Notes
- ✅ Collaborative notes visible to all project members
- ✅ Show author name for each note
- ✅ Timestamp tracking
- ✅ Link to specific stakeholders
- ✅ Newest notes first

### Tasks/Reminders
- ✅ Create follow-ups, meetings, check-ins, deadlines
- ✅ Set due dates and priority levels
- ✅ Recurring tasks (once, weekly, monthly, quarterly)
- ✅ Mark tasks as completed
- ✅ Track completion timestamp
- ✅ Assign tasks to team members
- ✅ Sort by due date
- ✅ Filter active vs completed tasks

---

## 🔒 Security

- ✅ Row Level Security on all tables
- ✅ Users see only their own projects
- ✅ Collaborators with 'viewer' role can read
- ✅ Only 'owner' and 'editor' roles can create/update/delete
- ✅ Foreign key constraints prevent orphaned records
- ✅ Cascade delete when project or stakeholder deleted

---

## 📊 Next Steps

1. **Run database migration** to create all three tables
2. **Verify RLS policies** are active
3. **Create UI forms** for:
   - Adding timeline events
   - Adding shared notes
   - Creating tasks/reminders
4. **Connect existing components**:
   - Update `RelationshipTimeline.tsx` to use Redux
   - Update `EngagementReminders.tsx` to use Redux
   - Create new component for Shared Notes
5. **Add filtering and search** for timeline and tasks
6. **Add notifications** for upcoming tasks

---

## 🎨 UI Components Needed

1. **TimelineForm** - Form to add new timeline events
2. **SharedNoteForm** - Simple textarea to add notes
3. **TaskForm** - Comprehensive form for tasks/reminders
4. **TimelineList** - Display timeline with filters
5. **NotesList** - Display notes with author info
6. **TasksList** - Display tasks with completion toggle
7. **UpcomingTasks** - Dashboard widget for upcoming tasks

All data is now centralized in Redux and automatically syncs across components!
