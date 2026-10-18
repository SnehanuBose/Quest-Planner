import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  ViewportPortal,
} from '@xyflow/react';
import {
  ArrowLeft,
  Moon,
  Sun,
  CheckSquare,
  StickyNote,
  Image as ImageIcon,
  PenTool,
  Pencil,
  Undo2,
  Eraser,
  Map as MapIcon,
  Loader2,
  Check,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { boardApi, deleteNodeApi } from '../../services/api';
import { CanvasData, DrawingStroke } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { TodoNode } from './nodes/TodoNode';
import { StickyNoteNode } from './nodes/StickyNoteNode';
import { ImageNode } from './nodes/ImageNode';

const nodeTypes = {
  todoNode: TodoNode,
  stickyNote: StickyNoteNode,
  imageNode: ImageNode,
};

const PEN_COLORS = [
  { label: 'Indigo', value: '#6366f1', dot: 'bg-indigo-500' },
  { label: 'Emerald', value: '#10b981', dot: 'bg-emerald-500' },
  { label: 'Amber', value: '#f59e0b', dot: 'bg-amber-500' },
  { label: 'Rose', value: '#f43f5e', dot: 'bg-rose-500' },
  { label: 'Sky', value: '#0ea5e9', dot: 'bg-sky-500' },
  { label: 'Purple', value: '#a855f7', dot: 'bg-purple-500' },
  { label: 'Dark', value: '#18181b', dot: 'bg-neutral-900 border border-neutral-700' },
  { label: 'White', value: '#ffffff', dot: 'bg-white border border-neutral-300' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 6 },
  { label: 'Marker', value: 10 },
];

const getSvgPathFromStroke = (points: { x: number; y: number }[]): string => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
};

interface CanvasPageProps {
  boardId: number;
  onBack: () => void;
}

const CanvasContent: React.FC<CanvasPageProps> = ({ boardId, onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();

  const [boardTitle, setBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(true);

  // Drawing state
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#6366f1');
  const [penWidth, setPenWidth] = useState(4);
  const [drawings, setDrawings] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const isDrawingRef = useRef(false);

  // Hidden file input for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Load Board details
  useEffect(() => {
    let isMounted = true;
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        const data = await boardApi.getBoardById(boardId);
        if (!isMounted) return;

        setBoardTitle(data.title);

        const canvas: CanvasData = data.canvasData || { nodes: [], edges: [], drawings: [] };
        setNodes(canvas.nodes || []);
        setEdges(canvas.edges || []);
        setDrawings(canvas.drawings || []);
      } catch (err) {
        console.error('Failed to load board canvas:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBoard();
    return () => {
      isMounted = false;
    };
  }, [boardId]);

  // Debounced Autosave
  const triggerAutosave = useCallback(
    (currentNodes: Node[], currentEdges: Edge[], currentDrawings: DrawingStroke[], title: string) => {
      setSaveStatus('saving');
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await boardApi.updateBoard(boardId, {
            title,
            canvasData: {
              nodes: currentNodes,
              edges: currentEdges,
              drawings: currentDrawings,
            },
          });
          setSaveStatus('saved');
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveStatus('error');
        }
      }, 1500);
    },
    [boardId]
  );

  // Handle Edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const next = addEdge(
          {
            ...connection,
            type: 'default',
            animated: true,
          },
          eds
        );
        triggerAutosave(nodes, next, drawings, boardTitle);
        return next;
      });
    },
    [nodes, drawings, boardTitle, triggerAutosave, setEdges]
  );

  // Autosave on Node/Edge changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      const hasRemoval = changes.some((c: any) => c.type === 'remove');
      if (!hasRemoval) {
        triggerAutosave(nodes, edges, drawings, boardTitle);
      }
    },
    [nodes, edges, drawings, boardTitle, onNodesChange, triggerAutosave]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      triggerAutosave(nodes, edges, drawings, boardTitle);
    },
    [nodes, edges, drawings, boardTitle, onEdgesChange, triggerAutosave]
  );

  // Handle Node Deletion sync
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      setSaveStatus('saving');
      Promise.all(deletedNodes.map((node) => deleteNodeApi(boardId, node.id)))
        .then(() => {
          setSaveStatus('saved');
        })
        .catch((err) => {
          console.error('Failed to delete node via API:', err);
          setSaveStatus('error');
        });
    },
    [boardId]
  );

  const handleTitleBlur = () => {
    if (boardTitle.trim()) {
      triggerAutosave(nodes, edges, drawings, boardTitle.trim());
    }
  };

  // Helper to add an image node from data URL
  const insertImageNode = useCallback(
    (dataUrl: string) => {
      const centerScreen = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      const flowPos = screenToFlowPosition(centerScreen);

      const newNode: Node = {
        id: `imageNode-${Date.now()}`,
        type: 'imageNode',
        position: { x: flowPos.x - 150, y: flowPos.y - 120 },
        style: { width: 320, height: 240 },
        data: {
          src: dataUrl,
          rotation: 0,
        },
      };

      setNodes((nds) => {
        const next = nds.concat(newNode);
        triggerAutosave(next, edges, drawings, boardTitle);
        return next;
      });
    },
    [screenToFlowPosition, setNodes, edges, drawings, boardTitle, triggerAutosave]
  );

  // Global Clipboard Paste Handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing into an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              insertImageNode(dataUrl);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [insertImageNode]);

  // File input change handler for + Image button
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          insertImageNode(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  // Quick-Add standard Nodes
  const addNode = (type: 'todoNode' | 'stickyNote') => {
    const id = `${type}-${Date.now()}`;
    const x = Math.random() * 200 + 150;
    const y = Math.random() * 200 + 150;

    let initialData: any = {};
    if (type === 'todoNode') {
      initialData = {
        title: 'Project Checklist',
        todos: [
          { id: '1', text: 'Define project scope', completed: true },
          { id: '2', text: 'Draft architectural layout', completed: false },
        ],
      };
    } else if (type === 'stickyNote') {
      initialData = {
        content: 'Idea: Brainstorm visual components and wireframes.',
        color: 'yellow',
      };
    }

    const newNode: Node = {
      id,
      type,
      position: { x, y },
      data: initialData,
    };

    setNodes((nds) => {
      const next = nds.concat(newNode);
      triggerAutosave(next, edges, drawings, boardTitle);
      return next;
    });
  };

  // Pen Drawing Handlers
  const handleDrawingPointerDown = (e: React.PointerEvent) => {
    if (!isPenActive) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;

    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      points: [pos],
      color: penColor,
      width: penWidth,
    };
    setCurrentStroke(newStroke);
  };

  const handleDrawingPointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !currentStroke) return;
    e.preventDefault();
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

    const last = currentStroke.points[currentStroke.points.length - 1];
    if (last && Math.hypot(last.x - pos.x, last.y - pos.y) < 2) {
      return;
    }

    setCurrentStroke((prev) => {
      if (!prev) return null;
      return { ...prev, points: [...prev.points, pos] };
    });
  };

  const handleDrawingPointerUp = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (currentStroke && currentStroke.points.length > 0) {
      setDrawings((prev) => {
        const next = [...prev, currentStroke];
        triggerAutosave(nodes, edges, next, boardTitle);
        return next;
      });
    }
    setCurrentStroke(null);
  };

  const handleUndoStroke = () => {
    setDrawings((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, prev.length - 1);
      triggerAutosave(nodes, edges, next, boardTitle);
      return next;
    });
  };

  const handleClearDrawings = () => {
    if (drawings.length === 0) return;
    if (window.confirm('Clear all drawings and sketches on this board?')) {
      setDrawings([]);
      triggerAutosave(nodes, edges, [], boardTitle);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm">Loading canvas...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Hidden File Picker for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img
            src="/logo.png"
            alt="Quest Planner"
            className="w-7 h-7 rounded-lg object-contain shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onBack}
            title="Back to Quest Planner Dashboard"
          />

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Editable Board Title */}
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="Untitled Board"
            className="text-sm font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100 max-w-[200px] sm:max-w-md truncate"
          />

          {/* Autosave Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-500">Error saving</span>
                <button
                  onClick={() => triggerAutosave(nodes, edges, drawings, boardTitle)}
                  className="underline hover:text-red-600 ml-1"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Pen mode indicator badge */}
          {isPenActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-pulse">
              <Pencil className="w-3 h-3" />
              <span>Drawing Mode Active</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          panOnDrag={!isPenActive}
          nodesDraggable={!isPenActive}
          elementsSelectable={!isPenActive}
          fitView
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="bg-neutral-50 dark:bg-neutral-950"
          />

          {/* SVG Drawings Layer inside ViewportPortal (synchronized with pan/zoom) */}
          <ViewportPortal>
            <svg
              className="pointer-events-none absolute top-0 left-0 overflow-visible"
              style={{ width: '100%', height: '100%' }}
            >
              {drawings.map((stroke) => (
                <path
                  key={stroke.id}
                  d={getSvgPathFromStroke(stroke.points)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.92}
                />
              ))}
              {currentStroke && (
                <path
                  d={getSvgPathFromStroke(currentStroke.points)}
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.95}
                />
              )}
            </svg>
          </ViewportPortal>

          {showMiniMap && (
            <MiniMap
              className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 rounded-lg shadow-lg"
              nodeColor={(n) => {
                if (n.type === 'todoNode') return '#10b981';
                if (n.type === 'imageNode') return '#8b5cf6';
                return '#f59e0b';
              }}
            />
          )}

          <Controls showInteractive={false} position="bottom-right" className="mb-14 sm:mb-2" />
        </ReactFlow>

        {/* Freehand Pen Drawing Interactive Overlay */}
        {isPenActive && (
          <div
            onPointerDown={handleDrawingPointerDown}
            onPointerMove={handleDrawingPointerMove}
            onPointerUp={handleDrawingPointerUp}
            onPointerCancel={handleDrawingPointerUp}
            className="absolute inset-0 z-20 cursor-crosshair touch-none select-none"
            title="Click and drag to sketch or write on the canvas"
          />
        )}

        {/* Floating Canvas Docked Main Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50">
            {toolbarOpen && (
              <>
                {/* To-Do Button */}
                <button
                  onClick={() => addNode('todoNode')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>To-Do</span>
                </button>

                {/* Sticky Note Button */}
                <button
                  onClick={() => addNode('stickyNote')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  <span>Note</span>
                </button>

                {/* Image Upload / Paste Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Upload image (or paste directly with Ctrl+V / Cmd+V)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                  <span>Image</span>
                </button>

                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

                {/* Freehand Pen Mode Toggle */}
                <button
                  onClick={() => setIsPenActive((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isPenActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title={isPenActive ? 'Switch to Selection/Pan mode' : 'Enable Freehand Pen Drawing'}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Pen</span>
                </button>

                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

                {/* Zoom Controls */}
                <button
                  onClick={() => zoomIn()}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => zoomOut()}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => fitView({ padding: 0.2 })}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Fit Screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowMiniMap((prev) => !prev)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showMiniMap
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Toggle Mini-map"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={() => setToolbarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-0.5"
              title={toolbarOpen ? 'Collapse toolbar' : 'Expand toolbar'}
            >
              {toolbarOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Dedicated Pen Color & Stroke Palette Sub-bar (when Pen is Active) */}
          {isPenActive && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl text-xs transition-all">
              {/* Preset Color Swatches */}
              <div className="flex items-center gap-1.5 px-1">
                {PEN_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPenColor(c.value)}
                    className={`w-4 h-4 rounded-full ${c.dot} transition-transform ${
                      penColor.toLowerCase() === c.value.toLowerCase()
                        ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-neutral-900'
                        : 'opacity-80 hover:opacity-100 hover:scale-110'
                    }`}
                    title={`Color: ${c.label}`}
                  />
                ))}

                {/* Custom Color Picker */}
                <label
                  className="relative w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
                  title="Custom color picker"
                >
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: penColor }}
                  />
                </label>
              </div>

              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1">
                {STROKE_WIDTHS.map((sw) => (
                  <button
                    key={sw.value}
                    type="button"
                    onClick={() => setPenWidth(sw.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      penWidth === sw.value
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                    title={`${sw.label} stroke (${sw.value}px)`}
                  >
                    {sw.label}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

              {/* Undo Last Stroke */}
              <button
                type="button"
                onClick={handleUndoStroke}
                disabled={drawings.length === 0}
                className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Undo last stroke"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              {/* Clear All Drawings */}
              <button
                type="button"
                onClick={handleClearDrawings}
                disabled={drawings.length === 0}
                className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Clear all drawings"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              {/* Exit Pen Mode */}
              <button
                type="button"
                onClick={() => setIsPenActive(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
                title="Exit Pen Mode"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CanvasPage: React.FC<CanvasPageProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
};
