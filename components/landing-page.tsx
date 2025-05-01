import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Languages, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Ligature Translator</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/login?register=true">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Translate Ligature Languages with AI
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Powerful translation for complex scripts and ligature languages
              powered by Hugging Face NLP models
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 md:px-6 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Advanced Translation</h3>
              <p className="text-muted-foreground">
                Support for complex scripts and ligature languages with
                state-of-the-art NLP models
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Favorites</h3>
              <p className="text-muted-foreground">
                Save your most important translations for quick access
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 Ligature Translator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
