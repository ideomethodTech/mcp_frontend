import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
    bookId: z.string().min(1, "Please select a book"),
});

export const NewChatForm = ({ onStartChat, data }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bookId: "",
        },
    });

    const onSubmit = (values) => {
        const selectedBook = data?.find(book => (book.id || book.book_id) === values.bookId);
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
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="bookId"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-12 text-foreground">
                                                        <SelectValue placeholder="Choose a book" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {data?.map((book, index) => (
                                                        <SelectItem
                                                            key={book.id || book.book_id || index}
                                                            value={book.id || book.book_id}
                                                        >
                                                            {book.book_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
                                >
                                    <MessageSquare className="mr-2 h-5 w-5" /> Start Chat
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <div className="pb-4" />
                </Card>
            </div>
        </div>
    );
};
