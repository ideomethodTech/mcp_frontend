
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, File, FileText, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import History from '@/app/componentsV2/ui/history';
import { usePathname } from 'next/navigation';
import { getNavItemByUrl } from '@/app/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateLessonPlan, useGetBook, useUserLessonPlan } from '@/lib/api/queries';
import LessonPlanItem from './components/LessonPlanItem';
// import { useCreateLessonPlan, useGetBook } from '@/lib/api/queries';

function LessonPlanDetails({ item , isgenrated}) {
  // const lessonPlan = item.data;
  console.log(" lp item", item);
  return (
    <div className="lg:col-span-3">
      <LessonPlanItem  item={item} isgenrated={isgenrated}></LessonPlanItem>
    </div>
  )
}

function NewLessonPlanForm({ onGenerate, data }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedDuration, setselectedDuration] = useState(2);

  const form = useForm({
    defaultValues: {
      book: "",
      chapter: "",
      duration: ""
    },
  });

  const handleGenerate = () => {
    if (selectedBook && selectedChapter) {
      onGenerate(selectedBook, selectedChapter, selectedDuration);
    }
  }
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
                <form onSubmit={form.handleSubmit(() => {
                  onGenerate(selectedBook, selectedChapter, selectedDuration);
                })} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="book"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Book</FormLabel>
                          <Select onValueChange={(val) => {
                            const parsed = JSON.parse(val);
                            setSelectedBook(parsed);
                            form.setValue("book", parsed.book_name);
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
                                  value={JSON.stringify(book)}
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
                            const parsed = JSON.parse(val);
                            setSelectedChapter(parsed);
                            form.setValue("chapter", parsed);
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
                                  value={JSON.stringify(chapter)}
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
                    {/* <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 1 week"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);                 // update RHF form
                                setselectedDuration(e.target.value); // update local state
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>

                  <Button type="submit" className="w-full !mt-8" size="lg" >
                    Generate Lesson Plan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lpdata, setlpdata] = useState(null);

  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const uid = "nn170kZPMuWZlbzGbVps3YVyG9J3";
  const queryClient = useQueryClient();
  // All worksheets
  const { data: userLP, isLoading: LPloading } = useUserLessonPlan("uid_1234");

  // Selected worksheet
  const [slectedLessonPlan, setSelectedLessonPlan] = useState(null);
  // Books
  const { data: bookData, isLoading: bookLoading } = useGetBook();


  const { mutate: generateLessonPlan, isPending } = useCreateLessonPlan({
    onSuccess: (data) => {
      console.log("Lesson plan generated:", data);
      setlpdata(data.lesson_plan);
    },
    onError: (err) => {
      console.error("Error:", err);
    },
  });

  const handleGenerate = (book, chapter, weekCount =2  ) => {
    if (!book) return;

    console.log("bcuw",book,"d",chapter,"s", weekCount);
    generateLessonPlan({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
      weeks: weekCount,
    });
  };

  // const 
  console.log("selectedworksheet", slectedLessonPlan)
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
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
              {navItem.description}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          item={navItem.itemtype}
          selectedItem={slectedLessonPlan}
          setSelectedItem={setSelectedLessonPlan}
          historyData={userLP}
        />
        {/* Lesson Plan Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating {navItem.itemtype}...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while the AI builds your plan.
              </p>
            </div>
          </div>
        ) : slectedLessonPlan ? (
          <LessonPlanDetails item={slectedLessonPlan} isgenrated={false}/>
        ) :
          lpdata ? (
            <LessonPlanDetails item={lpdata} isgenrated={true}/>
          ) :
            (
              <NewLessonPlanForm onGenerate={handleGenerate} data={bookData?.content} />
            )}
      </div>
    </div>
  );
}
