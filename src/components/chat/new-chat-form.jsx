import { useState } from 'react';
import { Book, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const NewChatForm = ({ onStartChat, data }) => {
    const [selectedBookId, setSelectedBookId] = useState("");

    const handleStart = () => {
        const selectedBook = data?.find(book => book.book_id === selectedBookId);
        if (selectedBook) {
            onStartChat(selectedBook);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
            <div className="w-full max-w-md">
                <Card className="border-border/50 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                <Book className="h-10 w-10" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Start a New Chat</h2>
                        <p className="text-sm text-muted-foreground">Select a book to begin your conversation.</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Select onValueChange={setSelectedBookId} value={selectedBookId}>
                            <SelectTrigger className="w-full h-12">
                                <SelectValue placeholder="Choose a book" />
                            </SelectTrigger>
                            <SelectContent>
                                {data?.map((book) => (
                                    <SelectItem
                                        key={book.book_id}
                                        value={book.book_id}
                                    >
                                        {book.book_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                    <CardFooter className="justify-center pb-8">
                        <Button
                            onClick={handleStart}
                            disabled={!selectedBookId}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
                        >
                            <MessageSquare className="mr-2 h-5 w-5" /> Start Chat
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
