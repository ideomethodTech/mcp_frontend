'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Loader2, BookOpen, Plus, File, FileText, Key } from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import History from '@/app/componentsV2/ui/history';
import { useSearchParams } from 'next/navigation';
import { parseAnswerKey } from '@/app/utils';


const formSchema = z.object({
  book: z.string().nonempty('Please select a book.'),
  chapter: z.string().nonempty('Please select a chapter.'),
});

const mockHistory = [
  {
    id: '1',
    title: 'The Brahmin and the Disciple',
    date: new Date('2025-10-13'),
    chapter: 'The Brahmin and the Disciple (Story)',
    book: 'Oliver English Class 05',
    content: `
1. c) Jupiter
   *Explanation: Jupiter is the largest planet in our solar system by a large margin.*

2. b) Mars
   *Explanation: Mars is often called the Red Planet due to its reddish appearance from iron oxide on its surface.*

3. Mercury
   *Explanation: Mercury is the innermost planet in our solar system.*

4. third
   *Explanation: The order of planets from the Sun is Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.*

5. Saturn's rings are made of billions of small particles of ice and rock. They are very wide but relatively thin.
`
  },
  {
    id: '2',
    title: 'Chapter 1 Worksheet',
    date: new Date('2025-10-11'),
    chapter: 'Chapter 1',
    book: 'The Great Gatsby',
    content: 'Answer key for Chapter 1 of The Great Gatsby.'
  },
];

const mockData = {
  books: [
    {
      name: 'Oliver English Class 05',
      chapters: [
        { name: 'The Brahmin and the Disciple (Story)', pages: '7 - 16' },
        { name: 'Another Chapter', pages: '17 - 28' },
      ]
    },
    {
      name: 'The Great Gatsby',
      chapters: [
        { name: 'Chapter 1', pages: '1 - 20' },
        { name: 'Chapter 2', pages: '21 - 45' },
      ]
    }
  ]
}

function AnswerKeyDetails({ item }) {
  const data = item.answer_key;
  if (!data) return null;

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">

        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <Key className="h-7 w-7 text-primary mt-1" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {data.worksheet_title}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Chapter: {data.chapter} • {data.total_questions} Questions
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 mb-10 border border-primary/10">
          <p className="text-foreground text-lg font-medium">
            AI-Generated Answer Key
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Below is the detailed answer explanation for each question.
          </p>
        </div>

        {/* All Questions */}
        <div className="space-y-10">
          {data.answers.map((q) => (
            <div
              key={q.question_number}
              className="rounded-xl border bg-muted/20 p-6 shadow-sm border-border"
            >
              {/* Question Number */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {q.question_number}
                </div>

                <div className="flex-1">

                  {/* Question Text */}
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {q.question}
                  </p>

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
                  <p className="mt-3 text-sm text-muted-foreground italic">
                    {q.explanation}
                  </p>

                  {/* Common Mistakes */}
                  {q.common_mistakes?.length > 0 && (
                    <div className="mt-5 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 rounded-lg p-4">
                      <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
                        Common Mistakes:
                      </p>
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
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                        Acceptable Variations:
                      </p>
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
                      <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
                        Key Points:
                      </p>
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
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                        Correction:
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                        {q.correction_for_false}
                      </p>
                    </div>
                  )}

                  {/* Scoring Guidance */}
                  {q.scoring_guidance && (
                    <div className="mt-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-900 rounded-lg p-4">
                      <p className="font-semibold text-purple-700 dark:text-purple-400">
                        Scoring Guidance:
                      </p>
                      <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                        {q.scoring_guidance}
                      </p>
                    </div>
                  )}

                  {/* Learning Point */}
                  <div className="mt-6 border-t pt-4">
                    <p className="text-sm text-primary font-semibold">
                      Learning Point:
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {q.learning_point}
                    </p>
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


function NewAnswerKeyForm({ onGenerate }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      book: '',
      chapter: '',
    },
  });

  const selectedBookName = form.watch('book');
  const selectedBook = mockData.books.find(b => b.name === selectedBookName);

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
            <CardDescription>
              Choose the book and chapter for your Answer Key.
            </CardDescription>
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
                            {mockData.books.map((book) => (
                              <SelectItem key={book.name} value={book.name}>{book.name}</SelectItem>
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
                            {selectedBook?.chapters.map((chapter) => (
                              <SelectItem key={chapter.name} value={chapter.name}>{chapter.name}</SelectItem>
                            ))}
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


  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (values) => {
    setIsLoading(true);
    setSelectedItem(null);
    setTimeout(() => {
      const newItem = {
        id: (mockHistory.length + 1).toString(),
        title: `${values.chapter} Key`,
        date: new Date(),
        chapter: values.chapter,
        book: values.book,
        content: `This is a newly generated answer key for ${values.chapter}.`
      };
      mockHistory.unshift(newItem);
      setSelectedItem(newItem);
      setIsLoading(false);
    }, 2000);
  }
const searchParams = useSearchParams();
const [answerData, setAnswerData] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);

useEffect(() => {
  const raw = searchParams.get("answer_key");
  if (!raw) return;

  try {
    const decodedOnce = decodeURIComponent(raw);
    const decodedTwice = decodeURIComponent(decodedOnce);
    const parsed = JSON.parse(decodedTwice);

    console.log("parsed:", parsed);
    setAnswerData(parsed);
  } catch (err) {
    console.error("Failed to parse answer key:", err);
  }
}, []);

useEffect(() => {
  if (answerData) {
    setSelectedItem({
      id: "url",
      title: answerData.title ?? "Answer Key",
      date: new Date(),
      chapter: answerData.chapter ?? "",
      book: answerData.book ?? "",
      content: answerData,
    });
  }
}, [answerData]);
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
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
              Automatically generate answer keys for your worksheets.            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          historyData={mockHistory}
        />
        {/* Lesson Plan Content */}
        {isLoading ? (
          // Loader
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Answer Key...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while the AI checks the answers.
              </p>
            </div>
          </div>
        ) : answerData ? (
          // When data comes from URL params (worksheet)
          <AnswerKeyDetails item={answerData} />
        ) : selectedItem ? (
          // When user selects from history
          selectedItem.answer_key ? (
            <AnswerKeyDetails item={selectedItem} />
          ) : (
            <div className="lg:col-span-3 p-6 rounded-xl border">
              <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
              <p>{selectedItem.content}</p>
            </div>
          )
        ) : (
          // Default → Show the new form
          <NewAnswerKeyForm onGenerate={handleGenerate} />
        )}
      </div>
    </div>
  )
}