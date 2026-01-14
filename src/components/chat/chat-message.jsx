import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const ChatMessage = ({ isUser = false, content, isLoading = false }) => {
    return (
        <div
            className={cn(
                'flex items-start gap-3',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    AI
                </div>
            )}
            <div className={cn(
                "rounded-2xl p-4 max-w-[80%]",
                isUser
                    ? "bg-muted text-foreground rounded-tr-sm"
                    : "bg-gradient-to-br from-primary to-accent text-white rounded-tl-sm"
            )}>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-40 bg-white/20" />
                        <Skeleton className="h-3 w-32 bg-white/20" />
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{content}</p>
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
