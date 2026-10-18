import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database, Plus, Trash2, Key } from 'lucide-react';
import { ERTableNodeData, ERColumn } from '../../../types';

const COMMON_SQL_TYPES = [
  'SERIAL',
  'UUID',
  'INTEGER',
  'BIGINT',
  'VARCHAR(255)',
  'VARCHAR(100)',
  'TEXT',
  'BOOLEAN',
  'TIMESTAMP',
  'DECIMAL(10,2)',
];

export const ERTableNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = (data as unknown) as ERTableNodeData;
  const [label, setLabel] = useState(nodeData.label || 'table_name');
  const [columns, setColumns] = useState<ERColumn[]>(
    nodeData.columns || [
      { id: 'c-1', name: 'id', type: 'SERIAL', primaryKey: true, nullable: false },
    ]
  );

  const syncData = (updatedCols: ERColumn[], updatedLabel: string) => {
    nodeData.columns = updatedCols;
    nodeData.label = updatedLabel;
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    syncData(columns, e.target.value);
  };

  const handleAddColumn = () => {
    const newCol: ERColumn = {
      id: `col-${Date.now()}`,
      name: 'new_column',
      type: 'VARCHAR(255)',
      primaryKey: false,
      nullable: true,
    };
    const updated = [...columns, newCol];
    setColumns(updated);
    syncData(updated, label);
  };

  const handleUpdateColumn = (colId: string, updates: Partial<ERColumn>) => {
    const updated = columns.map((col) =>
      col.id === colId ? { ...col, ...updates } : col
    );
    setColumns(updated);
    syncData(updated, label);
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = columns.filter((col) => col.id !== colId);
    setColumns(updated);
    syncData(updated, label);
  };

  return (
    <div className="w-80 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50 overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors">
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />

      {/* Table Header */}
      <div className="px-3.5 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="w-full text-xs font-bold font-mono bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 text-neutral-900 dark:text-neutral-100"
            placeholder="table_name"
          />
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
          TABLE
        </span>
      </div>

      {/* Columns Header */}
      <div className="px-3 py-1 bg-neutral-100/60 dark:bg-neutral-850 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
        <span>Column</span>
        <span className="mr-6">Type</span>
      </div>

      {/* Columns List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto">
        {columns.map((col) => (
          <div
            key={col.id}
            className="group flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={() =>
                  handleUpdateColumn(col.id, { primaryKey: !col.primaryKey })
                }
                title={col.primaryKey ? 'Primary Key' : 'Toggle Primary Key'}
                className={`p-0.5 rounded ${
                  col.primaryKey
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-neutral-300 hover:text-neutral-400 dark:text-neutral-600'
                }`}
              >
                <Key className="w-3 h-3" />
              </button>

              <input
                type="text"
                value={col.name}
                onChange={(e) =>
                  handleUpdateColumn(col.id, { name: e.target.value })
                }
                className="w-full font-mono text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1 text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <select
                value={col.type}
                onChange={(e) =>
                  handleUpdateColumn(col.id, { type: e.target.value })
                }
                className="text-[11px] font-mono rounded bg-neutral-100 dark:bg-neutral-800 border-none px-1.5 py-0.5 text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {COMMON_SQL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleDeleteColumn(col.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Column Button */}
      <div className="p-2 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleAddColumn}
          className="w-full py-1 px-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Column
        </button>
      </div>
    </div>
  );
};
