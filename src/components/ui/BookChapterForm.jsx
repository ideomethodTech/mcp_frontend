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
import { useAuth } from "@/contexts/auth-context";

export function BookChapterForm({
  onGenerate,
  pageHeaderTitle,
  pageHeaderDescription,
  pageHeaderIcon: PageHeaderIcon,
  cardTitle = "Book & Chapter Selection",
  cardDescription = "Choose the book and chapter",
  buttonText = "Generate",
  includeChapters = true,
  extraFields, // ✅ NEW: For additional form fields (class, subject, etc)
  isLoading = false, // ✅ NEW: For showing loading state
  formSchema,
  defaultValues,
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      book: "",
      chapter: "",
    },
  });

  const { user } = useAuth();
  const uid = user?.user?.uid || user?.uid;
  const { data: booksData, isLoading: bookLoading } = useGetBook(uid);
  const selectedBookId = form.watch("book");
  const selectedBook = booksData?.content?.find((b) => b.id === selectedBookId);

  const handleSubmit = (values) => {
    // ✅ Return full book object + form values
    onGenerate(selectedBook, values);
  };

  return (
    <div className="flex flex-col w-full min-h-[500px] lg:col-span-3">
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
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className={`grid grid-cols-1 ${includeChapters ? "md:grid-cols-2" : ""} gap-6`}>
                  {/* Book Selection */}
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Book</FormLabel>
                        <Select
                          disabled={bookLoading}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("chapter", ""); // ✅ Reset chapter
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={bookLoading ? "Loading books..." : "Select a book"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {booksData?.content?.map((book, index) => (
                              <SelectItem key={book.id || index} value={book.id}>
                                {book.book_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Chapter Selection */}
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
                              {selectedBook?.chapters?.map((chapter, index) => (
                                <SelectItem key={index} value={chapter}>
                                  {chapter}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* ✅ Extra fields for Test Paper, etc */}
                {/* ✅ Pass control to extraFields */}
                {typeof extraFields === "function" ? extraFields(form.control) : extraFields}

                <Button
                  type="submit"
                  className="w-full !mt-8"
                  size="lg"
                  disabled={bookLoading || isLoading || !selectedBook}
                >
                  {isLoading ? "Generating..." : buttonText}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
