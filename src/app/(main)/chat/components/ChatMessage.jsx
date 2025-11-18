import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

export const ChatMessage = ({ role, content, isLoading = false }) => {
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
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-6 mt-8" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-4 mt-6" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className=" list-inside space-y-2 mb-4" {...props} />,
              li: ({ node, ...props }) => <li className="ml-4" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
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
