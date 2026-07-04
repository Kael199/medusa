import type { Model } from "mongoose";
import type { FlattenMaps, Require_id } from "mongoose";

/** A single lean doc: Mongoose's FlattenMaps<Doc> + required _id, stripped of methods. */
export type LeanDoc<T> = FlattenMaps<Require_id<{ [K in keyof T]: T[K] }>>;

/** findOne(...).lean() — typed as a single doc or null (never an array). */
export async function findOneLean<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  projection?: string | Record<string, number>,
): Promise<LeanDoc<T> | null> {
  const q = model.findOne(filter);
  if (projection) q.select(projection);
  return q.lean() as unknown as Promise<LeanDoc<T> | null>;
}

/** find(...).lean() — typed as an array of lean docs with concrete `_id`. */
export async function findLean<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  opts: { sort?: Record<string, 1 | -1>; select?: string; limit?: number } = {},
): Promise<LeanDoc<T>[]> {
  const q = model.find(filter);
  if (opts.sort) q.sort(opts.sort);
  if (opts.select) q.select(opts.select);
  if (opts.limit) q.limit(opts.limit);
  return q.lean() as unknown as Promise<LeanDoc<T>[]>;
}

/** findById(...).lean() — typed as a single doc or null. */
export async function findByIdLean<T>(
  model: Model<T>,
  id: string,
  projection?: string,
): Promise<LeanDoc<T> | null> {
  const q = model.findById(id);
  if (projection) q.select(projection);
  return q.lean() as unknown as Promise<LeanDoc<T> | null>;
}

/** Cast an already-resolved Mongoose lean result to a single doc or null. */
export function asLean<T>(value: unknown): LeanDoc<T> | null {
  return value as unknown as LeanDoc<T> | null;
}

/** Cast an already-resolved Mongoose lean result to an array of lean docs. */
export function asLeanArray<T>(value: unknown): LeanDoc<T>[] {
  return value as unknown as LeanDoc<T>[];
}
