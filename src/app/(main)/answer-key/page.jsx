"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, Loader2, BookOpen, FileText, Key } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import History from "@/app/componentsV2/ui/history";
import { useGetWorksheets, useGetWorksheet, useGetDocuments } from "@/lib/api/queries";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().optional(),
});

function AnswerKeyDetails({ item }) {
  const answers = item.answers || [];

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Key className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-foreground"> {item.title || "Answer Key"}</h2>
            <p className="text-muted-foreground text-sm">
              Answer Key for "{item.chapter_name || "Unknown Chapter"}" from the book "
              {item.document_name || "Unknown Book"}"
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 mb-8 border border-primary/10">
          <p className="text-sm text-muted-foreground mb-2">Generated Answer Key</p>
          <p className="text-foreground">The AI-generated answer key for the worksheet based on "{item.chapter}".</p>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          {answers?.map((ans) => (
            <div key={ans.id} className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {ans.id}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">{ans.title}</p>

                  {ans.explanation && (
                    <p className="text-sm text-muted-foreground italic">*Explanation: {ans.explanation}*</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* In case API sends a blob answer_key instead of list */}
          {(!answers || answers.length === 0) && (
            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.answer_key || item.content || "No answer key available"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewAnswerKeyForm({ onGenerate, documents }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  // Watch selected book ID
  const selectedBookId = form.watch("book");

  // Find selected book in API docs
  const selectedBook = documents?.find((d) => d.id === selectedBookId);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-full max-w-2xl">
        <PageHeader
          title="Answer Key Generator"
          description="Automatically generate answer keys for your worksheets."
          icon={KeyRound}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <CardTitle className="font-headline text-xl">Book & Chapter Selection</CardTitle>
            </div>
            <CardDescription>Choose the book and chapter for your Answer Key.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BOOK SELECT */}
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Book</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                  {/* CHAPTER SELECT */}
                  <FormField
                    control={form.control}
                    name="chapter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Chapter (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBook}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter (if available)" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {selectedBook?.chapters && selectedBook.chapters.length > 0 ? (
                              selectedBook.chapters.map((ch) => (
                                <SelectItem key={ch.id} value={ch.id}>
                                  {ch.title || ch.name}
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

                <Button type="submit" className="w-full !mt-8" size="lg" disabled={!form.formState.isValid}>
                  Generate Answer Key
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnswerKeyPage() {
  const [selectedItem, setSelectedItem] = useState(null);

  // API hooks
  const { data: worksheets, isLoading: isLoadingHistory } = useGetWorksheets();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const { data: selectedWorksheetData } = useGetWorksheet(selectedItem?.id);

  const handleGenerate = (values) => {
    // Match worksheet using book + chapter IDs
    const worksheet = worksheets.worksheets?.find(
      (w) => w.document_id === values.book && (!values.chapter || w.chapter_id === values.chapter)
    );

    if (worksheet) {
      setSelectedItem(worksheet);
    } else {
      console.log("No worksheet found for selected book & chapter");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Answer Key Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Automatically generate answer keys for your worksheets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* HISTORY SECTION */}
        <History
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          historyData={worksheets?.worksheets || []}
          buttonText="New Answer Key"
          subtitleField="document_name"
        />

        {/* RIGHT CONTENT */}
        {isLoadingHistory || isLoadingDocs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Answer Key...</h3>
              <p className="text-sm text-muted-foreground">Please wait while the AI checks the answers.</p>
            </div>
          </div>
        ) : selectedItem ? (
          <AnswerKeyDetails item={selectedWorksheetData || selectedItem} />
        ) : (
          <NewAnswerKeyForm onGenerate={handleGenerate} documents={documents} />
        )}
      </div>
    </div>
  );
}
