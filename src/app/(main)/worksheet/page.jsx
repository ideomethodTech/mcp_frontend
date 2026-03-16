"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorksheetItem from "./WorksheetItem";
import History from "@/app/componentsV2/ui/history";
import { ToolPageLayout } from "@/app/componentsV2/ui/tool-page-layout";
import { getNavItemByUrl } from "@/app/utils";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteWorksheet, useGenerateWorksheet, useGetBook, useUserWorksheet, useGetAllAnswerKeys, useDeleteAnswerKey } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { useHistoryDelete } from "@/hooks/use-history-delete";
import { toast } from "react-toastify";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

const WorksheetDetails = ({ item, bookId, isNew, worksheetId }) => {
  if (!item) {
    return;
  }
  const itemWithId = isNew ? { ...item, id: worksheetId } : item;
  return (
    <div className="lg:col-span-3">
      <WorksheetItem item={itemWithId} bookId={bookId} isNew={isNew} worksheetId={worksheetId}></WorksheetItem>
    </div>
  );
};

function NewWorksheetForm({ onGenerate, data, bookLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  const handleGenerate = () => {
    if (selectedBook && selectedChapter) {
      onGenerate(selectedBook, selectedChapter);
    }
  };

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
              <CardDescription>Choose the book and chapter to generate a worksheet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(() => {
                    onGenerate(selectedBook, selectedChapter);
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
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={bookLoading ? "Fetching books..." : "Select a book"} />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {data?.map((book, index) => (
                                <SelectItem key={book.id || book.book_id || index} value={JSON.stringify(book)}>
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
                            defaultValue={field.value}
                            disabled={!selectedBook}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedBook?.chapters?.map((chapter) => (
                                <SelectItem key={chapter} value={JSON.stringify(chapter)}>
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
                    className="w-full !mt-8"
                    size="lg"
                    disabled={!selectedBook || !selectedChapter || bookLoading}
                  >
                    {bookLoading ? "Loading Books..." : "Generate Worksheet"}
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
  const [isLoading, setIsLoading] = useState(false);
  const [worksheetData, setWorksheetData] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isNewWorksheet, setIsNewWorksheet] = useState(false);
  const [currentWorksheetId, setCurrentWorksheetId] = useState(null);

  const { user } = useAuth();
  const uid = user?.user?.uid || user?.uid;
  const pathname = usePathname();
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { worksheetStatus, setWorksheetStatus } = useApiStore();
  const { data: userworksheet, isLoading: worksheetsLoading, isFetching: worksheetsFetching } = useUserWorksheet(uid, {
    enabled: !!uid,
  });

  const { data: allAnswerKeys } = useGetAllAnswerKeys(uid, {
    enabled: !!uid,
  });

  const { mutate: deleteAKMutation } = useDeleteAnswerKey();

  useEffect(() => {
    if (userworksheet) setWorksheetStatus("success");
  }, [userworksheet, setWorksheetStatus]);

  useEffect(() => {
    if (!uid) return;
    if (worksheetsLoading) {
      setWorksheetStatus("loading");
    }
  }, [worksheetsLoading, uid, setWorksheetStatus]);

  const normalizedHistory = useMemo(() => {
    // 1. Resolve raw list from all possible backend property names
    let raw = [];
    if (!userworksheet) {
      raw = [];
    } else if (Array.isArray(userworksheet)) {
      raw = userworksheet;
    } else if (Array.isArray(userworksheet.content)) {
      raw = userworksheet.content;
    } else if (Array.isArray(userworksheet.data)) {
      raw = userworksheet.data;
    } else if (Array.isArray(userworksheet.worksheets)) {
      raw = userworksheet.worksheets;
    } else if (Array.isArray(userworksheet.items)) {
      raw = userworksheet.items;
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
      id: item.id || item.worksheet_id,
      title: item.title || item?.content?.worksheet?.title || item.chapter || "Worksheet",
      book: item.book || item.book_name || ""
    }));
  }, [userworksheet]);

  const [selectedworksheet, setSelectedworksheet] = useState(null);
  const { data: bookData, isLoading: bookLoading } = useGetBook(uid, {
    enabled: !!uid,
  });

  const {
    mutate: generateWSMutation,
    isPending: generatingWS,
    data: aiResponse,
  } = useGenerateWorksheet({
    onMutate: () => {
      setWorksheetStatus("loading");
    },
    onSuccess: (data) => {
      setWorksheetData(data.worksheet);
      setCurrentWorksheetId(data.worksheet_id);
      setWorksheetStatus("success");

      const newWorksheet = {
        id: data.worksheet_id,
        worksheet_id: data.worksheet_id,
        title: data.worksheet?.title || data.worksheet?.itle || "Worksheet",
        chapter: data.worksheet?.chapter || "Assessment",
        book_id: selectedBookId,
        created_at: new Date().toISOString(),
      };

      // ✅ Instantly update the cache list for immediate UI feedback
      queryClient.setQueryData(["ws", uid], (oldData) => {
        if (!oldData) return { content: [newWorksheet] };

        // Handle variations of list structure to avoid accidental data loss
        if (Array.isArray(oldData)) return [newWorksheet, ...oldData];
        if (Array.isArray(oldData.content)) return { ...oldData, content: [newWorksheet, ...oldData.content] };
        if (Array.isArray(oldData.data)) return { ...oldData, data: [newWorksheet, ...oldData.data] };
        if (Array.isArray(oldData.worksheets)) return { ...oldData, worksheets: [newWorksheet, ...oldData.worksheets] };

        // Fallback
        return {
          ...oldData,
          content: [newWorksheet, ...(oldData.content || [])]
        };
      });

      // Background sync to ensure everything is perfect
      if (uid) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["ws", uid],
            exact: true,
            refetchType: 'active'
          });
        }, 3000);
      }
    },
    onError: (error) => {
      setWorksheetStatus("error");
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to generate worksheet. Please try again.";
      toast.error(errorMessage);
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteWorksheet,
    queryKeyToInvalidate: ["ws", uid],
    idPropertyName: "worksheet_id",
    onDeleteSuccess: (variables) => {
      setWorksheetStatus("success");
      const deletedId = variables.worksheet_id;
      if (selectedworksheet && (selectedworksheet.id === deletedId || selectedworksheet.worksheet_id === deletedId)) {
        setSelectedworksheet(null);
      }

      // ✅ CASCADE DELETE: Find and delete ALL associated answer keys
      if (allAnswerKeys) {
        const rawKeys = allAnswerKeys.content || allAnswerKeys.data || (Array.isArray(allAnswerKeys) ? allAnswerKeys : []);
        const associatedKeys = rawKeys.filter(key => String(key.worksheet_id) === String(deletedId));

        associatedKeys.forEach(associatedKey => {
          console.log("Cascading delete for associated answer key:", associatedKey.id);
          deleteAKMutation({
            uid,
            answer_key_id: associatedKey.id || associatedKey.answer_key_id
          });
        });
      }
    },
  });

  const handleDeleteWorksheet = useCallback((item) => {
    const worksheetId = item.worksheet_id || item.id;
    if (!uid) return;

    // Perform the actual mutation (handles status/success toast and optimistic removal)
    handleHistoryDelete(item, { uid });

    // Automated cleanup of associated answer keys in the background
    if (worksheetId && allAnswerKeys) {
      const allKeys = allAnswerKeys.content || allAnswerKeys.data || (Array.isArray(allAnswerKeys) ? allAnswerKeys : []);
      const associatedKeys = allKeys.filter(key => String(key.worksheet_id) === String(worksheetId));

      associatedKeys.forEach(associatedKey => {
        deleteAKMutation({
          uid,
          answer_key_id: associatedKey.id || associatedKey.answer_key_id
        });
      });
    }
  }, [uid, handleHistoryDelete, allAnswerKeys, deleteAKMutation, queryClient]);

  const handleGenerate = useCallback((book, chapter) => {
    if (!book) return;
    const bookId = book.id || book.book_id;
    setSelectedBookId(bookId);
    setIsNewWorksheet(true);
    setSelectedworksheet(null);
    generateWSMutation({
      book_id: bookId,
      chapter: chapter,
      uid: uid,
      subject: book.subject || book.book_subject,
      class: book.class || book.grade_level,
    });
  }, [uid, generateWSMutation]);

  return (
    <ToolPageLayout
      historyData={normalizedHistory}
      selectedItem={selectedworksheet}
      setSelectedItem={(item) => {
        setSelectedworksheet(item);
        setIsNewWorksheet(false);
        // Always clear generated data when selection changes or new worksheet is requested
        setWorksheetData(null);
      }}
      onDelete={handleDeleteWorksheet}
      isHistoryLoading={worksheetsLoading}
      deletingId={deletingId}
      isProcessing={isLoading || generatingWS}
      processingText={`Generating ${navItem?.title}...`}
    >
      {selectedworksheet ? (
        <WorksheetDetails
          item={selectedworksheet}
          bookId={selectedworksheet.book_id}
          isNew={false}
          worksheetId={selectedworksheet.id}
        />
      ) : worksheetData ? (
        <WorksheetDetails
          item={worksheetData}
          bookId={selectedBookId}
          isNew={isNewWorksheet}
          worksheetId={currentWorksheetId}
        />
      ) : (
        <NewWorksheetForm onGenerate={handleGenerate} data={bookData?.content} bookLoading={bookLoading} />
      )}
    </ToolPageLayout>
  );
}
