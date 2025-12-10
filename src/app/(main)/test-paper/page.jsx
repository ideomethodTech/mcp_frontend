"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
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

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
      <div className="flex items-start gap-3 mb-8">
        <FileText className="h-7 w-7 text-primary mt-1" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">{itemWithId.title || "Test Paper"}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Class: {itemWithId.class} • Subject: {itemWithId.subject} • Marks: {itemWithId.total_marks} • Duration:{" "}
            {itemWithId.duration}
          </p>
        </div>
      </div>

      {/* Test Paper content display */}
      <div className="space-y-6">
        {itemWithId.questions?.map((question, index) => (
          <div key={index} className="border-b pb-6 last:border-0">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{question.question}</p>
                {question.options && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <p key={optIndex} className="text-sm text-muted-foreground">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-sm text-primary">
                  <span className="font-semibold">Marks:</span> {question.marks || "Not specified"}
                </div>
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
  const navItem = getNavItemByUrl(pathname);
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

  const handleGenerate = (book, formData) => {
    if (!book || !formData) return;

    console.log("📚 Selected Book:", book.book_name);
    console.log("📖 Selected Chapter:", formData.chapter);
    console.log("📋 Available Chapters:", book.chapters);
    console.log("✅ Chapter exists?", book.chapters.includes(formData.chapter));

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
  };
  useEffect(() => {
    if (testPaperId && userTestPapers?.content) {
      const foundPaper = userTestPapers.content.find((tp) => tp.id === testPaperId);
      if (foundPaper) {
        setSelectedTestPaper(foundPaper);
      }
    }
  }, [testPaperId, userTestPapers]);

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {navItem.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">{navItem.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Sidebar */}
        <History
          item={navItem.itemtype || "Test Paper"}
          historyData={userTestPapers?.content || []}
          selectedItem={selectedTestPaper}
          setSelectedItem={(item) => {
            setSelectedTestPaper(item);
            setIsNewTestPaper(false);
          }}
          isLoading={testPapersLoading}
        />

        {/* Test Paper Content Area */}
        {generatingTestPaper ? (
          <div className="lg:col-span-3">
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-full max-w-2xl">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Generating Test Paper...</h3>
                  <p className="text-sm text-muted-foreground">
                    Creating questions, setting marks, and formatting your test paper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedTestPaper ? (
          <div className="lg:col-span-3">
            <TestPaperItem
              item={selectedTestPaper}
              bookId={selectedTestPaper.book_id}
              isNew={false}
              testPaperId={selectedTestPaper.id}
            />
          </div>
        ) : testPaperData ? (
          <div className="lg:col-span-3">
            <TestPaperItem
              item={testPaperData}
              bookId={selectedBookId}
              isNew={isNewTestPaper}
              testPaperId={currentTestPaperId}
            />
          </div>
        ) : (
          <BookChapterForm
            onGenerate={(book, values) => handleGenerate(book, values)}
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
                          {[
                            "Science",
                            "Mathematics",
                            "Physics",
                            "Chemistry",
                            "Biology",
                            "English",
                            "History",
                            "Geography",
                          ].map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
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
      </div>
    </div>
  );
}
