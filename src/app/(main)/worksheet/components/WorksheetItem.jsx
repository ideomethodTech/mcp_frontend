import { Button } from "@/components/ui/button";
import { ExternalLink, Printer, Sheet } from "lucide-react";
import Link from "next/link";
import React from "react";
import { format } from "date-fns";
import { useGetDocumentChapters } from "@/lib/api/queries";

const WorksheetItem = ({ item, worksheetData, documents }) => {
  const data = worksheetData?.worksheet || worksheetData || {};

  const book = documents?.find((doc) => doc.document_id === item.document_id);
  const bookName = book?.name || book?.filename || item.title ||"Book";
  console.log(book)
  console.log(bookName)
 

  const { data: chapters } = useGetDocumentChapters(item.document_id);
  const chapter = chapters?.messages?.find((ch) => ch.chapter_id === item.chapter_id);
  const chapterName = chapter?.chapter_name || item.chapter_name || "Chapter";
 console.log(chapterName)
  const mcqQuestions = data.mcqs || [];
  const fillUpQuestions = data.fill_ups || [];
  const trueFalseQuestions = data.true_false || [];
  const briefQuestions = data.brief_qas || [];
  const matchQuestions = data.match_following || [];

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Sheet className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-foreground">{`Worksheet: ${chapterName}`}</h2>
              <p className="text-sm text-muted-foreground">
                {`Generated from "${bookName}" on ${
                  item.created_at ? format(new Date(item.created_at), "MMMM dd, yyyy") : "Unknown date"
                }`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 ">
              <Link href={`/answer-key?worksheet_id=${item.worksheet_id}`} className="flex gap-2 items-center w-full">
                <ExternalLink className=" h-4 w-10" /> Answer Key
              </Link>
            </Button>
          </div>
        </div>

        {/* Worksheet Content */}
        <div className="p-8">
          <div className="max-w-4xl">
            {/* Info Box */}
            <div className="rounded-xl border-2 border-primary/20 p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">{chapterName}</h3>
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
              {/* Multiple Choice Questions */}
              {mcqQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">A. Multiple Choice Questions</h3>
                  {mcqQuestions.map((question, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <div>
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="pl-4 space-y-1 text-sm">
                          {question.options?.map((option, i) => (
                            <p key={i}>
                              {String.fromCharCode(97 + i)}. {option}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fill in the Blanks */}
              {fillUpQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">B. Fill in the Blanks</h3>
                  {fillUpQuestions.map((question, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False Questions */}
              {trueFalseQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">C. True or False</h3>
                  {trueFalseQuestions.map((question, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.statement}
                      </p>
                      <div className="flex gap-6 text-sm pl-4">
                        <span className="flex items-center gap-2">
                          <input type="radio" name={`tf-${index}`} className="h-4 w-4" /> True
                        </span>
                        <span className="flex items-center gap-2">
                          <input type="radio" name={`tf-${index}`} className="h-4 w-4" /> False
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer Questions */}
              {briefQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">D. Short Answer Questions</h3>
                  {briefQuestions.map((question, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                        <div className="border-b border-muted-foreground/20 h-6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Match the Following */}
              {matchQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">E. Match the Following</h3>
                  {matchQuestions.map((question, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <p className="font-medium mb-2">
                      {index + 1}. {question.question || "Match the following:"}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm pl-4">
                        <div className="space-y-2">
                          {question.left_column?.map((item, i) => (
                            <p key={i}>{item}</p>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {question.right_column?.map((item, i) => (
                            <p key={i}>{item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
