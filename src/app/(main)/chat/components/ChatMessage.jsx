import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const ChatMessage = ({ role, content, isLoading = false }) => {
  console.log(content);
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          AI
        </div>
      )}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl rounded-tr-sm p-4 max-w-[80%]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
};