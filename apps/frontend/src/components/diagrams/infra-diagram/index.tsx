import { useEffect, useMemo, useRef, useState } from 'react';
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

import { cn } from '../../../utils/cn';
import { Button } from '../../ui/button';
import { CustomGroupNode, CustomNode } from '../custom-nodes';
import { CustomEdge } from '../custom-edge';

import { initialEdges, initialNodes } from './initial-nodes-and-edges';

export default function InfraDiagram() {
  const { setCenter } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({ customGroupNode: CustomGroupNode, customNode: CustomNode }),
    [],
  );
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);

  const [nodes, _setNodes] = useState(initialNodes);
  const [edges, _setEdges] = useState(initialEdges);

  const [maximized, setMaximized] = useState(false);

  const { resolvedTheme } = useTheme();

  const positionalDivRef = useRef<HTMLDivElement>(null);

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
    if (!maximized && positionalDivRef.current) {
      positionalDivRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    setMaximized(!maximized);
    setTimeout(() => {
      setCenter(
        0,
        maximized ? window.innerHeight * 0.3 : window.innerHeight * 0.47,
        {
          zoom: 1,
          duration: 300,
        },
      );
    }, 300);
  }

  useEffect(() => {
    setTimeout(() => {
      setCenter(0, window.innerHeight * 0.3, { zoom: 1 });
    }, 0);
  }, []);

  return (
    <>
      <div ref={positionalDivRef} className="-mt-8 h-[2.45rem]"></div>
      <div
        className={cn(
          'bg-background/50 relative h-[80dvh] w-[100vw] border-y transition-all duration-300',
          {
            'h-[calc(100vh-3.5rem)] w-[100vw]': maximized,
            'h-[60vh] w-full rounded-md border-x': !maximized,
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
          preventScrolling={maximized}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes}
          edges={edges}
          onlyRenderVisibleElements
          nodesDraggable={false}
          // onNodesChange={onNodesChange}
          // onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
        >
          <Background
            variant={BackgroundVariant.Dots}
            bgColor="transparent"
            color="#61616b"
          />
        </ReactFlow>
      </div>
    </>
  );
}
