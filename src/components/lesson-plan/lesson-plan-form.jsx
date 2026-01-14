import { useState } from 'react';
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

export const LessonPlanForm = ({ onGenerate, data }) => {
    const [selectedBookId, setSelectedBookId] = useState("");
    const [selectedChapter, setSelectedChapter] = useState("");

    const selectedBook = data?.find(book => book.id === selectedBookId);

    const handleGenerate = () => {
        if (selectedBook && selectedChapter) {
            onGenerate(selectedBook, selectedChapter);
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
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Book</label>
                                <Select onValueChange={setSelectedBookId} value={selectedBookId}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Choose a book" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data?.map((book) => (
                                            <SelectItem key={book.id} value={book.id}>
                                                {book.book_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Chapter</label>
                                <Select
                                    onValueChange={setSelectedChapter}
                                    value={selectedChapter}
                                    disabled={!selectedBookId}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Choose a chapter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedBook?.chapters?.map((chapter) => (
                                            <SelectItem key={chapter} value={chapter}>
                                                {chapter}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
                            disabled={!selectedBookId || !selectedChapter}
                        >
                            <Sparkles className="mr-2 h-5 w-5" /> Generate Lesson Plan
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
