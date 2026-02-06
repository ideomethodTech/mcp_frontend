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

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Test Paper Item Component (similar to WorksheetItem)
const TestPaperItem = ({ item, bookId, isNew, testPaperId }) => {
  if (!item) return null;

  const itemWithId = isNew ? { ...item, id: testPaperId } : item;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
      <div className="flex items-start gap-4 mb-10">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-sm">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{itemWithId.title || "Test Paper"}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-2 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Class: {itemWithId.class}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Subject: {itemWithId.subject}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Marks: {itemWithId.total_marks}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Duration: {itemWithId.duration}</span>
          </div>
        </div>
      </div>

      {/* Test Paper content display */}
      <div className="space-y-10">
        {itemWithId.questions?.map((question, index) => (
          <div key={index} className="group relative pl-14 last:border-0 border-b border-gray-50 pb-10 last:pb-0">
            {/* Question Number Badge */}
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-[#6366f1] font-bold text-sm shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="prose prose-sm max-w-none text-gray-800 font-medium leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question.question}
                </ReactMarkdown>
              </div>

              {question.options && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group/opt">
                      <span className="flex-shrink-0 w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover/opt:text-indigo-600 group-hover/opt:border-indigo-200 shadow-sm transition-all">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <p className="text-sm text-gray-600 group-hover/opt:text-indigo-900 transition-colors">{option}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/50 w-fit">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366f1]">Marks</span>
                <span className="text-sm font-bold text-indigo-900">{question.marks || "Not specified"}</span>
              </div>
            </div>
          </div>
        ))}
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

  const { data: userTestPapers, isLoading: testPapersLoading } = useUserTestPapers(uid, {
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
      setTestPaperData(data.test_paper || data);
      setCurrentTestPaperId(data.test_paper_id || data.id);
      setTestPaperStatus("success");

      // Invalidate test papers cache
      if (uid) {
        queryClient.invalidateQueries({
          queryKey: ["test-papers", uid],
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
      isHistoryLoading={testPapersLoading}
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
