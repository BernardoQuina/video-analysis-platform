import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  EdgeProps,
  Edge,
  Position,
  getSmoothStepPath,
} from '@xyflow/react';
// import { useTheme } from 'next-themes';

import { cn } from '../../utils/cn';

type BaseEdge = {
  label?: string;
  perceiveSourcePosition?: Position; // To influence the path starting angle
  perceivedTargetPosition?: Position; // To influence the path ending angle
  className?: string;
  pathType: 'bezier' | 'smoothStep';
};

type BezierEdge = BaseEdge & {
  pathType: 'bezier';
  curvature?: number;
};

type SmoothStepEdge = BaseEdge & {
  pathType: 'smoothStep';
  borderRadius?: number;
  offset?: number;
};

export type CustomEdge = Edge<BezierEdge | SmoothStepEdge, 'customEdge'>;

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<CustomEdge>) {
  const [edgePath, labelX, labelY] =
    data?.pathType === 'smoothStep'
      ? getSmoothStepPath({
          sourceX,
          sourceY,
          sourcePosition: data?.perceiveSourcePosition ?? sourcePosition,
          targetX,
          targetY,
          targetPosition: data?.perceivedTargetPosition ?? targetPosition,
          borderRadius: data?.borderRadius,
          offset: data?.offset,
        })
      : getBezierPath({
          sourceX,
          sourceY,
          sourcePosition: data?.perceiveSourcePosition ?? sourcePosition,
          targetX,
          targetY,
          targetPosition: data?.perceivedTargetPosition ?? targetPosition,
          curvature: data?.curvature,
        });

  // const { resolvedTheme } = useTheme();

  return (
    <>
      <BaseEdge
        // interactionWidth={0}
        id={id}
        path={edgePath}
        className="stroke-muted-foreground"
      />
      {/* <svg>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          id={id}
          d={edgePath}
          className="react-flow__edge-path"
          style={{
            filter: `url(#glow)`,
            stroke:
              resolvedTheme === 'light'
                ? 'rgba(0, 0, 0, 0.4)'
                : 'rgba(255,255,255, 0.5)',
            strokeWidth: 1.5,
          }}
        />
      </svg> */}
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            // pointerEvents: 'all',
          }}
          className={cn('nodrag nopan absolute h-fit w-fit', data?.className)}
        >
          {data?.label && (
            <div className="bg-background/70 transform rounded-md px-1.5 py-0.5">
              <span className="whitespace-pre-line text-center text-xs">
                {data?.label}
              </span>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
