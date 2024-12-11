import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  ColorMode,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  addEdge,
  Connection,
} from '@xyflow/react';
import { useTheme } from 'next-themes';

import { initialEdges, initialNodes } from './initial-nodes-and-edges';
import { CustomGroupNode, CustomNode } from './custom-nodes';
import { CustomEdge } from './custom-edge';

export default function InfraDiagram() {
  const nodeTypes = useMemo(
    () => ({ customGroupNode: CustomGroupNode, customNode: CustomNode }),
    [],
  );
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (
      changes: NodeChange<Node<CustomGroupNode['data'] | CustomNode['data']>>[],
    ) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<NonNullable<CustomEdge['data']>>>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const { resolvedTheme } = useTheme();

  // TODO: Remove this useEffect (testing only)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  return (
    <div className="bg-background/50 h-[80dvh] w-[100vw] border-y">
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        {/* <Background
          variant={BackgroundVariant.Lines}
          bgColor="transparent"
          color={
            resolvedTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 0, 0, 0.15)'
          }
          gap={85}
        />
        <Background
          variant={BackgroundVariant.Lines}
          bgColor="transparent"
          color={
            resolvedTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.3)'
          }
          className="blur-[2px]"
          gap={85}
        /> */}

        <Background
          variant={BackgroundVariant.Dots}
          bgColor="transparent"
          // color={
          //   resolvedTheme === 'dark'
          //     ? 'rgba(255, 255, 255, 0.3)'
          //     : 'rgba(0, 0, 0, 0.4)'
          // }
        />
        {/* <Background
          variant={BackgroundVariant.Dots}
          bgColor="transparent"
          color={
            resolvedTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(0, 0, 0, 0.8)'
          }
          className="blur-[2px]"
        /> */}
      </ReactFlow>
    </div>
  );
}
