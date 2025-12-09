"use client";

import { Button } from "@/components/ui/button";
import { useGenerateAnswerKey } from "@/lib/api/queries";
import { segregateQuestions } from "@/lib/constants";
import { ExternalLink, Printer, Sheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const WorksheetItem = ({ item, bookId, isNew, worksheetId }) => {
  const router = useRouter();

  const { mutate: generateAnswerKey, isPending } = useGenerateAnswerKey({
    onSuccess: (data) => {
          console.log("✅ GENERATED ANSWER KEY RESPONSE:", data); 
      const answerKeyId = data.answer_key_id || data.id;

      if (!answerKeyId) {
        console.error("No answer_key_id in response:", data);
        return;
      }

      router.push(`/answer-key?answer_key_id=${answerKeyId}`);
    },
    onError: (err) => {
      console.error("Failed to generate answer key", err);
    },
  });

  const handleAnswerKey = () => {
    console.log("item.uid:", item.uid);
    console.log("item:", item);

    const chapterValue = isNew ? item.chapter : item.content?.worksheet?.chapter;

    // Check if answer key already exists for this worksheet
    // You need to check your history or backend first
    // For now, let's navigate directly if we have an answer_key_id

    if (item.answer_key_id) {
      // ✅ Answer key already exists, just navigate to it
      router.push(`/answer-key?answer_key_id=${item.answer_key_id}`);
    } else {
      // ✅ Generate new answer key only if it doesn't exist
      generateAnswerKey({
        worksheet_id: worksheetId || item.id,
        book_id: bookId || item.book_id,
        uid: item.uid,
        chapter: chapterValue,
      });
    }
  };
  // const worksheetData = segregateQuestions(item?.worksheet?.questions ? item?.content?.worksheet?.questions : item?.content?.worksheet?.worksheet.questions);
  const worksheetData = segregateQuestions(isNew ? item.questions : item?.content?.worksheet?.questions);

  console.log("worksheetData", item);
  console.log("worksheetDataaa", isNew);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
        {/* Header with Actions */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Worksheet: {item.worksheet?.itle}</h2>
              <p className="text-sm text-muted-foreground">Generated from {item.chapter} on</p>
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
            >
              {/* <Link href="/answer-key">
                                <ExternalLink className="ml-2 h-4 w-10" /> Answer Key
                            </Link> */}
              Answer Key
            </Button>
          </div>
        </div>

        {/* Worksheet Content */}
        <div className="p-8">
          <div className="max-w-4xl">
            {/* Info Box */}
            <div className="rounded-xl border-2 border-primary/20 p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">{item.chapter}</h3>
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
              <h3 className="text-lg font-semibold mb-4">A. Multiple Choice Questions</h3>

              {worksheetData?.multipleChoice?.map((question, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <div className="pl-4 space-y-1 text-sm">
                      {question.options?.map((option, i) => (
                        <p key={i}>{option}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div>
                <h3 className="text-lg font-semibold mb-4">B. True or False</h3>
                {worksheetData?.trueFalse?.map((question, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="font-medium">{index + 1}</span>
                      <div className="flex-1">
                        <p className="mb-2">{question.question}</p>
                        <div className="flex gap-4 pl-4 text-sm">
                          <span>○ True</span>
                          <span>○ False</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">C. Fill in the Blanks</h3>
                <div className="space-y-4">
                  {worksheetData?.fillInTheBlanks?.map((question, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="font-medium">{index + 1}.</span>
                      <p className="flex-1">{question.question}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">B. Short Answer Questions</h3>
                <div className="space-y-4">
                  {worksheetData?.shortAnswer?.map((question, index) => (
                    <div>
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-2">{question.expected_answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetItem;
