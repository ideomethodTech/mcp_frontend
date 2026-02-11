'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Loader2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ToolPageLayout } from "@/app/componentsV2/ui/tool-page-layout";
import { useCreateLessonPlan, useDeleteLessonPlan, useGetBook, useUserLessonPlan } from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useHistoryDelete } from '@/hooks/use-history-delete';
import LessonPlanItem from './components/LessonPlanItem';
import useApiStore from "@/store/useApiStore";
import { usePathname } from "next/navigation";
import { getNavItemByUrl } from "@/app/utils";
import { toast } from "react-toastify";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

// --- Lesson Plan Details Component ---

const LessonPlanDetails = ({ item, isNew }) => {
  if (!item) return null;

  return (
    <div className="lg:col-span-3">
      <LessonPlanItem item={item} isgenrated={isNew} />
    </div>
  );
};

// --- New Lesson Plan Form Component ---

function NewLessonPlanForm({ onGenerate, data, bookLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const weekCount = 2; // Default to 2 weeks

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  return (
    <div className="lg:col-span-3">
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
                <CardTitle className="font-headline text-xl">Lesson Plan Generation</CardTitle>
              </div>
              <CardDescription>Select a book and chapter to generate a comprehensive lesson plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(() => {
                    onGenerate(selectedBook, selectedChapter, weekCount);
                  })}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="book"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Book</FormLabel>
                          <Select
                            disabled={bookLoading}
                            onValueChange={(val) => {
                              if (bookLoading) {
                                toast.info("Books are still loading, please wait...");
                                return;
                              }
                              const parsed = JSON.parse(val);
                              setSelectedBook(parsed);
                              form.setValue("book", parsed.book_name);
                              setSelectedChapter(null);
                              form.setValue("chapter", "");
                            }}
                            value={selectedBook ? JSON.stringify(selectedBook) : ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={bookLoading ? "Fetching books..." : "Select a book"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {data?.map((book, index) => (
                                <SelectItem key={book.id || index} value={JSON.stringify(book)}>
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
                            onValueChange={(val) => {
                              const parsed = JSON.parse(val);
                              setSelectedChapter(parsed);
                              form.setValue("chapter", parsed);
                            }}
                            value={selectedChapter ? JSON.stringify(selectedChapter) : ""}
                            disabled={!selectedBook}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedBook?.chapters?.map((chapter, index) => (
                                <SelectItem key={index} value={JSON.stringify(chapter)}>
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
                    className="w-full !mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    size="lg"
                    disabled={!selectedBook || !selectedChapter || bookLoading}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {bookLoading ? "Loading Books..." : "Generate Lesson Plan"}
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

// --- Main Page Component ---

export default function LessonPlanPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const pathname = usePathname();
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { lessonPlanStatus, setLessonPlanStatus } = useApiStore();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [lessonPlanData, setLessonPlanData] = useState(null);
  const [isNewPlan, setIsNewPlan] = useState(false);

  // API Queries
  const { data: userLP, isLoading: LPloading } = useUserLessonPlan(uid, {
    enabled: !!uid,
    onSuccess: () => setLessonPlanStatus("success"),
    onError: () => setLessonPlanStatus("error"),
  });
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  useEffect(() => {
    if (!uid) return;
    if (LPloading) {
      setLessonPlanStatus("loading");
    }
  }, [LPloading, uid, setLessonPlanStatus]);

  // Mutations
  const { mutate: generateLessonPlan, isPending: isCreateLPPending } = useCreateLessonPlan({
    onMutate: () => {
      setLessonPlanStatus("loading");
    },
    onSuccess: (data) => {
      console.log("Successfully generated lesson plan:", data);
      setLessonPlanData(data);
      setSelectedPlan(null);
      setLessonPlanStatus("success");
      if (uid) {
        queryClient.invalidateQueries({ queryKey: ['lp', uid] });
      }
    },
    onError: (err) => {
      console.error('Error generating lesson plan:', err);
      setLessonPlanStatus("error");
      toast.error("Failed to generate lesson plan.");
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteLessonPlan,
    queryKeyToInvalidate: ['lp', uid],
    idPropertyName: 'lessonPlanId',
    onDeleteSuccess: (variables) => {
      setLessonPlanStatus("success");
      if (selectedPlan && selectedPlan.lesson_plan_id === variables.lessonPlanId) {
        setSelectedPlan(null);
      }
    }
  });

  const handleDeleteLP = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter, weekCount = 2) => {
    console.log("handleGenerate called with:", {
      bookName: book?.book_name,
      bookId: book?.id,
      chapter,
      weekCount
    });

    if (!book) {
      console.warn("handleGenerate: No book selected");
      return;
    }

    // Validate ID
    if (!book.id) {
      console.error("handleGenerate: Book object is missing 'id' property:", book);
      toast.error("Selected book has no ID. Please try another book.");
      return;
    }

    setIsNewPlan(true);
    setSelectedPlan(null);
    setLessonPlanData(null);

    generateLessonPlan({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
      weeks: weekCount,
    });
  }, [uid, generateLessonPlan]);

  return (
    <ToolPageLayout
      historyData={userLP?.content || []}
      selectedItem={selectedPlan}
      setSelectedItem={(item) => {
        setSelectedPlan(item);
        setIsNewPlan(false);
        setLessonPlanData(null);
      }}
      onDelete={handleDeleteLP}
      isHistoryLoading={LPloading}
      deletingId={deletingId}
      isProcessing={isCreateLPPending}
      processingText={`Generating ${navItem?.title || 'Lesson Plan'}...`}
    >
      {selectedPlan ? (
        <LessonPlanDetails
          item={selectedPlan}
          isNew={false}
        />
      ) : lessonPlanData ? (
        <LessonPlanDetails
          item={lessonPlanData}
          isNew={isNewPlan}
        />
      ) : (
        <NewLessonPlanForm
          onGenerate={handleGenerate}
          data={bookData?.content}
          bookLoading={bookLoading}
        />
      )}
    </ToolPageLayout>
  );
}
