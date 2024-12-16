import Link from 'next/link';
import { Focus, Github, Globe } from 'lucide-react';

import { Aws } from './icons/aws';
import { Linkedin } from './icons/linkedin';
import { X } from './icons/x';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 mt-20 w-full items-center overflow-hidden backdrop-blur">
      <div className="w-full max-w-[70rem] justify-between gap-12 px-4 py-12 sm:flex-row sm:gap-0 lg:px-8">
        <div className="w-full flex-row items-center justify-around sm:contents sm:justify-between">
          <div className="gap-4">
            <Link href="/" className="flex-row items-center gap-2">
              <Focus className="h-5 w-5" />
              <h1 className="text-xs font-bold">VIDEO ANALYSIS DEMO</h1>
            </Link>
            <div>
              <div className="flex-row gap-1">
                <p className="text-muted-foreground text-sm">
                  Showcase powered by
                </p>
                <Aws className="h-7 w-7" />
              </div>
              <p className="text-muted-foreground -mt-1.5 text-center text-sm sm:text-start">
                Bernardo Quina <br />
                Lisbon, Portugal
              </p>
            </div>
          </div>
          <div className="items-center gap-4">
            <span className="text-muted-foreground text-sm font-medium">
              Find me at
            </span>
            <div className="xs:flex-row gap-4">
              <div className="flex-row gap-4">
                <a
                  className="h-fit w-fit"
                  href="https://www.linkedin.com/in/bernardo-quina/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe className="h-5 w-5" />
                </a>

                <a
                  href="https://www.github.com/BernardoQuina/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
              <div className="flex-row gap-4">
                <a
                  className="h-fit w-fit"
                  href="https://www.linkedin.com/in/bernardo-quina/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  className="h-fit w-fit"
                  href="https://www.x.com/bernardoquina/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <X className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center sm:items-end">
          <div className="flex-row gap-4 sm:contents sm:gap-0">
            <Button variant="link" asChild className="w-fit px-0">
              <Link href="/privacy">
                <span className="text-sm font-medium">Privacy Policy</span>
              </Link>
            </Button>
            <Button variant="link" asChild className="w-fit px-0">
              <Link href="/terms">
                <span className="text-sm font-medium">Terms of Service</span>
              </Link>
            </Button>
          </div>
          <span className="text-muted-foreground pt-2 text-sm">
            © {new Date().getFullYear()} Bernardo Quina
          </span>
        </div>
      </div>
    </footer>
  );
}
