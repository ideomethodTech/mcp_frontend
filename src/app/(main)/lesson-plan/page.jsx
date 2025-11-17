"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, File, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import History from "@/app/componentsV2/ui/history";
import {
  useGenerateLearning,
  useGetLearnings,
  useGetLearning,
  useGetDocuments,
  useGetDocumentChapters,
} from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { ClipboardList } from "lucide-react";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

const defaultValues = {
  book: "",
  chapter: "",
};

function LessonPlanDetails({ item }) {
  console.log("Learning Detail:", item);

  const learningContent = item?.learning?.content || item?.content || "";
  const learningTitle = item?.learning?.title || item?.title || "Lesson Plan";

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{learningTitle}</h2>
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">Generated Learning Path</p>
            <p className="text-foreground">This AI-generated learning path is ready for your classroom.</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <div
            className="text-muted-foreground leading-relaxed"
            style={{
              fontFamily: "inherit",
              fontSize: "0.95rem",
              lineHeight: "1.7",
            }}
          >
            {learningContent.split("\n").map((line, index) => {
              // Skip lines that are just "---" (horizontal rules)
              if (line.trim() === "---") {
                return <div key={index} className="my-0" />; // Reduced spacing
              }

              // Handle headers (lines starting with #)
              if (line.startsWith("####")) {
                return (
                  <h4 key={index} className="text-base font-semibold text-foreground mt-5 mb-2">
                    {line.replace(/^####\s*#*\s*/, "")}
                  </h4>
                );
              }
              if (line.startsWith("###")) {
                return (
                  <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
                    {line.replace(/^###\s*#*\s*/, "")}
                  </h3>
                );
              }
              if (line.startsWith("##")) {
                return (
                  <h2 key={index} className="text-xl font-bold text-foreground mt-8 mb-4">
                    {line.replace(/^##\s*#*\s*/, "")}
                  </h2>
                );
              }

              // Handle bullet points - NO bullet, just text with left padding
              if (line.trim().startsWith("*")) {
                return (
                  <div key={index} className="ml-6 mb-2">
                    <span>{line.replace(/^\s*\*\s*/, "").replace(/\*\*/g, "")}</span>
                  </div>
                );
              }
              // Handle bold text (**text**)
              if (line.includes("**")) {
                const parts = line.split("**");
                return (
                  <p key={index} className="mb-3">
                    {parts.map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="font-semibold text-foreground">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }

              // Regular paragraphs
              if (line.trim()) {
                return (
                  <p key={index} className="mb-3">
                    {line}
                  </p>
                );
              }

              // Empty lines (reduced spacing)
              return <div key={index} className="h-1" />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewLessonPlanForm({ onGenerate, generateMutation }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });
  const selectedBookId = form.watch("book");
  const { data: documents } = useGetDocuments();
  const { data: chapters } = useGetDocumentChapters(selectedBookId);

  const selectedBook = documents?.find((b) => b.document_id === selectedBookId);
  if (selectedBook && chapters) {
    selectedBook.chapters = chapters.messages || chapters;
  }

  return (
    <div className="lg:col-span-3">
      <div className="flex justify-center items-center w-full">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-6 h-6 text-muted-foreground" />
              <CardTitle>Lesson Details</CardTitle>
            </div>
            <CardDescription>Select book and chapter for your lesson plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Book</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("chapter", ""); // Reset chapter when book changes
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a book" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documents && documents.length > 0 ? (
                              documents.map((doc, index) => (
                                <SelectItem key={index} value={doc.document_id}>
                                  {doc.name || doc.filename}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="text-gray-500">No books available</p>
                            )}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBook}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedBook?.chapters && selectedBook.chapters.length > 0 ? (
                              selectedBook.chapters
                                .sort((a, b) => a.start_page - b.start_page)
                                .map((chapter, index) => (
                                  <SelectItem key={index} value={chapter.chapter_id}>
                                    {chapter.chapter_name} (Page {chapter.start_page}-{chapter.end_page})
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="no-chapter" disabled>
                                No chapters available - Full book will be used
                              </SelectItem>
                            )}
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
                  disabled={!form.formState.isValid || generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Lesson Plan"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const generateMutation = useGenerateLearning();
  const { data: learnings, isLoading: isLoadingHistory } = useGetLearnings();
  const { data: selectedLearningData } = useGetLearning(selectedItem?.learning_id);

  console.log("Learning Detail:", selectedLearningData);
  console.log("Selected Item:", selectedItem);
  const queryClient = useQueryClient();

  const handleGenerate = async (values) => {
    try {
      const result = await generateMutation.mutateAsync({
        document_id: values.book,
        chapter_id: values.chapter,
      });
      queryClient.invalidateQueries({ queryKey: ["learnings"] });
      setSelectedItem(result);
      toast.success("Lesson plan generated successfully!");
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
      toast.error(error.response?.data?.message || "Failed to generate lesson plan.");
    }
  };

  const showHistory = (item) => {
    return (
      <button
        key={item.id}
        onClick={() => setSelectedItem(item)}
        className={cn(
          "w-full text-left p-2 rounded-lg border",
          selectedItem?.id === item.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
        )}
      >
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
          <File className="text-xs text-muted-foreground mt-1" />
          <span>{format(item.date, "dd/MM/yyyy")}</span>
        </div>
        <p className="font-medium text-foreground text-sm mb-1">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.grade}</p>
      </button>
    );
  };
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Lesson Plan Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Generate structured lesson plans for any topic or chapter
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          historyData={learnings?.learnings || []}
          buttonText="New Lesson Plan"
          subtitleField="document_name"
        />
        {/* Lesson Plan Content */}
        {generateMutation.isPending || isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Lesson Plan...</h3>
              <p className="text-sm text-muted-foreground">Please wait while the AI builds your plan.</p>
            </div>
          </div>
        ) : selectedItem ? (
          <LessonPlanDetails item={selectedLearningData || selectedItem} />
        ) : (
          <NewLessonPlanForm onGenerate={handleGenerate} generateMutation={generateMutation} />
        )}
      </div>
    </div>
  );
}
