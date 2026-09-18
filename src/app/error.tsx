"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="container-x py-24 sm:py-32">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display-2 mt-4">We could not load this page.</h1>
      <p className="mt-4 max-w-xl text-ink/70">Please try again. If the problem continues, contact us directly.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-dark">Try again</button>
        <Link href="/" className="btn-outline">Back to home</Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-ink/40">Reference: {error.digest}</p>}
    </main>
  );
}
