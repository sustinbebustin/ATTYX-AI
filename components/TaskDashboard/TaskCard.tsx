'use client';

import { Task } from '@/types/tasks';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  isDragging?: boolean;
}

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, isDragging }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        p-4 bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md transition-shadow duration-200
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${priorityColors[task.priority]}
            `}>
              {task.priority}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {task.project}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">
            Due {format(new Date(task.dueDate), 'MMM d')}
          </span>
          <select
            value={task.status}
            onChange={(e) => onUpdate?.({ ...task, status: e.target.value })}
            className="mt-2 text-xs border rounded p-1"
          >
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};