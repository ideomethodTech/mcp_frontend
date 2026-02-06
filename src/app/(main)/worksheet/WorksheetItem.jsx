"use client";

import { Button } from "@/components/ui/button";
import { useGenerateAnswerKey } from "@/lib/api/queries";
import { segregateQuestions } from "@/lib/constants";
import { Printer, Sheet, Sparkles } from "lucide-react";
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
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header with Actions */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Sheet className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Worksheet: {worksheetTitle}</h2>
              <p className="text-sm text-gray-400 font-medium">Generated from {item?.chapter || "this chapter"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white shadow-lg shadow-indigo-100 rounded-xl px-6"
              onClick={handleAnswerKey}
              disabled={isPending}
            >
              <Sparkles className="h-4 w-4" />
              {isPending ? "Generating..." : "Answer Key"}
            </Button>
          </div>
        </div>

        {/* Worksheet Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Info Box */}
            <div className="rounded-2xl border border-indigo-100 p-8 mb-10 bg-indigo-50/30 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sheet className="w-24 h-24 text-indigo-600" />
              </div>
              <h3 className="text-center font-black text-2xl mb-8 uppercase tracking-widest text-indigo-900">{item?.chapter || "Assessment"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Name</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Class</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Roll No</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Section</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Date</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
                <div className="flex gap-3 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter w-16">Grade</span>
                  <div className="flex-1 border-b-2 border-gray-100 pb-1"></div>
                </div>
              </div>
              <div className="mt-10 text-right text-xs font-bold text-gray-400 uppercase tracking-widest italic">Teacher's Signature: _______________________</div>
            </div>

            {/* Questions Section */}
            <div className="space-y-12">
              {worksheetData?.multipleChoice?.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">A</div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-8">Multiple Choice Questions</h3>
                  </div>
                  <div className="space-y-8 pl-4">
                    {worksheetData.multipleChoice.map((question, index) => (
                      <div key={`mcq-${index}`} className="space-y-4">
                        <div className="flex gap-4">
                          <span className="font-bold text-indigo-400 text-lg">{index + 1}.</span>
                          <div className="prose prose-slate max-w-none text-gray-800 font-medium">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderText(question.question)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options?.map((option, i) => (
                            <p key={`opt-${index}-${i}`} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group cursor-default">
                              <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">{String.fromCharCode(65 + i)}</span>
                              <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900">{renderText(option)}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {worksheetData?.trueFalse?.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">B</div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-8">True or False</h3>
                  </div>
                  <div className="space-y-6 pl-4">
                    {worksheetData.trueFalse.map((question, index) => (
                      <div key={`tf-${index}`} className="group p-4 rounded-2xl hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-start gap-4">
                          <span className="font-bold text-indigo-400 text-lg">{index + 1}.</span>
                          <div className="flex-1">
                            <div className="prose prose-slate max-w-none mb-4 text-gray-800 font-medium">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {renderText(question.question)}
                              </ReactMarkdown>
                            </div>
                            <div className="flex gap-8 pl-2">
                              {['True', 'False'].map((choice) => (
                                <span key={choice} className="flex items-center gap-3 text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white group-hover:border-indigo-200 transition-colors" />
                                  {choice}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {worksheetData?.fillInTheBlanks?.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">C</div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-8">Fill in the Blanks</h3>
                  </div>
                  <div className="space-y-6 pl-4">
                    {worksheetData.fillInTheBlanks.map((question, index) => (
                      <div key={`fib-${index}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/50 transition-all">
                        <span className="font-bold text-indigo-400 text-lg">{index + 1}.</span>
                        <div className="prose prose-slate max-w-none flex-1 text-gray-800 font-medium leading-relaxed">
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">D</div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-8">Short Answer Questions</h3>
                  </div>
                  <div className="space-y-10 pl-4">
                    {worksheetData.shortAnswer.map((question, index) => (
                      <div key={`sa-${index}`} className="space-y-4">
                        <div className="flex gap-4">
                          <span className="font-bold text-indigo-400 text-lg">{index + 1}.</span>
                          <div className="prose prose-slate max-w-none text-gray-800 font-medium">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderText(question.question || question.text)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="pl-8 space-y-4">
                          <div className="h-20 w-full border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Student Response Area</span>
                          </div>
                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Expected Answer Preview</span>
                            </div>
                            <div className="prose prose-sm max-w-none text-indigo-900/70 font-medium italic">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {renderText(question.expected_answer || question.answer)}
                              </ReactMarkdown>
                            </div>
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
