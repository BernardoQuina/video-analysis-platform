import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  EdgeProps,
  Edge,
  Position,
} from '@xyflow/react';

export type CustomEdge = Edge<
  {
    label?: string;
    perceiveSourcePosition?: Position; // To influence the path starting angle
    perceivedTargetPosition?: Position; // To influence the path ending angle
  },
  'customEdge'
>;

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: data?.perceiveSourcePosition ?? sourcePosition,
    targetX,
    targetY,
    targetPosition: data?.perceivedTargetPosition ?? targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group absolute h-fit w-fit cursor-pointer"
          onClick={() => console.log('here')}
        >
          {data?.label && (
            <div className="bg-background/50 supports-[backdrop-filter]:bg-background/01 group-hover:scale-05 transform rounded-md px-1.5 py-0.5 backdrop-blur-sm">
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
