'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Loader2, Printer, ExternalLink, BookOpen, Plus, File } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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

const mockWorksheetData = {
  questions: [
    {
      id: 1,
      type: 'mcq',
      question: 'What was known to the brahmin?',
      options: ['Magic', 'Mantra', 'Secret'],
    },
    {
      id: 2,
      type: 'mcq',
      question: 'Who accompanied Rundhu to the town?',
      options: ['All the students', 'Villagers', 'Sattu'],
    },
    {
      id: 3,
      type: 'mcq',
      question: 'Who stopped them on the way to the dense forest?',
      options: ['Gang of dacoits', 'Villagers', 'Students'],
    },
    {
      id: 4,
      type: 'mcq',
      question: 'Who was the leader of the gang of dacoits they met first?',
      options: ['Mangal Singh', 'Dilaver Singh', 'Rundhu'],
    },
  ],
};

const mockHistory = [
    {
      id: '1',
      title: 'The Brahmin and the Disciple',
      date: new Date('2025-10-13'),
      book: 'Oliver English Class 05',
      data: mockWorksheetData,
    },
    {
      id: '2',
      title: 'Chapter 1',
      date: new Date('2025-10-11'),
      book: 'The Great Gatsby',
      data: {
          ...mockWorksheetData,
          questions: mockWorksheetData.questions.slice(0,2)
      }
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

function WorksheetDetails({ item }) {
    const worksheetData = item.data;
    return (
        <div className="space-y-6">
            <PageHeader
                title={`Worksheet: ${item.title}`}
                description={`Generated from "${item.book}" on ${format(item.date, 'MMMM dd, yyyy')}`}
                icon={FileText}
            />
            <Card>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                    <CardTitle className="font-headline text-2xl">
                        Worksheet: {item.title}
                    </CardTitle>
                    </div>
                    <div className="text-right">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                        </Button>
                        <Button asChild variant="default" size="sm">
                        <Link href="/answer-key">
                            Answer Key
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {format(new Date(), 'dd/MM/yyyy')}
                    </p>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="border border-amber-500 bg-amber-50/50 rounded-lg p-4 mb-8">
                    <h3 className="text-center font-bold text-lg mb-6">
                    CHAPTER - {item.title.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex items-end gap-2">
                        <label>Name:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <label>Class:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <label>Roll No:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <label>Section:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <label>Date:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <label>Grade:</label>
                        <div className="flex-1 border-b border-gray-400"></div>
                    </div>
                    <div className="col-span-2 flex items-end gap-2 pt-4">
                        <div className="flex-1"></div>
                        <label>Teacher&apos;s Signature:</label>
                        <div className="w-1/4 border-b border-gray-400"></div>
                    </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4">A. Multiple Choice Questions</h4>
                    <div className="space-y-6">
                    {worksheetData.questions.map((q, index) => (
                        <div key={q.id}>
                        <p className="font-semibold mb-2">
                            {index + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
                            {q.options.map((option, i) => (
                            <p key={i}>
                                {String.fromCharCode(97 + i)}. {option}
                            </p>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
    )
}

function NewWorksheetForm({ onGenerate }) {
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
        title="Worksheet Generator"
        description="Create diverse worksheets with various question types."
        icon={FileText}
      />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <CardTitle className="font-headline text-xl">Book & Chapter Selection</CardTitle>
            </div>
            <CardDescription>
              Choose the book and chapter to generate a worksheet.
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
                  Generate Worksheet
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WorksheetPage() {
  const [selectedItem, setSelectedItem] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (values) => {
    setIsLoading(true);
    setSelectedItem(null);
    setTimeout(() => {
        const newItem = {
            id: (mockHistory.length + 1).toString(),
            title: values.chapter,
            date: new Date(),
            book: values.book,
            data: mockWorksheetData
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
          <Plus className="mr-2" /> New Worksheet
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
                  <File className="w-4 h-4 text-sky-500" />
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
                    <h3 className="text-lg font-medium text-foreground">Generating Worksheet...</h3>
                    <p className="text-sm text-muted-foreground">
                        Please wait while the AI prepares the questions.
                    </p>
                </div>
            </div>
        ) : selectedItem ? (
          <WorksheetDetails item={selectedItem} />
        ) : (
          <NewWorksheetForm onGenerate={handleGenerate} />
        )}
      </main>
    </div>
  );
}