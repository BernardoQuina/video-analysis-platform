import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/utils/cn';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    className?: string;
    sideOffset?: number;
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Tooltip implementation that encapsulates all necessary elements and works on mobile tap
function Tip({
  content,
  children,
  className,
  contentClassName,
  align,
  side,
  disabled = false, // New prop to control tooltip
}: React.PropsWithChildren<{
  content: string | React.ReactNode;
  className?: string;
  contentClassName?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}>) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  function handleClickOpen() {
    if (disabled) return; // Disable tooltip logic when disabled
    setOpen(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 3000);
  }

  function handleMouseEnter() {
    if (disabled) return; // Disable tooltip logic when disabled
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  }

  function handleMouseLeave() {
    if (disabled) return; // Disable tooltip logic when disabled
    setOpen(false);
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Disable tooltip rendering */}
      <Tooltip open={!disabled && open}>
        <TooltipTrigger asChild>
          <div
            className={cn('w-fit', className)}
            onClick={handleClickOpen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => !disabled && setOpen(!open)} // Skip logic if disabled
            onKeyDown={(e) => {
              e.preventDefault();
              if (!disabled && e.key === 'Enter') {
                setOpen(!open);
              }
            }}
          >
            {children}
          </div>
        </TooltipTrigger>
        {!disabled &&
          content && ( // Conditionally render TooltipContent
            <TooltipContent
              className={cn({ hidden: !content }, contentClassName)}
              align={align}
              side={side}
            >
              <span className="inline-block">{content}</span>
            </TooltipContent>
          )}
      </Tooltip>
    </TooltipProvider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Tip, // Encapsulating implementation
};
