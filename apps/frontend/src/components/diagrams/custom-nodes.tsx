import { Handle, Node, NodeProps, Position } from '@xyflow/react';

import { cn } from '../../utils/cn';

export type CustomGroupNode = Node<
  {
    label: string;
    icon?: JSX.Element;
    description?: string;
    sources: { id: string; position?: Position; className?: string }[];
    targets: { id: string; position?: Position; className?: string }[];
  },
  'customGroupNode'
>;

export function CustomGroupNode({ data, id }: NodeProps<CustomGroupNode>) {
  return (
    <div className="bg-background/60 h-full w-full flex-row gap-2 rounded-xl border px-4 py-3 shadow-sm">
      <div>
        <div className="flex-row items-center gap-2">
          {data.icon}
          <span className="pb-1 text-sm font-medium leading-none">
            {data.label}
          </span>
        </div>
      </div>
      {data.sources.map((source) => (
        <Handle
          key={`${id}-source-${source.id}`}
          id={`${id}-source-${source.id}`}
          type="source"
          position={source.position ?? Position.Bottom}
          className={cn('border-none bg-transparent', source.className)}
        />
      ))}
      {data.targets.map((target) => (
        <Handle
          key={`${id}-target-${target.id}`}
          id={`${id}-target-${target.id}`}
          type="target"
          position={target.position ?? Position.Top}
          className={cn('border-none bg-transparent', target.className)}
        />
      ))}
    </div>
  );
}

export type CustomNode = Node<
  {
    label: string;
    icon?: JSX.Element;
    description?: string;
    sources: { id: string; position?: Position; className?: string }[];
    targets: { id: string; position?: Position; className?: string }[];
  },
  'customNode'
>;

export function CustomNode({ data, id }: NodeProps<CustomNode>) {
  return (
    <div className="h-full w-full items-center py-1">
      <div
        className="peer order-2 gap-1 text-center"
        style={{ pointerEvents: 'all' }}
      >
        <span className="text-sm font-medium leading-none">{data.label}</span>
        {data.description && (
          <span className="text-muted-foreground whitespace-pre-line text-xs">
            {data.description}
          </span>
        )}
      </div>
      <div
        style={{ pointerEvents: 'all' }}
        onClick={() => console.log('interaction area')}
        className="order-1 pb-2 hover:scale-110 peer-hover:scale-110"
      >
        {data.icon}
      </div>
      {data.sources.map((source) => (
        <Handle
          key={`${id}-source-${source.id}`}
          id={`${id}-source-${source.id}`}
          type="source"
          position={source.position ?? Position.Bottom}
          className={cn('border-none bg-transparent', source.className)}
        />
      ))}
      {data.targets.map((target) => (
        <Handle
          key={`${id}-target-${target.id}`}
          id={`${id}-target-${target.id}`}
          type="target"
          position={target.position ?? Position.Top}
          className={cn('border-none bg-transparent', target.className)}
        />
      ))}
    </div>
  );
}
