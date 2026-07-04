// Generic pagination helper for Mongoose models. Returns a payload ready to
// render server-side grids; the metadata (total/totalPages) drives client
// page controls via query params.

import type { Model, FilterQuery } from "mongoose";
import { PAGINATION } from "@/lib/constants";

export interface PaginateOptions {
  page?: number;
  pageSize?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: string | string[];
  lean?: boolean;
}

export interface PaginateResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  opts: PaginateOptions = {},
): Promise<PaginateResult<T>> {
  const pageSize = Math.min(
    Math.max(opts.pageSize ?? PAGINATION.defaultPageSize, 1),
    PAGINATION.maxPageSize,
  );
  const page = Math.max(opts.page ?? 1, 1);
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    model
      .find(filter)
      .sort(opts.sort ?? { _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .select(opts.select ?? "")
      .populate(opts.populate ?? [])
      .lean(opts.lean ?? true) as Promise<T[]>,
    model.countDocuments(filter),
  ]);

  return {
    items,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
    page,
    pageSize,
  };
}
