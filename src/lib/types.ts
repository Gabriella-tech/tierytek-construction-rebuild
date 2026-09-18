/** Shared shape returned by form server actions (used with useActionState). */
export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  id?: number;
};

export const initialActionState: ActionState = {};

/** Lightweight media shape passed to client components. */
export type MediaLite = {
  id: number;
  src: string;
  thumb: string;
  alt: string;
  filename: string;
  width: number;
  height: number;
};
