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
} from '@xyflow/react';
import {
  ArrowLeft,
  Download,
  Moon,
  Sun,
  CheckSquare,
  Database,
  StickyNote,
  Map as MapIcon,
  Loader2,
  Check,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { boardApi, deleteNodeApi } from '../../services/api';
import { CanvasData } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { TodoNode } from './nodes/TodoNode';
import { ERTableNode } from './nodes/ERTableNode';
import { StickyNoteNode } from './nodes/StickyNoteNode';

const nodeTypes = {
  todoNode: TodoNode,
  erTable: ERTableNode,
  stickyNote: StickyNoteNode,
};

interface CanvasPageProps {
  boardId: number;
  onBack: () => void;
}

const CanvasContent: React.FC<CanvasPageProps> = ({ boardId, onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const [boardTitle, setBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(true);

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

        const canvas: CanvasData = data.canvasData || { nodes: [], edges: [] };
        setNodes(canvas.nodes || []);
        setEdges(canvas.edges || []);
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
    (currentNodes: Node[], currentEdges: Edge[], title: string) => {
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
        triggerAutosave(nodes, next, boardTitle);
        return next;
      });
    },
    [nodes, boardTitle, triggerAutosave, setEdges]
  );

  // Autosave on Node/Edge changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      const hasRemoval = changes.some((c: any) => c.type === 'remove');
      if (!hasRemoval) {
        triggerAutosave(nodes, edges, boardTitle);
      }
    },
    [nodes, edges, boardTitle, onNodesChange, triggerAutosave]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      triggerAutosave(nodes, edges, boardTitle);
    },
    [nodes, edges, boardTitle, onEdgesChange, triggerAutosave]
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
      triggerAutosave(nodes, edges, boardTitle.trim());
    }
  };

  // Quick-Add Nodes
  const addNode = (type: 'todoNode' | 'erTable' | 'stickyNote') => {
    const id = `${type}-${Date.now()}`;
    const x = Math.random() * 200 + 150;
    const y = Math.random() * 200 + 150;

    let initialData: any = {};
    if (type === 'todoNode') {
      initialData = {
        title: 'Project Checklist',
        todos: [
          { id: '1', text: 'Configure database schema', completed: true },
          { id: '2', text: 'Verify API endpoints', completed: false },
        ],
      };
    } else if (type === 'erTable') {
      initialData = {
        label: 'users',
        columns: [
          { id: 'c1', name: 'id', type: 'SERIAL', primaryKey: true, nullable: false },
          { id: 'c2', name: 'email', type: 'VARCHAR(255)', primaryKey: false, nullable: false },
          { id: 'c3', name: 'created_at', type: 'TIMESTAMP', primaryKey: false, nullable: false },
        ],
      };
    } else if (type === 'stickyNote') {
      initialData = {
        content: 'Idea: Add OAuth2 login and audit logs.',
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
      triggerAutosave(next, edges, boardTitle);
      return next;
    });
  };

  // Export SQL Script
  const handleExportSql = async () => {
    try {
      const sql = await boardApi.exportSql(boardId);
      const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(boardTitle || 'schema').replace(/\s+/g, '_').toLowerCase()}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SQL:', err);
      alert('Failed to export SQL script. Please check backend logs.');
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
                  onClick={() => triggerAutosave(nodes, edges, boardTitle)}
                  className="underline hover:text-red-600 ml-1"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60 transition-colors"
            title="Export ER Tables as SQL DDL"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export SQL</span>
          </button>

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

          {showMiniMap && (
            <MiniMap
              className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 rounded-lg shadow-lg"
              nodeColor={(n) => {
                if (n.type === 'erTable') return '#6366f1';
                if (n.type === 'todoNode') return '#10b981';
                return '#f59e0b';
              }}
            />
          )}

          <Controls showInteractive={false} position="bottom-right" className="mb-14 sm:mb-2" />
        </ReactFlow>

        {/* Floating Canvas Docked Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50">
            {toolbarOpen && (
              <>
                <button
                  onClick={() => addNode('todoNode')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>To-Do</span>
                </button>

                <button
                  onClick={() => addNode('erTable')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ER Table</span>
                </button>

                <button
                  onClick={() => addNode('stickyNote')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  <span>Note</span>
                </button>

                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

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
