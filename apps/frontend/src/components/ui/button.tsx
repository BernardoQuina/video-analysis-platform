import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        rainbow: cn(
          'relative animate-rainbow bg-[length:200%] transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] disabled:opacity-100',
          // // light mode colors
          "bg-[linear-gradient(#fff,#fff),linear-gradient(90deg,theme('colors.red.500'),theme('colors.purple.500'),theme('colors.blue.500'),theme('colors.cyan.500'),theme('colors.blue.500'),theme('colors.purple.500'),theme('colors.red.500'))]",
          // dark mode colors
          "dark:bg-[linear-gradient(#121213,#121213),linear-gradient(90deg,theme('colors.red.500'),theme('colors.purple.500'),theme('colors.blue.500'),theme('colors.cyan.500'),theme('colors.blue.500'),theme('colors.purple.500'),theme('colors.red.500'))]",
        ),
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    if (variant === 'rainbow') {
      return (
        <div className={cn('group relative', className)}>
          <span
            className="animate-rainbow-pulsate group-hover:animate-rainbow absolute inset-0 rounded-md bg-[linear-gradient(90deg,theme('colors.red.300'),theme('colors.purple.300'),theme('colors.blue.300'),theme('colors.cyan.300'),theme('colors.blue.300'),theme('colors.purple.300'),theme('colors.red.300'))] bg-[length:200%] group-hover:blur-[6px]"
            aria-hidden="true"
          ></span>
          <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
