export function BookChapterFormHeader({ title, description, icon: Icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-2 bg-muted rounded-lg">{Icon && <Icon className="w-6 h-6 text-primary" />}</div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
