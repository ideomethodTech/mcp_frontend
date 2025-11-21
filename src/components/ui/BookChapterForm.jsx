"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { BookChapterFormHeader } from "./BookChapterFormHeader";
import { useGetBook } from "@/lib/api/queries";

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

  const { data: booksData } = useGetBook();
  const selectedBookId = form.watch("book");

  // Get the selected book from booksData.content array
  const selectedBook = booksData?.content?.find((b) => b.id === selectedBookId);

  return (
    <div className="flex flex-col w-full min-h-[500px] col-span-7">
      <div className="w-full max-w-2xl">
        <BookChapterFormHeader title={pageHeaderTitle} description={pageHeaderDescription} icon={PageHeaderIcon} />

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
                <div className={`grid grid-cols-1 ${includeChapters ? "md:grid-cols-2" : ""} gap-6`}>
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
                            {booksData?.content && booksData.content.length > 0 ? (
                              booksData.content.map((book) => (
                                <SelectItem key={book.id} value={book.id}>
                                  {book.book_name}
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
                                selectedBook.chapters.map((chapter, index) => (
                                  <SelectItem key={index} value={chapter}>
                                    {chapter}
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
