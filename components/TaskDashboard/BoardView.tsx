'use client';

import { Task } from '@/types/tasks';
import { TaskCard } from './TaskCard';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useState } from 'react';

interface BoardViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ tasks, onUpdateTask }) => {
  const { boardColumns, visibleBoardColumns, setBoardColumns, setVisibleBoardColumns } = useTaskStore();
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const toggleColumnVisibility = (column: string) => {
    if (visibleBoardColumns.includes(column)) {
      setVisibleBoardColumns(visibleBoardColumns.filter(c => c !== column));
    } else {
      setVisibleBoardColumns([...visibleBoardColumns, column]);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (task) {
      onUpdateTask({
        ...task,
        status: destination.droppableId
      });
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const addColumn = () => {
    if (newColumnName.trim() && !boardColumns.includes(newColumnName.trim())) {
      const newColumn = newColumnName.trim();
      setBoardColumns([...boardColumns, newColumn]);
      setVisibleBoardColumns([...visibleBoardColumns, newColumn]);
      setNewColumnName('');
    }
  };

  const removeColumn = (columnToRemove: string) => {
    setBoardColumns(boardColumns.filter(col => col !== columnToRemove));
    setVisibleBoardColumns(visibleBoardColumns.filter(col => col !== columnToRemove));
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const newColumns = [...boardColumns];
    const newVisibleColumns = [...visibleBoardColumns];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newColumns.length) {
      [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
      setBoardColumns(newColumns);
      
      // Update visible columns order if both columns are visible
      const column = boardColumns[index];
      const targetColumn = boardColumns[newIndex];
      if (visibleBoardColumns.includes(column) && visibleBoardColumns.includes(targetColumn)) {
        const visIndex = newVisibleColumns.indexOf(column);
        const visTargetIndex = newVisibleColumns.indexOf(targetColumn);
        [newVisibleColumns[visIndex], newVisibleColumns[visTargetIndex]] =
          [newVisibleColumns[visTargetIndex], newVisibleColumns[visIndex]];
        setVisibleBoardColumns(newVisibleColumns);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setIsEditingColumns(!isEditingColumns)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Toggle Columns
        </button>
        <button
          onClick={() => setIsManagingColumns(!isManagingColumns)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Manage Columns
        </button>
      </div>

      {isEditingColumns && (
        <div className="mb-4 p-4 bg-white border rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Select columns to display:</h3>
          <div className="flex gap-4">
            {boardColumns.map(column => (
              <label key={column} className="flex items-center">
                <input
                  type="checkbox"
                  checked={visibleBoardColumns.includes(column)}
                  onChange={() => toggleColumnVisibility(column)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  {column}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {isManagingColumns && (
        <div className="mb-4 p-4 bg-white border rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Manage Board Columns:</h3>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="New column name"
              className="px-3 py-2 border rounded-md flex-1"
            />
            <button
              onClick={addColumn}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Column
            </button>
          </div>
          <div className="space-y-2">
            {boardColumns.map((column, index) => (
              <div key={column} className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{column}</span>
                <button
                  onClick={() => moveColumn(index, 'left')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  ←
                </button>
                <button
                  onClick={() => moveColumn(index, 'right')}
                  disabled={index === boardColumns.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  →
                </button>
                <button
                  onClick={() => removeColumn(column)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`
          grid gap-4 auto-rows-min min-h-0 overflow-x-auto
          ${visibleBoardColumns.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
            visibleBoardColumns.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}
        `}>
          {visibleBoardColumns.map((column) => (
            <Droppable key={column} droppableId={column}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    flex flex-col bg-gray-50 rounded-lg p-4 min-h-[200px]
                    ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
                  `}
                >
                  <h3 className="font-medium text-gray-900 mb-4">{column}</h3>
                  <motion.div layout className="space-y-3 flex-1">
                    {getTasksByStatus(column).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onUpdate={onUpdateTask}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </motion.div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};