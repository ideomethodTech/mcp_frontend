"use client";

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen } from 'lucide-react';
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
import { ToolPageLayout } from '@/app/componentsV2/ui/tool-page-layout';
import { usePathname } from 'next/navigation';
import { getNavItemByUrl } from '@/app/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateLessonPlan, useDeleteLessonPlan, useGetBook, useUserLessonPlan } from '@/lib/api/queries';
import LessonPlanItem from './components/LessonPlanItem';
import { useAuth } from '@/contexts/auth-context';
import useApiStore from '@/store/useApiStore';
import { useHistoryDelete } from '@/hooks/use-history-delete';

// Constants
const DEFAULT_WEEK_COUNT = 2;

// Memoized component to prevent unnecessary re-renders
const LessonPlanDetails = memo(function LessonPlanDetails({ item, isGenerated }) {
  return (
    <div className="lg:col-span-3">
      <LessonPlanItem item={item} isgenrated={isGenerated}></LessonPlanItem>
    </div>
  )
});

// Memoized form component to prevent unnecessary re-renders
const NewLessonPlanForm = memo(function NewLessonPlanForm({ onGenerate, data }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_WEEK_COUNT);

  const form = useForm({
    defaultValues: {
      book: "",
      chapter: "",
      duration: ""
    },
  });

  // Memoize the generate handler to prevent re-creation
  const handleSubmit = useCallback(() => {
    if (selectedBook && selectedChapter) {
      onGenerate(selectedBook, selectedChapter, selectedDuration);
    }
  }, [selectedBook, selectedChapter, selectedDuration, onGenerate]);

  // Memoize chapter options
  const chapterOptions = useMemo(
    () => selectedBook?.chapters || [],
    [selectedBook?.chapters]
  );

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
                Choose the book and chapter to generate a lesson plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                              {data?.map((book, index) => (
                                <SelectItem
                                  key={book.id || index}
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
                              {chapterOptions.map((chapter) => (
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
});


export default function LessonPlanPage() {
  const [lessonPlanData, setLessonPlanData] = useState(null);
  const { user } = useAuth();
  const uid = useMemo(() => user?.user?.uid, [user]);
  const pathname = usePathname();
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { lessonPlanStatus, setLessonPlanStatus } = useApiStore();

  // All lesson plans
  const { data: userLP, isLoading: LPloading } = useUserLessonPlan(uid, {
    enabled: !!uid,
    onSuccess: () => setLessonPlanStatus('success'),
    onError: () => setLessonPlanStatus('error'),
  });

  useEffect(() => {
    if (!uid) return;
    if (LPloading) {
      setLessonPlanStatus('loading');
    }
  }, [LPloading, uid, setLessonPlanStatus]);

  // Selected lesson plan
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);

  // Books
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Memoize book content to prevent unnecessary re-renders
  const bookContent = useMemo(() => bookData?.content, [bookData]);


  const { mutate: generateLessonPlan, isPending: isCreateLPPending } = useCreateLessonPlan({
    onMutate: () => {
      setLessonPlanStatus('loading');
    },
    onSuccess: (data) => {
      setLessonPlanData(data.lesson_plan);
      setLessonPlanStatus('success');
      if (uid) {
        queryClient.invalidateQueries({
          queryKey: ['lp', uid],
        });
      }
    },
    onError: (err) => {
      console.error("Error:", err);
      setLessonPlanStatus('error');
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteLessonPlan,
    queryKeyToInvalidate: ['lp', uid],
    idPropertyName: 'lesson_plan_id',
    onDeleteSuccess: (variables) => {
      setLessonPlanStatus('success');
      if (selectedLessonPlan && selectedLessonPlan.id === variables.lesson_plan_id) {
        setSelectedLessonPlan(null);
      }
    }
  });

  const handleDeleteLP = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter, weekCount = DEFAULT_WEEK_COUNT) => {
    if (!book) return;

    generateLessonPlan({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
      weeks: weekCount,
    });
  }, [uid, generateLessonPlan]);

  // Memoize history data to prevent unnecessary processing
  const historyData = useMemo(() => userLP?.content || [], [userLP]);

  // Memoize processing state
  const isProcessing = useMemo(
    () => isCreateLPPending || LPloading,
    [isCreateLPPending, LPloading]
  );

  // Memoize processing text
  const processingText = useMemo(
    () => `Generating ${navItem?.title}...`,
    [navItem?.title]
  );

  return (
    <ToolPageLayout
      historyData={historyData}
      selectedItem={selectedLessonPlan}
      setSelectedItem={setSelectedLessonPlan}
      onDelete={handleDeleteLP}
      isHistoryLoading={LPloading}
      deletingId={deletingId}
      isProcessing={isProcessing}
      processingText={processingText}
    >
      {selectedLessonPlan ? (
        <LessonPlanDetails item={selectedLessonPlan} isGenerated={false} />
      ) : lessonPlanData ? (
        <LessonPlanDetails item={lessonPlanData} isGenerated={true} />
      ) : (
        <NewLessonPlanForm onGenerate={handleGenerate} data={bookContent} />
      )}
    </ToolPageLayout>
  );
}
