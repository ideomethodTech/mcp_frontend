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
import { useDeleteWorksheet, useGenerateWorksheet, useGetBook, useUserWorksheet } from "@/lib/api/queries";
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
  const uid = useMemo(() => user?.user?.uid, [user]);
  const pathname = usePathname();
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { worksheetStatus, setWorksheetStatus } = useApiStore();
  const {
    data: userworksheet,
    isLoading: worksheetsLoading,
    isFetching: worksheetsFetching,
    isError: worksheetsError
  } = useUserWorksheet(uid, {
    enabled: !!uid,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (worksheetsLoading || worksheetsFetching) {
      setWorksheetStatus("loading");
    } else if (worksheetsError) {
      setWorksheetStatus("error");
    } else {
      setWorksheetStatus("success");
    }
  }, [worksheetsLoading, worksheetsFetching, worksheetsError, setWorksheetStatus]);

  const [selectedworksheet, setSelectedworksheet] = useState(null);
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  const {
    mutate: generateWSMutation,
    isPending: generatingWS,
    data: aiResponse,
  } = useGenerateWorksheet({
    onMutate: () => {
      setWorksheetStatus("loading");
    },
    onSuccess: (data) => {
      console.log("Worksheet generated successfully. Result ID:", data.worksheet_id);
      setWorksheetData(data.worksheet);
      setCurrentWorksheetId(data.worksheet_id);
      setWorksheetStatus("success");

      // Force an immediate refetch of the history
      if (uid) {
        console.log("Invalidating history queries for UID:", uid);
        queryClient.invalidateQueries({
          queryKey: ["ws", uid],
          refetchType: 'all',
        });
      }
    },
    onError: (err) => {
      console.error("Error generating worksheet:", err);
      setWorksheetStatus("error");
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteWorksheet,
    queryKeyToInvalidate: ["ws", uid],
    idPropertyName: "worksheet_id",
    onDeleteSuccess: (variables) => {
      setWorksheetStatus("success");
      if (selectedworksheet && selectedworksheet.id === variables.worksheet_id) {
        setSelectedworksheet(null);
      }
    },
  });

  const handleDeleteWorksheet = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter) => {
    if (!book) return;
    setSelectedBookId(book.id);
    setIsNewWorksheet(true);
    setSelectedworksheet(null);
    generateWSMutation({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
    });
  }, [uid, generateWSMutation]);

  return (
    <ToolPageLayout
      historyData={userworksheet?.content || []}
      selectedItem={selectedworksheet}
      setSelectedItem={(item) => {
        setSelectedworksheet(item);
        setIsNewWorksheet(false);
        // Always clear generated data when selection changes or new worksheet is requested
        setWorksheetData(null);
      }}
      onDelete={handleDeleteWorksheet}
      isHistoryLoading={worksheetsFetching}
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
