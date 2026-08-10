// Small shared helpers for admin tables: pagination controls, empty state
// and a loading skeleton — used across Transactions/Agents/Traders/Groups.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";

export function usePageData<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { if (page > pageCount) setPage(1); }, [pageCount, page]);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  return { page, setPage, pageCount, pageRows, start };
}

export function TablePagination({
  page, pageCount, onChange, total,
}: { page: number; pageCount: number; onChange: (p: number) => void; total: number }) {
  if (total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-t text-xs text-muted-foreground">
      <span>Page {page} of {pageCount} • {total} total</span>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</Button>
        <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function EmptyState({ label = "No records found" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <Inbox className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Small helper: simulate a brief initial load for mock tables. */
export function useBriefLoading(ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
