import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/admin/ui";
import { countUsers } from "@/lib/auth";
import { ensureSeededOnce } from "@/db/seed";
import { loginAction, setupAction } from "./actions";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await ensureSeededOnce();
  const { next } = await searchParams;
  const firstRun = (await countUsers()) === 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="font-display text-2xl font-extrabold tracking-[0.2em]">TIERYTEK</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-neutral-400">Content management</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-2xl sm:p-8">
          {firstRun ? (
            <>
              <h1 className="text-lg font-bold text-neutral-900">Create the first administrator</h1>
              <p className="mt-1 mb-6 text-sm text-neutral-600">No user accounts exist yet. Set up the owner account to start managing the website.</p>
              <ActionForm action={setupAction} submitLabel="Create account & sign in">
                <Field label="Your name" htmlFor="name" required><Input id="name" name="name" autoComplete="name" required /></Field>
                <Field label="Email" htmlFor="email" required><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
                <Field label="Password" htmlFor="password" hint="At least 10 characters." required><Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required /></Field>
              </ActionForm>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-neutral-900">Sign in</h1>
              <p className="mt-1 mb-6 text-sm text-neutral-600">Enter your administrator credentials.</p>
              <ActionForm action={loginAction} submitLabel="Sign in">
                <input type="hidden" name="next" value={next ?? ""} />
                <Field label="Email" htmlFor="email" required><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
                <Field label="Password" htmlFor="password" required><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
              </ActionForm>
              <p className="mt-6 text-xs text-neutral-500">Forgotten your password? Ask another administrator to reset it from <strong>Users</strong>, or see the README for the command-line reset.</p>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-sm"><Link href="/" className="text-neutral-400 hover:text-white">← Back to website</Link></p>
      </div>
    </main>
  );
}
