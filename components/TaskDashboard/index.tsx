'use client';

import React, { useState } from 'react';
import { List, LayoutGrid, Calendar } from 'lucide-react';
import { Task } from '@/types/tasks';
import { useTaskStore } from '@/stores/taskStore';
import { TaskForm, TaskFormData } from './TaskForm';
import { ListView } from './ListView';
import { BoardView } from './BoardView';

type ViewType = 'list' | 'board' | 'calendar';

const ViewSelector: React.FC<{
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}> = ({ view, onViewChange }) => (
  <div className="flex gap-2 mb-4">
    <button 
      className={`p-2 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => onViewChange('list')}
    >
      <List className="w-5 h-5" />
    </button>
    <button 
      className={`p-2 rounded ${view === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => onViewChange('board')}
    >
      <LayoutGrid className="w-5 h-5" />
    </button>
    <button 
      className={`p-2 rounded ${view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => onViewChange('calendar')}
    >
      <Calendar className="w-5 h-5" />
    </button>
  </div>
);

export const TaskDashboard: React.FC = () => {
  const { tasks, boardColumns, addTask, updateTask } = useTaskStore();
  const [view, setView] = useState<ViewType>('list');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: boardColumns[0] || 'Not Started',
    project: '',
    description: '',
    subtasks: []
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: TaskFormData) => {
    if (updatedTask.id) {
      updateTask(updatedTask as Task);
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>
      <ViewSelector view={view} onViewChange={setView} />
      
      {view === 'list' && (
        <ListView tasks={tasks} onUpdateTask={updateTask} />
      )}
      
      {view === 'board' && (
        <BoardView tasks={tasks} onUpdateTask={updateTask} />
      )}
      
      {view === 'calendar' && <div>Calendar View (To be implemented)</div>}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <TaskForm
              task={newTask}
              columns={boardColumns}
              onSubmit={(task) => {
                addTask({ ...task as Task, id: crypto.randomUUID() });
                setIsAddTaskModalOpen(false);
                setNewTask({
                  title: '',
                  dueDate: new Date().toISOString().split('T')[0],
                  priority: 'Medium',
                  status: boardColumns[0] || 'Not Started',
                  project: '',
                  description: '',
                  subtasks: []
                });
              }}
              onCancel={() => setIsAddTaskModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <TaskForm
              task={editingTask}
              columns={boardColumns}
              onSubmit={handleUpdateTask}
              onCancel={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;