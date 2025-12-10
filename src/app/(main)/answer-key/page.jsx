"use client";

import { useEffect, useState } from "react";
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
import { usePathname, useSearchParams } from "next/navigation";
import { getNavItemByUrl } from "@/app/utils";
import {
  useGetAllAnswerKeys,
  useGetAnswerKeyById,
  useGetBook,
  useGenerateAnswerKey,
  useUserWorksheet,
} from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

function AnswerKeyDetails({ item }) {
  const data = item.content || item.content?.answers;
  if (!data) return null;

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <Key className="h-7 w-7 text-primary mt-1" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">{data.worksheet_title}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Chapter: {data.chapter} • {data.total_questions} Questions
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 mb-10 border border-primary/10">
          <p className="text-foreground text-lg font-medium">AI-Generated Answer Key</p>
          <p className="text-muted-foreground text-sm mt-1">
            Below is the detailed answer explanation for each question.
          </p>
        </div>

        {/* All Questions */}
        <div className="space-y-10">
          {data?.answers?.map((q) => (
            <div key={q.question_number} className="rounded-xl border bg-muted/20 p-6 shadow-sm border-border">
              {/* Question Number */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {q.question_number}
                </div>

                <div className="flex-1">
                  {/* Question Text */}
                  <p className="font-semibold text-lg text-foreground leading-tight">{q.question}</p>

                  {/* Type */}
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                    {q.question_type.replace("_", " ")}
                  </p>

                  {/* For MCQ */}
                  {q.options && (
                    <div className="mt-4 border-l-2 border-primary pl-4 space-y-1">
                      {Object.entries(q.options).map(([key, value]) => (
                        <p key={key} className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">{key}.</span> {value}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* For Key Points / Variations */}
                  {/* Correct Answer */}
                  <div className="mt-5">
                    <p className="font-semibold text-primary text-sm">
                      Correct Answer: <span className="text-foreground">{String(q.correct_answer)}</span>
                    </p>
                  </div>

                  {/* Explanation */}
                  <p className="mt-3 text-sm text-muted-foreground italic">{q.explanation}</p>

                  {/* Common Mistakes */}
                  {q.common_mistakes?.length > 0 && (
                    <div className="mt-5 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 rounded-lg p-4">
                      <p className="font-semibold text-red-700 dark:text-red-400 mb-2">Common Mistakes:</p>
                      <ul className="list-disc pl-5 text-sm text-red-800 dark:text-red-300 space-y-1">
                        {q.common_mistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Acceptable Variations */}
                  {q.acceptable_variations?.length > 0 && (
                    <div className="mt-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-900 rounded-lg p-4">
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Acceptable Variations:</p>
                      <ul className="list-disc pl-5 text-sm text-blue-800 dark:text-blue-300 space-y-1">
                        {q.acceptable_variations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Points */}
                  {q.key_points?.length > 0 && (
                    <div className="mt-5 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-900 rounded-lg p-4">
                      <p className="font-semibold text-green-700 dark:text-green-400 mb-2">Key Points:</p>
                      <ul className="list-disc pl-5 text-sm text-green-800 dark:text-green-300 space-y-1">
                        {q.key_points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Correction for False (True/False) */}
                  {q.correction_for_false && (
                    <div className="mt-5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-900 rounded-lg p-4">
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400">Correction:</p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">{q.correction_for_false}</p>
                    </div>
                  )}

                  {/* Scoring Guidance */}
                  {q.scoring_guidance && (
                    <div className="mt-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-900 rounded-lg p-4">
                      <p className="font-semibold text-purple-700 dark:text-purple-400">Scoring Guidance:</p>
                      <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">{q.scoring_guidance}</p>
                    </div>
                  )}

                  {/* Learning Point */}
                  <div className="mt-6 border-t pt-4">
                    <p className="text-sm text-primary font-semibold">Learning Point:</p>
                    <p className="text-sm text-muted-foreground mt-1">{q.learning_point}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewAnswerKeyForm({ onGenerate, allWorksheets }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: "",
      chapter: "",
    },
  });

  const { data: booksData } = useGetBook();

  // ✅ Filter books to only show those with worksheets
  const booksWithWorksheets = React.useMemo(() => {
    if (!booksData?.content || !allWorksheets?.content) return [];

    const worksheetBookIds = [...new Set(allWorksheets.content.map((ws) => ws.book_id))];
    return booksData.content.filter((book) => worksheetBookIds.includes(book.id));
  }, [booksData, allWorksheets]);

  const selectedBookId = form.watch("book");
  const selectedBook = booksWithWorksheets?.find((b) => b.id === selectedBookId);

  // ✅ Get available chapters for selected book
  const availableChapters = React.useMemo(() => {
    if (!selectedBookId || !allWorksheets?.content) return [];

    return [...new Set(allWorksheets.content.filter((ws) => ws.book_id === selectedBookId).map((ws) => ws.chapter))];
  }, [selectedBookId, allWorksheets]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] lg:col-span-3">
      <div className="w-full max-w-2xl">
        <PageHeader
          title="Answer Key Generator"
          description="Generate answer keys for your existing worksheets."
          icon={KeyRound}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <CardTitle className="font-headline text-xl">Select Worksheet</CardTitle>
            </div>
            <CardDescription>Choose from your existing worksheets to generate an answer key.</CardDescription>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a book" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {booksWithWorksheets?.map((book) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.book_name}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBook}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableChapters?.map((chapter, index) => (
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
                </div>
                <Button type="submit" className="w-full !mt-8" size="lg">
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
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const answerKeyId = searchParams.get("answer_key_id");
  const [selectedItem, setSelectedItem] = useState(null);
  const navItem = getNavItemByUrl(pathname);
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const { toast } = useToast();
  const { data: allAnswerKeys, isLoading: isLoadingHistory } = useGetAllAnswerKeys(uid);
  const { data: allWorksheets } = useUserWorksheet(uid, {
    enabled: !!uid,
  });
  const { data: answerKeyData, isLoading: isLoadingSingle } = useGetAnswerKeyById(answerKeyId, uid, {
    enabled: !!answerKeyId && !!uid,
  });
  const { mutate: generateAnswerKey, isPending: isGenerating } = useGenerateAnswerKey({
    onSuccess: (data) => {
      setSelectedItem(data);
      queryClient.invalidateQueries(["answer-keys", uid]);
      queryClient.invalidateQueries({ queryKey: ["ws", uid] });
      queryClient.invalidateQueries({ queryKey: ["all-answer-keys", uid] });
    },
    onError: (err) => {
      console.error("Failed to generate answer key", err);
      toast({
        title: "Error",
        description: "Failed to generate answer key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const historyData = React.useMemo(() => {
    const allKeys = allAnswerKeys?.content || [];
    const uniqueByWorksheet = allKeys.reduce((acc, current) => {
      const exists = acc.find((item) => item.worksheet_id === current.worksheet_id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    return uniqueByWorksheet;
  }, [allAnswerKeys]);

  console.log(historyData);

  useEffect(() => {
    if (answerKeyId && answerKeyData) {
      let itemToSelect;

      if (Array.isArray(answerKeyData?.content)) {
        itemToSelect = answerKeyData.content.find((item) => item.id === answerKeyId);
      } else {
        itemToSelect = answerKeyData;
      }

      if (itemToSelect) {
        setSelectedItem(itemToSelect);
      }
    }
  }, [answerKeyId, answerKeyData]);

  const handleGenerate = (values) => {
    if (!uid) {
      toast({
        title: "Authentication Error",
        description: "Please log in to generate answer keys.",
        variant: "destructive",
      });
      return;
    }

    if (!values.book || !values.chapter) {
      toast({
        title: "Missing Information",
        description: "Please select both a book and a chapter.",
        variant: "destructive",
      });
      return;
    }

    // ✅ CHECK if worksheet exists for this book + chapter
    const worksheetExists = allWorksheets?.content?.find((ws) => {
      console.log("Checking worksheet:", {
        ws_book_id: ws.book_id,
        values_book: values.book,
        ws_chapter: ws.chapter,
        values_chapter: values.chapter,
        match: ws.book_id === values.book && ws.chapter === values.chapter,
      });
      return ws.book_id === values.book && ws.chapter === values.chapter;
    });

    if (!worksheetExists) {
      toast({
        title: "No Worksheet Available",
        description: "Please generate a worksheet for this chapter first before creating an answer key.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Check if answer key already exists for this worksheet
    const existingAnswerKey = allAnswerKeys?.content?.find((key) => key.worksheet_id === worksheetExists.id);

    console.log("existingAnswerKey:", existingAnswerKey);

    if (existingAnswerKey) {
      setSelectedItem(existingAnswerKey);
    } else {
      generateAnswerKey({
        worksheet_id: worksheetExists.id,
        book_id: values.book,
        uid: uid,
        chapter: values.chapter,
      });
    }
  };
  const isLoading = isLoadingHistory || isLoadingSingle;

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

      {/* MAIN GRID */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* HISTORY */}
          <History
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            historyData={historyData}
            item={navItem.itemtype}
          />

          {selectedItem ? (
            <AnswerKeyDetails item={selectedItem} />
          ) : (
            <NewAnswerKeyForm onGenerate={handleGenerate} allWorksheets={allWorksheets} /> 
          )}
        </div>
      )}
    </div>
  );
}
