"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, Loader2, BookOpen, Plus, File } from "lucide-react";
import { format } from "date-fns";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useGetWorksheets,
  useGetWorksheet,
  useGetDocuments,
} from "@/lib/api/queries";
import { toast } from "react-toastify";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

function AnswerKeyDetails({ item }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title || "Answer Key"}
        description={`Answer Key for "${
          item.chapter_name || "Unknown Chapter"
        }" from the book "${item.document_name || "Unknown Book"}"`}
        icon={KeyRound}
      />
      <Card>
        <CardHeader>
          <CardTitle>Generated Answer Key</CardTitle>
          <CardDescription>
            The AI-generated answer key for the worksheet based on &quot;
            {item.chapter}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
            {item.answer_key || item.content || "No answer key available"}
          </div>
        </CardContent>
      </Card>
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

  const selectedBookId = form.watch("book");
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
              <CardTitle className="font-headline text-xl">
                Book & Chapter Selection
              </CardTitle>
            </div>
            <CardDescription>
              Choose the book and chapter for your Answer Key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onGenerate)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Book</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a book" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documents?.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.name || doc.filename}
                              </SelectItem>
                            ))}
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedBook}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedBook?.chapters?.map((chapter) => (
                              <SelectItem key={chapter.id} value={chapter.id}>
                                {chapter.title || chapter.name}
                              </SelectItem>
                            ))}
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
                  disabled={!form.formState.isValid}
                >
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
  const { data: worksheets, isLoading: isLoadingHistory } = useGetWorksheets();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const { data: selectedWorksheetData } = useGetWorksheet(selectedItem?.id);

  const handleGenerate = (values) => {
    // Find the matching worksheet
    const worksheet = worksheets?.find(
      (w) => w.document_id === values.book && w.chapter_id === values.chapter
    );
    if (worksheet) {
      setSelectedItem(worksheet);
    } else {
      console.log("No worksheet found for selected book and chapter");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      <div className="hidden md:flex flex-col border-r bg-muted/20 p-4 space-y-4">
        <Button variant="outline" onClick={() => setSelectedItem(null)}>
          <Plus className="mr-2" /> New Answer Key
        </Button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-2">
            History
          </h3>
          <div className="space-y-2">
            {worksheets?.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "w-full text-left p-2 rounded-lg border",
                  selectedItem?.id === item.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <File className="w-4 h-4 text-amber-500" />
                  <span>
                    {item.created_at
                      ? format(new Date(item.created_at), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>
                <p className="font-semibold text-sm truncate">
                  {item.title || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.document_name || "Unknown"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6">
        {isLoadingHistory || isLoadingDocs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Generating Answer Key...
              </h3>
              <p className="text-sm text-muted-foreground">
                Please wait while the AI checks the answers.
              </p>
            </div>
          </div>
        ) : selectedItem ? (
          <AnswerKeyDetails item={selectedItem} />
        ) : (
          <NewAnswerKeyForm onGenerate={handleGenerate} documents={documents} />
        )}
      </main>
    </div>
  );
}
