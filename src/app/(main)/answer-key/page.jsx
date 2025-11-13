'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Loader2, BookOpen, Plus, File, FileText, Key } from 'lucide-react';
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
import History from '@/app/componentsV2/ui/history';


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
  return(
    <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
              <Key className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">The Brahmin and the Disciple</h2>
                <p className="text-muted-foreground text-sm">
                  Answer Key for 'The Brahmin and the Disciple (Story)' from the book 'Oliver English Class 05'
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 mb-8 border border-primary/10">
              <p className="text-sm text-muted-foreground mb-2">Generated Answer Key</p>
              <p className="text-foreground">The AI-generated answer key for the worksheet based on 'The Brahmin and the Disciple (Story)'.</p>
            </div>

            {/* Answers */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">c) Jupiter</p>
                    <p className="text-sm text-muted-foreground italic">
                      *Explanation: Jupiter is the largest planet in our solar system by a large margin.*
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">b) Mars</p>
                    <p className="text-sm text-muted-foreground italic">
                      *Explanation: Mars is often called the Red Planet due to its reddish appearance from iron oxide on its surface.*
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">Mercury</p>
                    <p className="text-sm text-muted-foreground italic">
                      *Explanation: Mercury is the innermost planet in our solar system.*
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">third</p>
                    <p className="text-sm text-muted-foreground italic">
                      *Explanation: The order of planets from the Sun is Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.*
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">
                      Saturn's rings are made of billions of small particles of ice and rock. They are very wide but relatively thin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
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
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Answer Key Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Automatically generate answer keys for your worksheets.            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          historyData={mockHistory}
        />
        {/* Lesson Plan Content */}
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
      </div>
    </div>
  )
}