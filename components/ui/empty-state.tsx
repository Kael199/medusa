import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  icon: Icon,
  className,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center", className)}>
      {Icon && <Icon className="mb-3 h-10 w-10 text-muted-foreground" />}
      <p className="text-base font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
