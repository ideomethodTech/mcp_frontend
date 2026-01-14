import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { useGenerateContent, useDeleteChatMessage } from '@/lib/api/queries';
import useApiStore from '@/store/useApiStore';
import { ChatMessage } from './chat-message';

export const ChatInterface = ({ chatSession }) => {
    const [messages, setMessages] = useState(chatSession?.messages || []);
    const [input, setInput] = useState('');
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const queryClient = useQueryClient();
    const { setChatStatus } = useApiStore();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (chatSession?.messages) {
            setMessages(chatSession.messages);
        }
    }, [chatSession?.id, chatSession?.messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const { mutate: generateContentMutation } = useGenerateContent({
        onMutate: ({ prompt }) => {
            setChatStatus('loading');
            setMessages((prev) => [
                ...prev,
                { prompt, response: '__LOADING__' },
            ]);
        },
        onSuccess: (data) => {
            setMessages((prev) =>
                prev.map((m, idx) =>
                    idx === prev.length - 1
                        ? {
                            ...m,
                            response: data || data.response || 'No response',
                            id: data.id,
                        }
                        : m
                )
            );
            queryClient.invalidateQueries({
                queryKey: ['chatDetails', chatSession.uid, chatSession.id],
            });
            setChatStatus('success');
        },
        onError: () => {
            setChatStatus('error');
            setMessages((prev) => prev.filter(m => m.response !== '__LOADING__'));
        },
        onSettled: () => {
            setChatStatus('idle');
        },
    });

    const { mutate: deleteChatMessageMutation } = useDeleteChatMessage({
        onSuccess: () => {
            setDeletingMessageId(null);
            queryClient.invalidateQueries({
                queryKey: ['chatDetails', chatSession.uid, chatSession.id],
            });
        },
        onError: () => {
            setDeletingMessageId(null);
        },
    });

    const handleSendMessage = () => {
        const prompt = input.trim();
        if (!prompt) return;

        generateContentMutation({
            chat_id: chatSession.id,
            uid: chatSession.uid,
            prompt,
        });

        setInput("");
    };

    const handleDeleteMessage = (messageId) => {
        if (!chatSession?.id || !messageId) return;
        setDeletingMessageId(messageId);
        deleteChatMessageMutation({ uid: chatSession.uid, message_id: messageId });
    };

    return (
        <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card shadow-lg flex flex-col h-[650px] overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Chat with: {chatSession.book}</h2>
                            <p className="text-xs text-muted-foreground">
                                AI-powered assistant for your learning materials
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                            <MessageSquare className="h-12 w-12 opacity-20" />
                            <p>No messages yet. Start a conversation!</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className="space-y-4">
                            {msg.prompt && <ChatMessage isUser content={msg.prompt} />}
                            {msg.response === '__LOADING__' && <ChatMessage isLoading />}
                            {msg.response && msg.response !== '__LOADING__' && (
                                <div className="flex items-start gap-2 group">
                                    <div className="flex-1">
                                        <ChatMessage content={msg.response} />
                                    </div>
                                    {msg.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            disabled={deletingMessageId === msg.id}
                                        >
                                            {deletingMessageId === msg.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-border bg-muted/10">
                    <div className="flex gap-3 items-end">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about the book..."
                            className="min-h-[50px] max-h-[200px] resize-none bg-background border-border/50 focus:border-primary transition-all"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button
                            className="h-[50px] w-[50px] rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all flex-shrink-0"
                            onClick={handleSendMessage}
                            disabled={!input.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-3">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};
