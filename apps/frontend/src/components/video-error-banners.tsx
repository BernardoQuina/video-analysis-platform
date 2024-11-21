import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function VideoErrorBanner({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Alert className="my-8 max-w-2xl">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="items-start gap-4">
        <p>{message}</p>
        <div className="flex-row gap-2">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/videos">Browse Videos</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
