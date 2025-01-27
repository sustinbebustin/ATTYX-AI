export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  project: string;
  subtasks: { title: string; completed: boolean }[];
  completed: boolean;
}

export interface ViewColumns {
  list: string[];
  board: string[];
}

export interface TaskStore {
  tasks: Task[];
  boardColumns: string[];
  visibleBoardColumns: string[];
  listColumns: string[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  setBoardColumns: (columns: string[]) => void;
  setVisibleBoardColumns: (columns: string[]) => void;
  setListColumns: (columns: string[]) => void;
}

export type ViewType = 'list' | 'board' | 'calendar';
export type SortableColumn = 'title' | 'dueDate' | 'priority' | 'status' | 'project';
export type SortDirection = 'asc' | 'desc';