"use client";

import { Button } from "@/components/ui/button";
import { useGenerateAnswerKey } from "@/lib/api/queries";
import { segregateQuestions } from "@/lib/constants";
import { Printer, Sheet } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useGetAllAnswerKeys } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WorksheetItem = ({ item, bookId, isNew, worksheetId }) => {
  const router = useRouter();
  const currentWorksheetId = worksheetId || item.id;
  const { user } = useAuth();

  // ✅ Get all answer keys and find existing one for this worksheet
  const { data: allAnswerKeys } = useGetAllAnswerKeys(item.uid);

  const { mutate: generateAnswerKey, isPending } = useGenerateAnswerKey({
    onSuccess: (data) => {
      const answerKeyId = data.answer_key_id || data.id;
      router.push(`/answer-key?answer_key_id=${answerKeyId}`);
    },
    onError: (err) => {
      console.error("Failed to generate answer key", err);
    },
  });

  const handleAnswerKey = () => {
    const chapterValue = isNew ? item.chapter : item.content?.worksheet?.chapter;

    // ✅ Check if answer key exists for this worksheet
    const existingAnswerKey = allAnswerKeys?.content?.find((key) => key.worksheet_id === currentWorksheetId);

    if (existingAnswerKey) {
      router.push(`/answer-key?answer_key_id=${existingAnswerKey.id}`);
    } else {
      generateAnswerKey({
        worksheet_id: currentWorksheetId,
        book_id: bookId || item.book_id,
        uid: user.user.uid,
        chapter: chapterValue,
      });
    }
  };

  // Extract questions with multiple fallback levels for various API response formats
  const questions =
    (isNew ? (item?.questions || item?.worksheet?.questions) :
      (item?.content?.worksheet?.questions || item?.content?.questions || item?.content?.worksheet?.worksheet?.questions)) || [];

  const worksheetData = segregateQuestions(questions);

  // Helper to safely render text (handles cases where API might return an object instead of string)
  const renderText = (text) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text.question || text.text || JSON.stringify(text);
    }
    return "";
  };

  // Extract title safely
  const worksheetTitle = item?.worksheet?.title || item?.worksheet?.itle || item?.content?.worksheet?.title || item?.title || "Educational Worksheet";

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
        {/* Header with Actions */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Worksheet: {worksheetTitle}</h2>
              <p className="text-sm text-muted-foreground">Generated from {item?.chapter || "this chapter"} on</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 "
              onClick={handleAnswerKey}
              disabled={isPending}
            >
              {isPending ? "Generating..." : "Answer Key"}
            </Button>
          </div>
        </div>

        {/* Worksheet Content */}
        <div className="p-8">
          <div className="max-w-4xl">
            {/* Info Box */}
            <div className="rounded-xl border-2 border-primary/20 p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">{item?.chapter || "Assessment"}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Name:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Class:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Roll No:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Section:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Date:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Grade:</span>
                  <div className="flex-1 border-b border-muted-foreground/30"></div>
                </div>
              </div>
              <div className="mt-4 text-right text-sm text-muted-foreground">Teacher's Signature: _______________</div>
            </div>

            {/* Questions Section */}
            <div className="space-y-8">
              {worksheetData?.multipleChoice?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">A. Multiple Choice Questions</h3>
                  <div className="space-y-6">
                    {worksheetData.multipleChoice.map((question, index) => (
                      <div key={`mcq-${index}`} className="space-y-2">
                        <div className="flex gap-2 font-medium">
                          <span>{index + 1}.</span>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderText(question.question)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="pl-4 space-y-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options?.map((option, i) => (
                            <p key={`opt-${index}-${i}`} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px]">{String.fromCharCode(65 + i)}</span>
                              {renderText(option)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {worksheetData?.trueFalse?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">B. True or False</h3>
                  <div className="space-y-4">
                    {worksheetData.trueFalse.map((question, index) => (
                      <div key={`tf-${index}`} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="font-medium">{index + 1}.</span>
                          <div className="flex-1">
                            <div className="prose prose-sm max-w-none mb-2">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {renderText(question.question)}
                              </ReactMarkdown>
                            </div>
                            <div className="flex gap-6 pl-4 text-sm">
                              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-border" /> True</span>
                              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-border" /> False</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {worksheetData?.fillInTheBlanks?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">C. Fill in the Blanks</h3>
                  <div className="space-y-4">
                    {worksheetData.fillInTheBlanks.map((question, index) => (
                      <div key={`fib-${index}`} className="flex items-start gap-3">
                        <span className="font-medium">{index + 1}.</span>
                        <div className="prose prose-sm max-w-none flex-1">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {renderText(question.question)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {worksheetData?.shortAnswer?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">D. Short Answer Questions</h3>
                  <div className="space-y-6">
                    {worksheetData.shortAnswer.map((question, index) => (
                      <div key={`sa-${index}`} className="space-y-2">
                        <div className="flex gap-2 font-medium">
                          <span>{index + 1}.</span>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderText(question.question || question.text)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="pl-4 min-h-[40px] border-b border-dashed border-border/50 text-muted-foreground italic text-sm">
                          Space for answer...
                        </div>
                        {/* Always show expected answer in the preview for the teacher */}
                        <div className="bg-primary/5 p-3 rounded-lg text-xs text-primary/80 mt-2">
                          <span className="font-bold">Expected:</span>
                          <div className="prose prose-xs max-w-none inline-block align-top ml-2">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderText(question.expected_answer || question.answer)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetItem;
