import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  // Node,
  // Edge,
  Background,
  BackgroundVariant,
  ColorMode,
  useReactFlow,
  // applyNodeChanges,
  // applyEdgeChanges,
  // NodeChange,
  // EdgeChange,
  // addEdge,
  // Connection,
} from '@xyflow/react';
import { useTheme } from 'next-themes';
import { Maximize, Minimize } from 'lucide-react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/button';

import { initialEdges, initialNodes } from './initial-nodes-and-edges';
import { CustomGroupNode, CustomNode } from './custom-nodes';
import { CustomEdge } from './custom-edge';

export default function InfraDiagram() {
  const { setCenter, getViewport } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({ customGroupNode: CustomGroupNode, customNode: CustomNode }),
    [],
  );
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const [maximized, setMaximized] = useState(false);
  // initial y position (a diff of 60 to 80 is then use below to calculate new y position)
  const [yFromCenter, setYFromCenter] = useState(0);

  const { resolvedTheme } = useTheme();

  // const onNodesChange = useCallback(
  //   (
  //     changes: NodeChange<Node<CustomGroupNode['data'] | CustomNode['data']>>[],
  //   ) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes],
  // );
  // const onEdgesChange = useCallback(
  //   (changes: EdgeChange<Edge<NonNullable<CustomEdge['data']>>>[]) =>
  //     setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   [setEdges],
  // );

  // const onConnect = useCallback(
  //   (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
  //   [setEdges],
  // );

  function handleMaximize() {
    setMaximized(!maximized);
    setTimeout(() => {
      setCenter(0, maximized ? yFromCenter : (yFromCenter * 80) / 60, {
        zoom: 1,
        duration: 300,
      });
    }, 300);
  }

  // TODO: Remove this useEffect (testing only)
  useEffect(() => {
    setTimeout(() => {
      setYFromCenter(getViewport().y); // For maximizing/minimizing reference
      setCenter(0, getViewport().y, { zoom: 1 });
    }, 0);

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  return (
    <div
      className={cn(
        'bg-background/50 relative h-[80dvh] w-[100vw] border-y transition-all duration-300',
        {
          'h-[80dvh] w-[100vw]': maximized,
          'h-[60dvh] w-full rounded-md border-x': !maximized,
        },
      )}
    >
      <Button
        className="bg-background absolute right-5 top-5 z-10"
        variant="outline"
        size="icon"
        onClick={handleMaximize}
      >
        {maximized ? <Minimize /> : <Maximize />}
      </Button>
      <ReactFlow
        colorMode={resolvedTheme as ColorMode}
        style={{ background: 'transparent' }}
        className="div-with-opacity-gradient"
        proOptions={{ hideAttribution: true }}
        preventScrolling={false}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onlyRenderVisibleElements
        // onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
      >
        <Background variant={BackgroundVariant.Dots} bgColor="transparent" />
      </ReactFlow>
    </div>
  );
}
