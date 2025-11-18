"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useGetDocuments, useGetDocumentChapters } from "@/lib/api/queries";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().optional(),
});

export function BookChapterForm({
  onGenerate,
  pageHeaderTitle,
  pageHeaderDescription,
  pageHeaderIcon: PageHeaderIcon,
  cardTitle = "Book & Chapter Selection",
  cardDescription = "Choose the book and chapter",
  buttonText = "Generate",
  includeChapters = true,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });
  const { data: documents } = useGetDocuments();
  const selectedBookId = form.watch("book");
  const selectedBook = documents?.find((b) => b.document_id === selectedBookId);
  const { data: chapters } = useGetDocumentChapters(selectedBookId);

  if (selectedBook && chapters) {
    selectedBook.chapters = chapters.messages || chapters;
  }

  return (
    <div className="flex flex-col w-full min-h-[500px] col-span-7">
      <div className="w-full max-w-2xl">
        <PageHeader title={pageHeaderTitle} description={pageHeaderDescription} icon={PageHeaderIcon} />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <CardTitle className="font-headline text-xl">{cardTitle}</CardTitle>
            </div>
            <CardDescription>{cardDescription}</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                <div className={`grid grid-cols-1 ${includeChapters ? "md:grid-cols-2" : ""}   gap-6`}>
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Book</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("chapter", "");
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

                  {includeChapters && (
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
                  )}
                </div>

                <Button type="submit" className="w-full !mt-8" size="lg" disabled={!form.formState.isValid}>
                  {buttonText}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
