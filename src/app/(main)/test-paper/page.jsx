"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPageLayout } from "@/app/componentsV2/ui/tool-page-layout";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import History from "@/app/componentsV2/ui/history";
import { getNavItemByUrl } from "@/app/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateTestPaper, useGetBook, useUserTestPapers } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
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

// Test Paper Item Component (similar to WorksheetItem)
const TestPaperItem = ({ item, bookId, isNew, testPaperId }) => {
  if (!item) return null;

  const itemWithId = isNew ? { ...item, id: testPaperId } : item;

  // Extract questions with multiple fallback levels for various API response formats
  const questions =
    (isNew ? (item?.questions || item?.test_paper?.questions) :
      (item?.content?.test_paper?.questions || item?.content?.questions || item?.content?.test_paper?.test_paper?.questions)) || [];

  // Extract metadata safely
  const paperTitle = itemWithId.title || itemWithId.test_paper?.title || item?.content?.test_paper?.title || "Test Paper";
  const paperClass = itemWithId.class || itemWithId.test_paper?.class || item?.content?.test_paper?.class || "N/A";
  const paperSubject = itemWithId.subject || itemWithId.test_paper?.subject || item?.content?.test_paper?.subject || "N/A";
  const paperMarks = itemWithId.total_marks || itemWithId.test_paper?.total_marks || item?.content?.test_paper?.total_marks || "N/A";
  const paperDuration = itemWithId.duration || itemWithId.test_paper?.duration || item?.content?.test_paper?.duration || "N/A";

  const renderText = (text) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text.question || text.text || JSON.stringify(text);
    }
    return "";
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)] overflow-hidden">
      {/* Header with Actions */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{paperTitle}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Class: {paperClass} • Subject: {paperSubject}
            </p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-dashed">
          <div className="text-sm font-medium">
            <p>Total Marks: {paperMarks}</p>
            <p>Duration: {paperDuration}</p>
          </div>
          <div className="text-right text-sm italic text-muted-foreground">
            Date: _________________
          </div>
        </div>

        {/* Test Paper content display */}
        <div className="space-y-8">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={index} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg leading-snug">{renderText(question.question || question)}</p>

                    {question.options && Array.isArray(question.options) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/50">
                            <span className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center font-medium text-xs">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            {renderText(option)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <div className="px-2 py-1 bg-primary/5 text-primary rounded-md font-medium">
                        Points: {question.marks || question.points || "1"}
                      </div>
                      {question.answer && (
                        <div className="text-muted-foreground italic print:hidden">
                          Key: {renderText(question.answer)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground italic">
              No questions found in this test paper.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

  const {
    data: userTestPapers,
    isLoading: testPapersLoading,
    isFetching: testPapersFetching,
    isError: testPapersError
  } = useUserTestPapers(uid, {
    enabled: !!uid,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (testPapersLoading || testPapersFetching) {
      setTestPaperStatus("loading");
    } else if (testPapersError) {
      setTestPaperStatus("error");
    } else {
      setTestPaperStatus("success");
    }
  }, [testPapersLoading, testPapersFetching, testPapersError, setTestPaperStatus]);

  const { data: bookData, isLoading: bookLoading } = useGetBook();

  const { mutate: generateTestPaperMutation, isPending: generatingTestPaper } = useGenerateTestPaper({
    onMutate: () => {
      setTestPaperStatus("loading");
    },
    onSuccess: (data) => {
      console.log("Test paper generated successfully. ID:", data.test_paper_id || data.id);
      setTestPaperData(data.test_paper || data);
      setCurrentTestPaperId(data.test_paper_id || data.id);
      setTestPaperStatus("success");

      // Invalidate test papers cache
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
      toast.error("Failed to generate test paper. Please try again.");
      console.error("Test paper generation error:", error);
    },
  });

  const handleGenerate = useCallback((book, formData) => {
    if (!book || !formData) return;

    setSelectedBookId(book.id);
    setIsNewTestPaper(true);
    setSelectedTestPaper(null);
    setTestPaperData(null); // Clear previous results

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
    if (testPaperId && userTestPapers?.content) {
      const foundPaper = userTestPapers.content.find((tp) => tp.id === testPaperId);
      if (foundPaper) {
        setSelectedTestPaper(foundPaper);
      }
    }
  }, [testPaperId, userTestPapers]);

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
      isHistoryLoading={testPapersFetching}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
