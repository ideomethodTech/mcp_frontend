 import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Loader2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetDocumentChapters } from "@/lib/api/queries";
 
 const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});
 
 export function NewWorksheetForm({ onGenerate, documents, generateMutation }) {
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
    <div className="lg:col-span-7">
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
