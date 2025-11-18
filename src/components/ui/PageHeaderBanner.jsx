import { FileText } from "lucide-react";

export function PageHeaderBanner({ title, description, icon: Icon = FileText }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">{description}</p>
        </div>
      </div>
    </div>
  );
}
