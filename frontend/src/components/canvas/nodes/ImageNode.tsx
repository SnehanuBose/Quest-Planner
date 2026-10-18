import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { Trash2, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';
import { ImageNodeData } from '../../../types';

export const ImageNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { deleteElements } = useReactFlow();
  const nodeData = (data as unknown) as ImageNodeData;

  const [rotation, setRotation] = useState<number>(nodeData.rotation ?? 0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isRotatingRef = useRef(false);

  // Sync internal state if nodeData.rotation updates from outside
  useEffect(() => {
    if (typeof nodeData.rotation === 'number') {
      setRotation(nodeData.rotation);
    }
  }, [nodeData.rotation]);

  const updateRotation = (newDeg: number) => {
    const normalized = ((Math.round(newDeg) % 360) + 360) % 360;
    setRotation(normalized);
    nodeData.rotation = normalized;
  };

  const handleDeleteNode = () => {
    deleteElements({ nodes: [{ id }] });
  };

  // Drag-to-rotate handle logic
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isRotatingRef.current || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      // Offset by 90 deg because rotation handle is at the top center
      const degrees = radians * (180 / Math.PI) + 90;
      updateRotation(degrees);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      isRotatingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(upEvent.pointerId);
      } catch {
        // Ignore if already released
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl border transition-shadow ${
        selected
          ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500'
          : 'border-neutral-200 dark:border-neutral-800 shadow-md shadow-neutral-200/50 dark:shadow-neutral-950/50'
      } bg-white dark:bg-neutral-900 p-2 min-w-[120px] min-h-[100px]`}
    >
      {/* NodeResizer for smooth multi-directional resizing */}
      <NodeResizer
        isVisible={!!selected}
        minWidth={100}
        minHeight={80}
        lineClassName="!border-indigo-500/60"
        handleClassName="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white dark:!border-neutral-950 !rounded-full shadow-sm"
      />

      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5" />

      {/* Rotation Knob Handle (visible when selected or hovered) */}
      {(selected || false) && (
        <div className="nodrag nopan absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 select-none">
          <div
            onPointerDown={handleRotatePointerDown}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nopan w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border-2 border-indigo-500 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 hover:bg-indigo-50 dark:hover:bg-neutral-700 transition-all text-indigo-600 dark:text-indigo-400"
            title="Drag to rotate image"
          >
            <RotateCw className="w-3 h-3 pointer-events-none" />
          </div>
          <div className="w-0.5 h-3 bg-indigo-500/60" />
        </div>
      )}

      {/* Floating Control Toolbar (Visible when selected) */}
      {selected && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="nodrag nopan absolute -bottom-11 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-lg text-xs select-none"
        >
          <button
            type="button"
            onClick={() => updateRotation(rotation - 15)}
            className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Rotate -15°"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => updateRotation(rotation + 15)}
            className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Rotate +15°"
          >
            <RotateCw className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => updateRotation(Number(e.target.value))}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="nodrag nopan w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            title="Rotation angle slider"
          />

          <span className="font-mono text-[10px] text-neutral-500 w-7 text-right">
            {rotation}°
          </span>

          {rotation !== 0 && (
            <button
              type="button"
              onClick={() => updateRotation(0)}
              className="p-1 rounded text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Reset rotation to 0°"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          )}

          <div className="h-3 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          <button
            type="button"
            onClick={handleDeleteNode}
            className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete image"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Delete button (top-right overlay on hover when not selected) */}
      {!selected && (
        <button
          onClick={handleDeleteNode}
          title="Delete image"
          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 z-20 p-1 rounded-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shadow-sm"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Rotatable Image Container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-75"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {nodeData.src ? (
          <img
            src={nodeData.src}
            alt={nodeData.alt || 'Board image'}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        ) : (
          <div className="text-xs text-neutral-400 py-6 text-center">
            No image data
          </div>
        )}
      </div>
    </div>
  );
};
