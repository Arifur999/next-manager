import { Button } from "@/components/ui/button";
import Link from "next/link";

const HomePage = () => {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        Business management, modular
      </p>

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Naxified</h1>

      <p className="max-w-xl text-balance text-muted-foreground">
        Run your team, inventory, sales and finance from one workspace. Every module is
        self-contained, so the system grows one feature at a time.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create an account</Link>
        </Button>
      </div>
    </section>
  );
};

export default HomePage;
