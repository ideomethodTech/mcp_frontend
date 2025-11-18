import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetDocuments, useGetDocumentChapters } from "@/lib/api/queries";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

const defaultValues = {
  book: "",
  chapter: "",
};

export function NewLessonPlanForm({ onGenerate, generateMutation }) {
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
    <div className="lg:col-span-7">
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
