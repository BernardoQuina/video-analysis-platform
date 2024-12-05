import {
  ReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  ColorMode,
} from '@xyflow/react';
import { useTheme } from 'next-themes';

import '@xyflow/react/dist/style.css';

function getMiddleOfScreen() {
  if (typeof window !== 'undefined') {
    return window.innerWidth / 2;
  }

  return 0;
}

const nodes: Node[] = [
  {
    id: 'api',
    position: { x: getMiddleOfScreen(), y: 100 },
    data: { label: 'api' },
  },
  {
    id: 'model',
    position: { x: getMiddleOfScreen(), y: 200 },
    data: { label: 'model' },
  },
];
const edges: Edge[] = [{ id: 'api-model', source: 'api', target: 'model' }];

export default function InfraDiagram() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-[80vh] w-[100vw]">
      <ReactFlow
        colorMode={resolvedTheme as ColorMode}
        style={{ background: 'transparent' }}
        nodes={nodes}
        edges={edges}
        proOptions={{ hideAttribution: true }}
        // zoomOnScroll={false}
        preventScrolling={false}
        className="div-with-opacity-gradient"
      >
        <Background
          variant={BackgroundVariant.Lines}
          bgColor="transparent"
          color={
            resolvedTheme === 'dark'
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 0, 0, 0.15)'
          }
          gap={90}
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
          gap={90}
        />
      </ReactFlow>
    </div>
  );
}
