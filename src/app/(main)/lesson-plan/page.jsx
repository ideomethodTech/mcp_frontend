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
  const uid = user?.user?.uid || user?.uid;
  const pathname = usePathname();
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { lessonPlanStatus, setLessonPlanStatus } = useApiStore();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [lessonPlanData, setLessonPlanData] = useState(null);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const { data: userLP, isLoading: LPloading, isFetching: LPFetching } = useUserLessonPlan(uid, {
    enabled: !!uid,
  });
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  useEffect(() => {
    if (userLP) setLessonPlanStatus("success");
  }, [userLP, setLessonPlanStatus]);

  useEffect(() => {
    if (!uid) return;
    if (LPloading) {
      setLessonPlanStatus("loading");
    }
  }, [LPloading, uid, setLessonPlanStatus]);

  const normalizedHistory = useMemo(() => {
    // 1. Resolve raw list from all possible backend property names
    let raw = [];
    if (!userLP) {
      raw = [];
    } else if (Array.isArray(userLP)) {
      raw = userLP;
    } else if (Array.isArray(userLP.content)) {
      raw = userLP.content;
    } else if (Array.isArray(userLP.data)) {
      raw = userLP.data;
    } else if (Array.isArray(userLP.lesson_plans)) {
      raw = userLP.lesson_plans;
    }

    // 2. Sort newest first
    const sorted = [...raw].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    // 3. Normalize for UI
    return sorted.map(item => ({
      ...item,
      id: item.id || item.lesson_plan_id,
      title: item.title || item.chapter || "Lesson Plan",
      book: item.book || item.book_name || ""
    }));
  }, [userLP]);

  // Mutations
  const { mutate: generateLessonPlan, isPending: isCreateLPPending } = useCreateLessonPlan({
    onMutate: () => {
      setLessonPlanStatus("loading");
    },
    onSuccess: (data) => {
      setLessonPlanData(data);
      setSelectedPlan(null);
      setLessonPlanStatus("success");

      const newPlan = {
        id: data.lesson_plan_id || data.id,
        lesson_plan_id: data.lesson_plan_id || data.id,
        title: data.title || data.chapter || "Lesson Plan",
        chapter: data.chapter || "Assessment",
        book: data.book || "",
        created_at: new Date().toISOString(),
      };

      // ✅ Instantly update the cache list for immediate UI feedback
      queryClient.setQueryData(['lp', uid], (oldData) => {
        if (!oldData) return { content: [newPlan] };

        // Handle variations of list structure to avoid accidental data loss
        if (Array.isArray(oldData)) return [newPlan, ...oldData];
        if (Array.isArray(oldData.content)) return { ...oldData, content: [newPlan, ...oldData.content] };
        if (Array.isArray(oldData.data)) return { ...oldData, data: [newPlan, ...oldData.data] };
        if (Array.isArray(oldData.lesson_plans)) return { ...oldData, lesson_plans: [newPlan, ...oldData.lesson_plans] };

        return {
          ...oldData,
          content: [newPlan, ...(oldData.content || [])]
        };
      });

      // Background sync to ensure everything is perfect
      if (uid) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['lp', uid],
            exact: true,
            refetchType: 'active'
          });
        }, 3000);
      }
    },
    onError: (err) => {
      console.error('Error generating lesson plan:', err);
      setLessonPlanStatus("error");
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to generate lesson plan.";
      toast.error(errorMessage);
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteLessonPlan,
    queryKeyToInvalidate: ['lp', uid],
    idPropertyName: 'lessonPlanId',
    onDeleteSuccess: (variables) => {
      setLessonPlanStatus("success");
      const deletedId = variables.lessonPlanId || variables.lesson_plan_id;
      if (selectedPlan && (selectedPlan.lesson_plan_id === deletedId || selectedPlan.id === deletedId)) {
        setSelectedPlan(null);
      }
    }
  });

  const handleDeleteLP = useCallback((item) => {
    if (!uid) return;

    // Perform actual deletion (hook handles optimistic cache removal thoroughly)
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter, weekCount = 2) => {
    const bookId = book?.id || book?.book_id;
    console.log("handleGenerate called with:", {
      bookName: book?.book_name,
      bookId: bookId,
      chapter,
      weekCount
    });

    if (!book) {
      console.warn("handleGenerate: No book selected");
      return;
    }

    // Validate ID
    if (!bookId) {
      console.error("handleGenerate: Book object is missing a valid ID property:", book);
      toast.error("Selected book has no valid ID. Please try another book.");
      return;
    }

    setIsNewPlan(true);
    setSelectedPlan(null);
    setLessonPlanData(null);

    generateLessonPlan({
      book_id: bookId,
      chapter: chapter,
      uid: uid,
      weeks: weekCount,
      subject: book.subject || book.book_subject,
      class: book.class || book.grade_level,
    });
  }, [uid, generateLessonPlan]);

  return (
    <ToolPageLayout
      historyData={normalizedHistory}
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
