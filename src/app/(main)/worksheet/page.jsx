"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Loader2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorksheetItem from "./WorksheetItem";
import History from "@/app/componentsV2/ui/history";
import {
  useGenerateWorksheet,
  useGetWorksheets,
  useGetDocuments,
  useGetDocumentChapters,
  useGetWorksheet,
} from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

const WorksheetDetails = ({ item, documents }) => {
  const { data: worksheetData, isLoading } = useGetWorksheet(item.worksheet_id);

  if (isLoading) {
    return (
      <div className="lg:col-span-3">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Loading Worksheet...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we load the worksheet data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      <WorksheetItem item={item} worksheetData={worksheetData} documents={documents} />
    </div>
  );
};

function NewWorksheetForm({ onGenerate, documents, generateMutation }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  const selectedBookId = form.watch("book");
  const selectedBook = documents?.find((b) => b.document_id === selectedBookId);
  const { data: chapters } = useGetDocumentChapters(selectedBookId);

  // Attach chapters to selectedBook
  if (selectedBook && chapters) {
    selectedBook.chapters = chapters.messages || chapters;
  }
  console.log("Selected Book:", selectedBook);
  console.log("All Documents:", documents);
  return (
    <div className="lg:col-span-3">
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-2xl">
          <PageHeader
            title="Worksheet Generator"
            description="Create diverse worksheets with various question types."
            icon={FileText}
          />
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
                      "Generate Worksheet"
                    )}
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
  const [selectedItem, setSelectedItem] = useState(null);
  const generateMutation = useGenerateWorksheet();
  const { data: worksheets, isLoading: isLoadingHistory } = useGetWorksheets();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const queryClient = useQueryClient();
  const handleGenerate = async (values) => {
    try {
      const result = await generateMutation.mutateAsync({
        document_id: values.book,
        chapter_id: values.chapter,
        difficulty: 1,
        mcq_num: 10,
        fill_ups_num: 5,
        brief_qa_num: 5,
        true_false_num: 5,
        match_following_num: 5,
      });

      const selectedBook = documents?.find((doc) => doc.document_id === values.book);
      const bookName = selectedBook?.name || selectedBook?.filename;

      const selectedBookInForm = documents?.find((b) => b.document_id === values.book);
      const chapter = selectedBookInForm?.chapters?.find((ch) => ch.chapter_id === values.chapter);
      const chapterName = chapter?.chapter_name;

      const resultWithNames = {
        ...result,
        document_name: bookName,
        chapter_name: chapterName,
        title: bookName,
      };

      queryClient.invalidateQueries({ queryKey: ["worksheets"] });
      setSelectedItem(resultWithNames);
    } catch (error) {
      console.error("Failed to generate worksheet:", error);
      toast.error(error.response?.data?.message || "Failed to generate worksheet. Please try again.");
    }
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
              Worksheet Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Create diverse worksheets with various question types.{" "}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          historyData={worksheets?.worksheets}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          buttonText=" New Worksheet"
          documents={documents}
        />
        {/* Woeksheet Content */}
        {generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Worksheet...</h3>
              <p className="text-sm text-muted-foreground">Please wait while the AI prepares the questions.</p>
            </div>
          </div>
        ) : selectedItem ? (
          <WorksheetDetails item={selectedItem} documents={documents} />
        ) : (
          <NewWorksheetForm onGenerate={handleGenerate} documents={documents} generateMutation={generateMutation} />
        )}
      </div>
    </div>
  );
}
