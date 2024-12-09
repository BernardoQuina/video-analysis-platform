import { Handle, Node, NodeProps, Position } from '@xyflow/react';

import { cn } from '../../utils/cn';

export type CustomGroupNode = Node<
  {
    label: string;
    icon?: JSX.Element;
    description?: string;
    sourcePosition?: Position;
    sourceClassName?: string;
    targetPosition?: Position;
    targetClassName?: string;
  },
  'customGroupNode'
>;

export function CustomGroupNode({ data }: NodeProps<CustomGroupNode>) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/70 h-full w-full flex-row gap-2 rounded-xl border px-4 py-3 shadow-sm backdrop-blur-lg">
      <div>
        <div className="flex-row items-center gap-2">
          {data.icon}
          <span className="pb-1 text-sm font-medium leading-none">
            {data.label}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={data.sourcePosition ?? Position.Bottom}
        className={cn('border-none bg-transparent', data.sourceClassName)}
        id="b"
      />
      <Handle
        type="target"
        position={data.targetPosition ?? Position.Top}
        className={cn('border-none bg-transparent', data.targetClassName)}
      />
    </div>
  );
}

export type CustomNode = Node<
  {
    label: string;
    icon?: JSX.Element;
    description?: string;
    sourcePosition?: Position;
    sourceClassName?: string;
    targetPosition?: Position;
    targetClassName?: string;
  },
  'customNode'
>;

export function CustomNode({ data }: NodeProps<CustomNode>) {
  return (
    <div className="group h-full w-full cursor-pointer items-center gap-2 py-1">
      <div className="group-hover:scale-110">{data.icon}</div>
      <div className="gap-1 text-center">
        <span className="text-sm font-medium leading-none">{data.label}</span>
        {data.description && (
          <span className="text-muted-foreground whitespace-pre-line text-xs">
            {data.description}
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={data.sourcePosition ?? Position.Bottom}
        id="b"
        className={cn('border-none bg-transparent', data.sourceClassName)}
      />
      <Handle
        type="target"
        position={data.targetPosition ?? Position.Top}
        className={cn('border-none bg-transparent', data.targetClassName)}
      />
    </div>
  );
}
