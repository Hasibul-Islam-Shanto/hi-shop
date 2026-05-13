import { cn } from "@/lib/utils";

interface PageHeadingProps {
  label: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeading = ({ label, title, children, className }: PageHeadingProps) => {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <span className="label-text text-primary mb-0.5 block">{label}</span>
        <h1 className="text-2xl font-extrabold text-on-surface">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
