'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Loader2, BookOpen, Plus, File } from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  book: z.string().nonempty('Please select a book.'),
  chapter: z.string().nonempty('Please select a chapter.'),
});

const mockHistory = [
    {
      id: '1',
      title: 'The Brahmin and the Disciple',
      date: new Date('2025-10-13'),
      chapter: 'The Brahmin and the Disciple (Story)',
      book: 'Oliver English Class 05',
      content: `
1. c) Jupiter
   *Explanation: Jupiter is the largest planet in our solar system by a large margin.*

2. b) Mars
   *Explanation: Mars is often called the Red Planet due to its reddish appearance from iron oxide on its surface.*

3. Mercury
   *Explanation: Mercury is the innermost planet in our solar system.*

4. third
   *Explanation: The order of planets from the Sun is Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.*

5. Saturn's rings are made of billions of small particles of ice and rock. They are very wide but relatively thin.
`
    },
    {
      id: '2',
      title: 'Chapter 1 Worksheet',
      date: new Date('2025-10-11'),
      chapter: 'Chapter 1',
      book: 'The Great Gatsby',
      content: 'Answer key for Chapter 1 of The Great Gatsby.'
    },
];

const mockData = {
    books: [
        {
            name: 'Oliver English Class 05',
            chapters: [
                { name: 'The Brahmin and the Disciple (Story)', pages: '7 - 16' },
                { name: 'Another Chapter', pages: '17 - 28' },
            ]
        },
        {
            name: 'The Great Gatsby',
            chapters: [
                { name: 'Chapter 1', pages: '1 - 20' },
                { name: 'Chapter 2', pages: '21 - 45' },
            ]
        }
    ]
}

function AnswerKeyDetails({ item }) {
  return (
    <div className="space-y-6">
        <PageHeader
            title={item.title}
            description={`Answer Key for "${item.chapter}" from the book "${item.book}"`}
            icon={KeyRound}
        />
        <Card>
            <CardHeader>
                <CardTitle>Generated Answer Key</CardTitle>
                <CardDescription>
                The AI-generated answer key for the worksheet based on &quot;{item.chapter}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</div>
            </CardContent>
        </Card>
    </div>
  );
}

function NewAnswerKeyForm({ onGenerate }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: '',
      chapter: '',
    },
  });

  const selectedBookName = form.watch('book');
  const selectedBook = mockData.books.find(b => b.name === selectedBookName);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-2xl">
            <PageHeader
                title="Answer Key Generator"
                description="Automatically generate answer keys for your worksheets."
                icon={KeyRound}
            />
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                        <CardTitle className="font-headline text-xl">Book & Chapter Selection</CardTitle>
                    </div>
                    <CardDescription>
                        Choose the book and chapter for your Answer Key.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="book"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Select Book</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a book" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {mockData.books.map((book) => (
                                            <SelectItem key={book.name} value={book.name}>{book.name}</SelectItem>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBook}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a chapter" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {selectedBook?.chapters.map((chapter) => (
                                            <SelectItem key={chapter.name} value={chapter.name}>{chapter.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>
                        <Button type="submit" className="w-full !mt-8" size="lg" disabled={!form.formState.isValid}>
                            Generate Answer Key
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


export default function AnswerKeyPage() {
  const [selectedItem, setSelectedItem] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (values) => {
    setIsLoading(true);
    setSelectedItem(null);
    setTimeout(() => {
        const newItem = {
            id: (mockHistory.length + 1).toString(),
            title: `${values.chapter} Key`,
            date: new Date(),
            chapter: values.chapter,
            book: values.book,
            content: `This is a newly generated answer key for ${values.chapter}.`
        };
        mockHistory.unshift(newItem);
        setSelectedItem(newItem);
        setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      <div className="hidden md:flex flex-col border-r bg-muted/20 p-4 space-y-4">
        <Button variant="outline" onClick={() => setSelectedItem(null)}>
          <Plus className="mr-2" /> New Answer Key
        </Button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-2">
            History
          </h3>
          <div className="space-y-2">
            {mockHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'w-full text-left p-2 rounded-lg border',
                  selectedItem?.id === item.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <File className="w-4 h-4 text-amber-500" />
                  <span>{format(item.date, 'dd/MM/yyyy')}</span>
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.book}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Generating Answer Key...</h3>
                    <p className="text-sm text-muted-foreground">
                        Please wait while the AI checks the answers.
                    </p>
                </div>
            </div>
        ) : selectedItem ? (
          <AnswerKeyDetails item={selectedItem} />
        ) : (
          <NewAnswerKeyForm onGenerate={handleGenerate} />
        )}
      </main>
    </div>
  );
}