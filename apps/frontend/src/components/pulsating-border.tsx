import { ReactNode } from 'react';

import { cn } from '../utils/cn';

export function PulsatingBorder({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex w-fit items-center overflow-hidden rounded-full p-[1px]">
      <div className="bg-border absolute -top-[1px] h-[110%] w-[110%]"></div>
      <div className="animate-rotate absolute h-full w-full rounded-full bg-[conic-gradient(#a2a2a2_20deg,transparent_120deg)] dark:bg-[conic-gradient(#828282_20deg,transparent_120deg)]"></div>
      <div
        className={cn(
          'bg-background z-20 w-full flex-row items-center gap-1.5 rounded-full p-2',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
