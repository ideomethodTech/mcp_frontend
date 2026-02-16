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
      console.log("data.test_paper:", data.test_paper);
      console.log("data.content:", data.content);
      console.log("data.test_paper_id:", data.test_paper_id);
      console.log("data.id:", data.id);

      // Try multiple possible response structures
      const testPaperContent = data.test_paper || data.content || data;
      console.log("Extracted test paper content:", testPaperContent);

      setTestPaperData(testPaperContent);
      setCurrentTestPaperId(data.test_paper_id || data.id);
      setIsNewTestPaper(true); // Mark as new
      setSelectedTestPaper(null); // Clear any selected test paper
      setTestPaperStatus("success");

      // Force background refetch of history to update sidebar
      if (uid) {
        queryClient.invalidateQueries({
          queryKey: ["test-papers", uid],
          refetchType: 'all',
        });
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
      if (selectedTestPaper && (selectedTestPaper.id === variables.test_paper_id)) {
        setSelectedTestPaper(null);
      }
      // Force immediate background refetch of history to update sidebar
      if (uid) {
        queryClient.invalidateQueries({
          queryKey: ["test-papers", uid],
          refetchType: 'all',
        });
      }
    },
  });

  const handleDeleteTestPaper = useCallback((item) => {
    // Note: The history items has 'id', but the delete API expects 'test_paper_id'
    handleHistoryDelete({ ...item, test_paper_id: item.id }, { uid });
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
  useEffect(() => {
    // Only load from URL if we don't have a newly generated paper or a manually selected one
    if (testPaperId && userTestPapers?.content && !testPaperData && !selectedTestPaper) {
      const foundPaper = userTestPapers.content.find((tp) => tp.id === testPaperId);
      if (foundPaper) {
        console.log("Loading test paper from URL ID:", testPaperId);
        setSelectedTestPaper(foundPaper);
      }
    }
  }, [testPaperId, userTestPapers, testPaperData, selectedTestPaper]);

  return (
    <ToolPageLayout
      historyData={userTestPapers?.content || []}
      selectedItem={selectedTestPaper}
      setSelectedItem={(item) => {
        setSelectedTestPaper(item);
        setIsNewTestPaper(false);
        // Always clear generated data when selection changes or new test paper is requested
        setTestPaperData(null);
      }}
      onDelete={handleDeleteTestPaper}
      isHistoryLoading={testPapersLoading || testPapersFetching}
      deletingId={deletingId}
      isProcessing={generatingTestPaper}
      processingText={`Generating ${navItem?.title}...`}
    >
      {selectedTestPaper ? (
        <TestPaperItem
          item={selectedTestPaper}
          bookId={selectedTestPaper.book_id}
          isNew={false}
          testPaperId={selectedTestPaper.id}
        />
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
