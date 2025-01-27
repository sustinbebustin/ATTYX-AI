import { create } from 'zustand';
import { Task, TaskStore } from '../types/tasks';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_BOARD_COLUMNS = ['Not Started', 'In Progress', 'Under Review', 'Completed'];
const DEFAULT_LIST_COLUMNS = ['title', 'dueDate', 'priority', 'status', 'project'];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  boardColumns: DEFAULT_BOARD_COLUMNS,
  visibleBoardColumns: DEFAULT_BOARD_COLUMNS,
  listColumns: DEFAULT_LIST_COLUMNS,
  
  addTask: (task: Task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: task.id || uuidv4() }]
  })),
  
  updateTask: (updatedTask: Task) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === updatedTask.id ? updatedTask : task
    )
  })),
  
  setBoardColumns: (columns: string[]) => set(() => ({
    boardColumns: columns
  })),

  setListColumns: (columns: string[]) => set(() => ({
    listColumns: columns
  })),

  setVisibleBoardColumns: (columns: string[]) => set(() => ({
    visibleBoardColumns: columns
  })),
}));