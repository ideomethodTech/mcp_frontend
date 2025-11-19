'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Loader2, Printer, ExternalLink, BookOpen, Plus, File } from 'lucide-react';
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
import WorksheetItem from './WorksheetItem';
import History from '@/app/componentsV2/ui/history';
import { useCreateWorksheet, useGetBook } from '@/lib/api/queries';
import { getNavItemByUrl } from '@/app/utils';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

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
      questions: mockWorksheetData.questions.slice(0, 2)
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

const WorksheetDetails = ({ item }) => {
  const worksheetData = item.data;
  return (
    <div className="lg:col-span-3">
      <WorksheetItem item={item} questions={worksheetData?.questions}></WorksheetItem>
    </div>
  )
}

function NewWorksheetForm({ onGenerate, data}) {
    const [selectedBookInForm, setSelectedBookInForm] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);

   const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  const selectedBookId = form.watch("book");
  const selectedBook = data?.find((b) => b.book_id === selectedBookId);

  return (
    <div className="lg:col-span-3">
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-2xl">
        
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
                          <Select onValueChange={(val) => {
                            setSelectedBookInForm(JSON.parse(val))
                            }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a book" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* {mockData.books.map((book) => (
                                <SelectItem key={book.name} value={book.name}>{book.name}</SelectItem>
                              ))} */}
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
                          <Select onValueChange={(val) => {
                            setSelectedBookInForm(JSON.parse(val))
                            }} defaultValue={field.value} disabled={!selectedBook}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                             {selectedBook?.chapters?.map((chapter) => (
                                <SelectItem
                                  key={chapter}
                                  value={chapter}
                                >
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

                  <Button type="submit" className="w-full !mt-8" size="lg" onClick={() => onGenerate(selectedBook,selectedChapter)} disabled={!form.formState.isValid}>
                    Generate Worksheet
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WorksheetPage() {
  const [selectedItem, setSelectedItem] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const uid = "nn170kZPMuWZlbzGbVps3YVyG9J3";
  const queryClient = useQueryClient();

  const { data: bookData, isLoading: isBookDataLoading } = useGetBook(uid);
  useEffect(() => {
    if (bookData) {
      console.log("📚 Book Data Loaded:", bookData);
    }
  }, [bookData]);

  const{mutate: createworksheetmutation, isPending: creatingWorksheet} = useCreateWorksheet({
      onSuccess: (data) => {
      // new chat created → refresh chat list
      // queryClient.invalidateQueries(["userChats", uid]);

      selectedItem(data.chat_id);
    },
  })
  const handleGenerate = (selectedbook,selectedchapter) => {
    console.log("handlegenrate", selectedbook,selectedchapter);
    //  createworksheetmutation({ book_id:selectedbook.book_id,uid });
  }

  return (<div className="max-w-7xl mx-auto my-5 space-y-6">
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {navItem.title}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {navItem.description}           </p>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* {History} */}
      <History
        item={navItem.itemtype}
        historyData={mockHistory}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      {/* Woeksheet Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Generating {navItem.itemtype}...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while the AI prepares the questions.
            </p>
          </div>
        </div>
      ) : selectedItem ? (
        <WorksheetDetails item={selectedItem} />
      ) : (
       bookData && <NewWorksheetForm onGenerate={handleGenerate} data={bookData.content} />
      )}
    </div>
  </div>);
}