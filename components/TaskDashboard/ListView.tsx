'use client';

import { Task } from '@/types/tasks';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTaskStore } from '@/stores/taskStore';

interface ListViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'project';
type SortDirection = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({ tasks, onUpdateTask }) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  
  const { listColumns, setListColumns } = useTaskStore();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (column: string) => {
    if (listColumns.includes(column)) {
      setListColumns(listColumns.filter(c => c !== column));
    } else {
      setListColumns([...listColumns, column]);
    }
  };

  const allPossibleColumns = ['title', 'priority', 'status', 'project', 'dueDate'];

  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'dueDate') {
      return (new Date(aValue).getTime() - new Date(bValue).getTime()) * direction;
    }

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const renderColumnHeader = (field: string) => (
    <th
      key={field}
      onClick={() => handleSort(field as SortField)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center gap-1">
        {field.charAt(0).toUpperCase() + field.slice(1)}
        {sortField === field && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  const renderCell = (task: Task, field: string) => {
    switch (field) {
      case 'title':
        return (
          <td key={field} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{task.title}</div>
          </td>
        );
      case 'priority':
        return (
          <td key={field} className="px-6 py-4 whitespace-nowrap">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'}
            `}>
              {task.priority}
            </span>
          </td>
        );
      case 'status':
        return (
          <td key={field} className="px-6 py-4 whitespace-nowrap">
            <select
              value={task.status}
              onChange={(e) => onUpdateTask({ ...task, status: e.target.value })}
              className="text-sm border rounded p-1"
            >
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </td>
        );
      case 'project':
        return (
          <td key={field} className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {task.project}
            </span>
          </td>
        );
      case 'dueDate':
        return (
          <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsEditingColumns(!isEditingColumns)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Edit Columns
        </button>
      </div>

      {isEditingColumns && (
        <div className="mb-4 p-4 bg-white border rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Select columns to display:</h3>
          <div className="flex gap-4">
            {allPossibleColumns.map(column => (
              <label key={column} className="flex items-center">
                <input
                  type="checkbox"
                  checked={listColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {listColumns.map(field => renderColumnHeader(field))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <motion.tr
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hover:bg-gray-50"
              >
                {listColumns.map(field => renderCell(task, field))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};