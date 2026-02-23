"use client";

import { Button } from "@/components/ui/button";
import { useGenerateAnswerKey } from "@/lib/api/queries";
import { segregateQuestions } from "@/lib/constants";
import {
  Printer,
  Sparkles,
  BookOpen,
  User,
  FileText,
  CheckCircle2,
  HelpCircle,
  List
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useGetAllAnswerKeys } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

const WorksheetItem = ({ item, bookId, isNew, worksheetId, onRegenerate, isRegenerating }) => {
  const router = useRouter();
  const currentWorksheetId = worksheetId || item.worksheet_id || item.id;
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

  // Helper for section styling (mapping question types to colors)
  const getSectionConfig = (type) => {
    switch (type) {
      case 'multipleChoice': return { label: "MULTIPLE CHOICE", pillColor: "bg-[#E0E7FF] text-[#4338ca]", titleColor: "text-[#1e1b4b]" };
      case 'trueFalse': return { label: "TRUE / FALSE", pillColor: "bg-[#FFEDD5] text-[#c2410c]", titleColor: "text-[#431407]" };
      case 'fillInTheBlanks': return { label: "FILL IN THE BLANKS", pillColor: "bg-[#E0F2FE] text-[#0369a1]", titleColor: "text-[#0c4a6e]" };
      case 'shortAnswer': return { label: "SHORT ANSWER", pillColor: "bg-[#DCFCE7] text-[#15803d]", titleColor: "text-[#052e16]" };
      default: return { label: "SECTION", pillColor: "bg-slate-100 text-slate-700", titleColor: "text-slate-900" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-slate-800">

      {/* Header Section with Pill and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            {item.chapter || "Worksheet"}
          </span>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button
            variant="outline"
            className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm font-semibold"
            onClick={() => onRegenerate && onRegenerate(bookId || item.book_id, item.chapter)}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Sparkles className="h-4 w-4 animate-spin text-indigo-500" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            )}
            Regenerate
          </Button>

          <Button
            variant="outline"
            className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm font-semibold"
            onClick={() => window.print()}
          >
            <FileText className="h-4 w-4 text-gray-500" />
            Download PDF
          </Button>

          <Button
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
            onClick={handleAnswerKey}
            disabled={isPending}
          >
            <Sparkles className="h-4 w-4" />
            {isPending ? "Generating..." : "Answer Key"}
          </Button>
        </div>
      </div>

      {/* Top Grid: Student Details & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Student Details Card (Gray) */}
        <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">Student Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
            {[
              { label: "Name" }, { label: "Class" },
              { label: "Roll No" }, { label: "Date" }
            ].map((field) => (
              <div key={field.label} className="col-span-1">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">{field.label}</span>
                  <div className="border-b-2 border-slate-300 h-6 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worksheet Info Card (White) */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-900">Worksheet Overview</h3>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>Topic: <span className="text-slate-900 font-bold">{worksheetTitle}</span></span>
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>Total Questions: <span className="text-slate-900 font-bold">{questions.length}</span></span>
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Question Sections */}
      <div className="mt-8 space-y-6">

        <div className="flex items-center gap-2 mb-2">
          <List className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-lg text-slate-900">Assessment Questions</h3>
        </div>

        {[
          { id: 'multipleChoice', data: worksheetData?.multipleChoice },
          { id: 'trueFalse', data: worksheetData?.trueFalse },
          { id: 'fillInTheBlanks', data: worksheetData?.fillInTheBlanks },
          { id: 'shortAnswer', data: worksheetData?.shortAnswer }
        ].map((section) => {
          if (!section.data || section.data.length === 0) return null;
          const config = getSectionConfig(section.id);

          return (
            <div key={section.id} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              {/* Pill */}
              <div className="mb-6">
                <span className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase",
                  config.pillColor
                )}>
                  {config.label}
                </span>
              </div>

              <div className="space-y-8 pl-1">
                {section.data.map((question, idx) => (
                  <div key={idx} className="group">
                    <div className="flex gap-4">
                      <span className={cn("font-bold text-lg", config.titleColor.replace('text-', 'text-opacity-60').replace('900', '400').replace('4b', '600'))}>{idx + 1}.</span>
                      <div className="flex-1 space-y-3">
                        <div className="prose prose-slate max-w-none text-slate-800 font-medium leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {renderText(question.question || question.text)}
                          </ReactMarkdown>
                        </div>

                        {/* Options for MCQ */}
                        {section.id === 'multipleChoice' && question.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {question.options.map((option, i) => (
                              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-transparent">
                                <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="text-sm font-medium text-slate-700">{renderText(option)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* True/False Options */}
                        {section.id === 'trueFalse' && (
                          <div className="flex gap-6 mt-2">
                            {['True', 'False'].map((choice) => (
                              <div key={choice} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                                <span className="text-sm font-bold text-slate-400">{choice}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer Space */}
                        {section.id === 'shortAnswer' && (
                          <div className="mt-4 p-4 border-l-2 border-slate-100 bg-slate-50/50 rounded-r-xl">
                            <p className="text-xs font-bold text-slate-400 tracking-wider mb-2">ANSWER:</p>
                            <div className="h-20 border-b border-slate-200 border-dashed"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default WorksheetItem;
