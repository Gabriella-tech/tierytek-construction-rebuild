"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/admin/ui";
import { FormMessage } from "@/components/admin/client";
import { initialActionState, type ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  className?: string;
  encType?: string;
};

/**
 * Wraps a server action form. Submits manually so React does not reset the
 * fields when validation fails (the owner never loses what they typed).
 */
export function ActionForm({ action, children, submitLabel = "Save changes", cancelHref, className }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error || state.message) messageRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state]);

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div ref={messageRef} className="space-y-2">
        <FormMessage state={state} />
        {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-red-700">
            {Object.entries(state.fieldErrors).map(([k, v]) => (
              <li key={k}>
                <span className="font-medium capitalize">{k.replace(/([A-Z])/g, " $1")}</span>: {v}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-5">
        <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass.primary}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className={buttonClass.secondary}>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
