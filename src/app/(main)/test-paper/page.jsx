"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/app/componentsV2/ui/tool-page-layout";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import History from "@/app/componentsV2/ui/history";
import { getNavItemByUrl } from "@/app/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateTestPaper, useGetBook, useUserTestPapers, useGetTestPaperById, useDeleteTestPaper } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { useHistoryDelete } from "@/hooks/use-history-delete";
import { toast } from "react-toastify";
import * as z from "zod";
import { BookChapterForm } from "@/components/ui/BookChapterForm";



const testPaperFormSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
  class: z.string().nonempty("Please select a class/grade."),
  subject: z.string().nonempty("Please enter a subject."),
  total_marks: z.string().nonempty("Please enter total marks.").regex(/^\d+$/, "Must be a number"),
  duration: z.string().nonempty("Please enter duration."),
});

import TestPaperItem from "./TestPaperItem";

// Main Test Paper Page Component
export default function TestPaperPage() {
  const [testPaperData, setTestPaperData] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isNewTestPaper, setIsNewTestPaper] = useState(false);
  const [currentTestPaperId, setCurrentTestPaperId] = useState(null);
  const [selectedTestPaper, setSelectedTestPaper] = useState(null);

  const { user } = useAuth();
  const uid = user?.user?.uid;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const testPaperId = searchParams.get("test_paper_id");
  const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);
  const queryClient = useQueryClient();
  const { setTestPaperStatus } = useApiStore();

  const { data: userTestPapers, isLoading: testPapersLoading, isFetching: testPapersFetching } = useUserTestPapers(uid, {
    enabled: !!uid,
    onSuccess: () => setTestPaperStatus("success"),
    onError: () => setTestPaperStatus("error"),
  });

  // Normalize history items so history.jsx can render title/chapter/book correctly.
  // The backend list returns items where metadata (subject, chapter, class) may be
  // at the top level or inside a nested 'paper' object.
  const normalizedHistory = useMemo(() => {
    // Log the raw response so we can see the exact shape
    console.log("=== userTestPapers raw response ===", userTestPapers);

    // Handle all common API response shapes:
    //  - direct array: [...]
    //  - { content: [...] }
    //  - { data: [...] }
    //  - { test_papers: [...] }
    //  - { papers: [...] }
    let raw = [];
    if (!userTestPapers) {
      raw = [];
    } else if (Array.isArray(userTestPapers)) {
      raw = userTestPapers;
    } else if (Array.isArray(userTestPapers.content)) {
      raw = userTestPapers.content;
    } else if (Array.isArray(userTestPapers.data)) {
      raw = userTestPapers.data;
    } else if (Array.isArray(userTestPapers.test_papers)) {
      raw = userTestPapers.test_papers;
    } else if (Array.isArray(userTestPapers.papers)) {
      raw = userTestPapers.papers;
    } else {
      console.warn("Unexpected userTestPapers shape:", userTestPapers);
      raw = [];
    }

    console.log("Resolved raw history list:", raw);

    // 2. Sort newest first (if created_at exists)
    const sorted = [...raw].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return sorted.map((item) => {
      const meta = item.paper || {};
      return {
        ...item,
        // 'title' is used as the primary label in history.jsx
        title: item.title || meta.title || item.subject || meta.subject || "Test Paper",
        // 'chapter' is used as the secondary label fallback
        chapter: item.chapter || meta.chapter || "",
        // 'book' is shown as the subtitle
        book: item.book || meta.book || item.subject || meta.subject || "",
        // ensure id is always present for selection/delete
        // The list API may return paper_id at the top level (not id)
        id: item.id || item.paper_id || meta.paper_id || meta.id,
      };
    });
  }, [userTestPapers]);

  useEffect(() => {
    if (!uid) return;
    if (testPapersLoading) {
      setTestPaperStatus("loading");
    }
  }, [testPapersLoading, uid, setTestPaperStatus]);

  const { data: bookData, isLoading: bookLoading } = useGetBook();

  const { mutate: generateTestPaperMutation, isPending: generatingTestPaper } = useGenerateTestPaper({
    onMutate: () => {
      setTestPaperStatus("loading");
    },
    onSuccess: (data) => {
      console.log("=== Test Paper API Response ===");
      console.log("Full response:", data);
      console.log("data.paper_id:", data.paper_id);
      console.log("data.test_paper_id:", data.test_paper_id);
      console.log("data.id:", data.id);

      // The generate API returns the full paper object at the top level:
      // { message, paper_id, paper: {...}, sections: [...], answer_key: [...] }
      // No wrapper needed — use data directly as the paper content.
      const testPaperContent = data.test_paper || data.content || data;

      setTestPaperData(testPaperContent);
      // Backend returns the ID as paper_id, test_paper_id, or id — check all
      const paperId = data.paper_id || data.test_paper_id || data.id;
      setCurrentTestPaperId(paperId);
      setIsNewTestPaper(true); // Mark as new
      setSelectedTestPaper(null); // Clear any selected test paper
      setTestPaperStatus("success");

      // ✅ Instantly update the cache list for immediate UI feedback
      const newPaperEntry = {
        id: paperId,
        paper_id: paperId,
        title: data.title || data.subject || "Test Paper",
        chapter: data.chapter || "",
        book: data.book || data.subject || "",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["test-papers", uid], (oldData) => {
        if (!oldData) return { content: [newPaperEntry] };
        
        // Handle variations of list structure
        if (Array.isArray(oldData)) return [newPaperEntry, ...oldData];
        if (Array.isArray(oldData.content)) return { ...oldData, content: [newPaperEntry, ...oldData.content] };
        if (Array.isArray(oldData.data)) return { ...oldData, data: [newPaperEntry, ...oldData.data] };
        if (Array.isArray(oldData.papers)) return { ...oldData, papers: [newPaperEntry, ...oldData.papers] };
        
        return { content: [newPaperEntry, ...(oldData.content || [])] };
      });

      // Background sync to ensure everything is perfect
      if (uid) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["test-papers", uid],
            exact: true,
            refetchType: 'active'
          });
        }, 3000);
      }

      toast.success("Test paper generated successfully!");
    },
    onError: (error) => {
      setTestPaperStatus("error");
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to generate test paper. Please try again.";
      toast.error(errorMessage);
      console.error("Test paper generation error:", error);
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteTestPaper,
    queryKeyToInvalidate: ["test-papers", uid],
    idPropertyName: "test_paper_id", // Backend expects test_paper_id
    onDeleteSuccess: (variables) => {
      setTestPaperStatus("success");
      const deletedId = variables.test_paper_id;

      // Clear selected paper if it was the one deleted
      if (selectedTestPaper && selectedTestPaper.id === deletedId) {
        setSelectedTestPaper(null);
      }
      // Clear new paper display if it was the one deleted
      if (currentTestPaperId && currentTestPaperId === deletedId) {
        setTestPaperData(null);
        setCurrentTestPaperId(null);
        setIsNewTestPaper(false);
      }
    },
  });

  const handleDeleteTestPaper = useCallback((item) => {
    // Note: The history item id is used as the test_paper_id for deletion
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, formData) => {
    if (!book || !formData) return;

    console.log("Generating Test Paper with payload:", {
      subject: formData.subject,
      chapter: formData.chapter,
      book: book.book_name,
      bookId: book.id
    });

    setSelectedBookId(book.id);
    setIsNewTestPaper(true);
    setSelectedTestPaper(null);
    setTestPaperData(null); // Clear previous paper data

    generateTestPaperMutation({
      uid: uid,
      book_id: book.id,
      chapter: formData.chapter,
      class: formData.class,
      subject: formData.subject,
      total_marks: parseInt(formData.total_marks),
      duration: formData.duration,
    });
  }, [uid, generateTestPaperMutation]);

  // When a history item is selected, fetch its full data (including sections/questions)
  const selectedPaperId = selectedTestPaper?.id || null;
  const {
    data: fullSelectedPaperResponse,
    isLoading: isLoadingSelectedPaper,
  } = useGetTestPaperById(selectedPaperId, uid, {
    enabled: !!selectedPaperId && !!uid && !isNewTestPaper,
  });

  // Unwrap fullSelectedPaper if it's in a data/test_paper property
  const fullSelectedPaper = useMemo(() => {
    if (!fullSelectedPaperResponse) return null;
    return fullSelectedPaperResponse.data || fullSelectedPaperResponse.test_paper || fullSelectedPaperResponse.content || fullSelectedPaperResponse;
  }, [fullSelectedPaperResponse]);

  useEffect(() => {
    // Only load from URL if we don't have a newly generated paper or a manually selected one
    if (testPaperId && normalizedHistory.length > 0 && !testPaperData && !selectedTestPaper) {
      const foundPaper = normalizedHistory.find((tp) => tp.id === testPaperId);
      if (foundPaper) {
        console.log("Loading test paper from URL ID:", testPaperId);
        setSelectedTestPaper(foundPaper);
      }
    }
  }, [testPaperId, normalizedHistory, testPaperData, selectedTestPaper]);

  return (
    <ToolPageLayout
      historyData={normalizedHistory}
      selectedItem={selectedTestPaper}
      setSelectedItem={(item) => {
        setSelectedTestPaper(item);
        setIsNewTestPaper(false);
        // Always clear generated data when selection changes or new test paper is requested
        setTestPaperData(null);
      }}
      onDelete={handleDeleteTestPaper}
      isHistoryLoading={testPapersLoading}
      deletingId={deletingId}
      isProcessing={generatingTestPaper}
      processingText={`Generating ${navItem?.title}...`}
    >
      {selectedTestPaper ? (
        isLoadingSelectedPaper ? (
          <div className="lg:col-span-3 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading test paper...</p>
            </div>
          </div>
        ) : (
          <TestPaperItem
            item={fullSelectedPaper
              ? { ...selectedTestPaper, ...fullSelectedPaper }  // merge metadata + questions
              : selectedTestPaper}
            bookId={selectedTestPaper.book_id}
            isNew={false}
            testPaperId={selectedTestPaper.id}
          />
        )
      ) : testPaperData ? (
        <TestPaperItem
          item={testPaperData}
          bookId={selectedBookId}
          isNew={isNewTestPaper}
          testPaperId={currentTestPaperId}
        />
      ) : (
        <BookChapterForm
          onGenerate={handleGenerate}
          pageHeaderTitle="Test Papers"
          pageHeaderDescription="Create formal assessments"
          pageHeaderIcon={FileText}
          buttonText="Generate Test Paper"
          isLoading={generatingTestPaper}
          formSchema={testPaperFormSchema}
          defaultValues={{
            book: "",
            chapter: "",
            class: "",
            subject: "",
            total_marks: "",
            duration: "",
          }}
          extraFields={(control) => (
            <>
              {/* Class/Grade */}
              <FormField
                control={control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class/Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["5", "6", "7", "8", "9", "10", "11", "12"].map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject */}
              <FormField
                control={control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography"].map(
                          (subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Marks */}
              <FormField
                control={control}
                name="total_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["30 minutes", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"].map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        />
      )}
    </ToolPageLayout>
  );
}
