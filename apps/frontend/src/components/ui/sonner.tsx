import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader,
  XCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton={true}
      duration={600_000} // 1 min
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg items-start',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',

          closeButton:
            'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-sm group-[.toast]:-top-[0.2rem] group-[.toast]:left-[unset] group-[.toast]:-right-[1.1rem]',
        },
      }}
      icons={{
        success: <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />,
        info: <Info className="mt-0.5 h-4 w-4 text-blue-500" />,
        warning: <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />,
        error: <XCircle className="text-destructive mt-0.5 h-4 w-4" />,
        loading: (
          <Loader className="mt-0.5 h-4 w-4 animate-spin text-gray-500" />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };
