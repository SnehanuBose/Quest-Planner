import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StickyNoteNodeData } from '../../../types';

const COLOR_PRESETS = [
  { name: 'yellow', bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-400' },
  { name: 'green', bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-400' },
  { name: 'blue', bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-300 dark:border-sky-800', dot: 'bg-sky-400' },
  { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-800', dot: 'bg-purple-400' },
  { name: 'neutral', bg: 'bg-neutral-100 dark:bg-neutral-900', border: 'border-neutral-300 dark:border-neutral-800', dot: 'bg-neutral-400' },
];

export const StickyNoteNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = (data as unknown) as StickyNoteNodeData;
  const [content, setContent] = useState(nodeData.content || 'Notes & brainstorm ideas...');
  const [selectedColor, setSelectedColor] = useState(nodeData.color || 'yellow');

  const syncData = (newContent: string, newColor: string) => {
    nodeData.content = newContent;
    nodeData.color = newColor;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    syncData(e.target.value, selectedColor);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    syncData(content, colorName);
  };

  const currentTheme =
    COLOR_PRESETS.find((c) => c.name === selectedColor) || COLOR_PRESETS[0];

  return (
    <div
      className={`w-64 rounded-xl border ${currentTheme.border} ${currentTheme.bg} shadow-lg shadow-neutral-300/40 dark:shadow-neutral-950/60 p-3.5 text-neutral-900 dark:text-neutral-100 transition-colors`}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />

      {/* Top Header & Color Picker */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
        <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />

        <div className="flex items-center gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleColorSelect(preset.name)}
              className={`w-3.5 h-3.5 rounded-full ${preset.dot} transition-transform ${
                selectedColor === preset.name ? 'scale-125 ring-2 ring-black/20 dark:ring-white/20' : 'opacity-70 hover:opacity-100'
              }`}
              title={`Color: ${preset.name}`}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <textarea
        value={content}
        onChange={handleContentChange}
        rows={5}
        placeholder="Type something..."
        className="w-full bg-transparent border-none text-xs leading-relaxed focus:outline-none resize-none placeholder-neutral-400 dark:placeholder-neutral-500 font-sans"
      />
    </div>
  );
};
