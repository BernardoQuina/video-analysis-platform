import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '../../../api/src/routers';
import { trpc } from '../utils/trpc';

import { Button } from './ui/button';
import { GoogleIcon } from './icons/GoogleIcon';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export function GoogleSignIn() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data, isLoading, isFetching } = trpc.auth.me.useQuery();

  const initiateGoogleSignIn = () => {
    setIsRedirecting(true);

    // Generate the Google authorization URL dynamically
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);

    const googleAuthUrl =
      `${domain}/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `identity_provider=Google&` +
      `scope=openid+profile+email`;

    // Redirect to Google Sign-In
    window.location.href = googleAuthUrl;
  };

  if (isLoading || isFetching || code) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (data) {
    return <SignedInDropdown me={data} />;
  }

  return (
    <Button
      variant="outline"
      onClick={initiateGoogleSignIn}
      disabled={isRedirecting}
    >
      {isRedirecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <p className="w-32">
        {isRedirecting ? 'Signing in...' : 'Sign in with Google'}
      </p>
    </Button>
  );
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type Me = NonNullable<RouterOutput['auth']['me']>;

function SignedInDropdown({ me }: { me: Me }) {
  const { mutateAsync } = trpc.auth.signOut.useMutation();
  const utils = trpc.useUtils();

  const handleSignOut = async () => {
    const { message } = await mutateAsync();

    if (message === 'Token revoked') utils.auth.me.invalidate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage asChild src={me.picture}>
            <Image
              src={me.picture}
              alt={`${me.givenName} ${me.familyName} google profile picture`}
              unoptimized
              width={36}
              height={36}
            />
          </AvatarImage>
          <AvatarFallback>
            {me.givenName[0]}
            {me.familyName[0]}
          </AvatarFallback>
          <span className="sr-only">Toggle Signed in dropdown</span>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-medium">
          {me.givenName} {me.familyName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
