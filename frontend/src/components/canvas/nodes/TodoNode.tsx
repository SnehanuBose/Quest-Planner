import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { TodoNodeData, TodoItem } from '../../../types';

export const TodoNode: React.FC<NodeProps> = ({ id, data }) => {
  const { deleteElements } = useReactFlow();
  const nodeData = (data as unknown) as TodoNodeData;
  const [title, setTitle] = useState(nodeData.title || 'Tasks');
  const [todos, setTodos] = useState<TodoItem[]>(nodeData.todos || []);
  const [newText, setNewText] = useState('');

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  // Keep nodeData synchronized so canvas serialization picks it up
  const syncData = (updatedTodos: TodoItem[], updatedTitle: string) => {
    nodeData.todos = updatedTodos;
    nodeData.title = updatedTitle;
  };

  const handleToggle = (todoId: string) => {
    const updated = todos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    setTodos(updated);
    syncData(updated, title);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem: TodoItem = {
      id: `task-${Date.now()}`,
      text: newText.trim(),
      completed: false,
    };
    const updated = [...todos, newItem];
    setTodos(updated);
    setNewText('');
    syncData(updated, title);
  };

  const handleDelete = (todoId: string) => {
    const updated = todos.filter((t) => t.id !== todoId);
    setTodos(updated);
    syncData(updated, title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    syncData(todos, e.target.value);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="w-72 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50 overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />

      {/* Header */}
      <div className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full text-xs font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 text-neutral-900 dark:text-neutral-100"
            placeholder="List Title"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {completedCount}/{todos.length}
          </span>
          <button
            onClick={handleDeleteNode}
            title="Delete card"
            className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tasks List */}
      <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="py-4 text-center text-xs text-neutral-400">
            No tasks yet. Add one below.
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-xs"
            >
              <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-emerald-600 focus:ring-emerald-500/20"
                />
                <span
                  className={`truncate ${
                    todo.completed
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {todo.text}
                </span>
              </label>
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="p-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center gap-1.5">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add task..."
          className="flex-1 px-2.5 py-1 text-xs rounded-md bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 focus:outline-none focus:border-emerald-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
        />
        <button
          type="submit"
          className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
