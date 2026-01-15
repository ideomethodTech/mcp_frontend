import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
    bookId: z.string().min(1, "Please select a book"),
    chapter: z.string().min(1, "Please select a chapter"),
});

export const LessonPlanForm = ({ onGenerate, data }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bookId: "",
            chapter: "",
        },
    });

    const selectedBookId = form.watch("bookId");
    const selectedBook = data?.find(book => book.id === selectedBookId);

    const onSubmit = (values) => {
        const book = data?.find(book => book.id === values.bookId);
        if (book) {
            onGenerate(book, values.chapter);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
            <div className="w-full max-w-2xl">
                <Card className="border-border/50 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Generate Lesson Plan</CardTitle>
                        </div>
                        <CardDescription>
                            Choose a book and chapter to generate a structured AI lesson plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="bookId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select Book</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue("chapter", ""); // Reset chapter when book changes
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-foreground">
                                                            <SelectValue placeholder="Choose a book" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {data?.map((book) => (
                                                            <SelectItem key={book.id} value={book.id}>
                                                                {book.book_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="chapter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select Chapter</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={!selectedBookId}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-foreground">
                                                            <SelectValue placeholder="Choose a chapter" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {selectedBook?.chapters?.map((chapter) => (
                                                            <SelectItem key={chapter} value={chapter}>
                                                                {chapter}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
                                >
                                    <Sparkles className="mr-2 h-5 w-5" /> Generate Lesson Plan
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
