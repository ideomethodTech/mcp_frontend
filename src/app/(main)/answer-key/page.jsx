"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  KeyRound, Loader2, BookOpen, Search, Zap, SlidersHorizontal,
  ArrowLeft, Plus, ChevronDown, CheckCircle2, ChevronRight, Minus, FileBox, LayoutList, GripVertical, ChevronsLeft, Trash2, Clock, Sparkles, Key, FileText, Printer, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAllAnswerKeys,
  useGetAnswerKeyById,
  useGetBook,
  useGenerateAnswerKey,
  useUserWorksheet,
  useDeleteAnswerKey,
} from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHistoryDelete } from '@/hooks/use-history-delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Sidebar Component ---

const AnswerKeySidebar = ({
  historyData,
  selectedItem,
  setSelectedItem,
  onDelete,
  deletingId,
  isNavCollapsed,
  setIsNavCollapsed,
  onStartNew
}) => {
  return (
    <div className={cn(
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300 h-[calc(100vh-80px)]",
      isNavCollapsed ? "w-20" : "w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight">Answer Keys</h2>}
        <button
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
        >
          {isNavCollapsed ? <Search className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={onStartNew}
          className={cn(
            "w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white rounded-xl py-6 shadow-lg shadow-indigo-100 transition-all font-bold gap-3",
            isNavCollapsed && "px-0 justify-center"
          )}
        >
          <div className="bg-white/20 rounded-full p-1 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          {!isNavCollapsed && "New Answer Key"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {/* Active Item Section */}
        {!isNavCollapsed && selectedItem && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Active Item</p>
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm transition-all animate-in fade-in slide-in-from-left-2">
              <p className="font-bold text-indigo-900 text-sm line-clamp-1">
                {selectedItem.worksheet_title || selectedItem.chapter || "Answer Key"}
              </p>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">History</p>}
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {historyData.map((item, index) => (
              <div key={item.id || `ak-${index}`} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-xl transition-all flex items-center gap-3",
                    selectedItem?.id === item.id
                      ? "bg-white border border-gray-100 shadow-sm"
                      : "hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedItem?.id === item.id ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                  )}>
                    <Key className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-700 text-xs truncate mb-0.5">
                        {item.worksheet_title || item.chapter || "Answer Key"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                        <span className="truncate max-w-[100px]">{item.book_id || "Book"}</span>
                        <span className="bg-gray-100 px-1.5 rounded-full py-0.5 uppercase tracking-tighter whitespace-nowrap ml-1">
                          {new Date(item.created_at).toLocaleDateString() || "Recent"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
                {!isNavCollapsed && selectedItem?.id === item.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    disabled={deletingId === item.id}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ))}

            {historyData.length === 0 && !isNavCollapsed && (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                <Clock className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Answer Key Form Component ---

function NewAnswerKeyForm({ onGenerate, allWorksheets, booksData }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // ✅ Filter books to only show those with worksheets
  const booksWithWorksheets = useMemo(() => {
    if (!booksData?.content || !allWorksheets?.content) return [];
    const worksheetBookIds = [...new Set(allWorksheets.content.map((ws) => String(ws.book_id)))];
    return booksData.content.filter((book) => worksheetBookIds.includes(String(book.id)));
  }, [booksData, allWorksheets]);

  const selectedBook = booksWithWorksheets?.find((b) => b.id === selectedBookId);

  // ✅ Get available chapters for selected book
  const availableChapters = useMemo(() => {
    if (!selectedBookId || !allWorksheets?.content) return [];
    return [...new Set(allWorksheets.content
      .filter((ws) => String(ws.book_id) === String(selectedBookId))
      .map((ws) => ws.chapter))];
  }, [selectedBookId, allWorksheets]);

  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-80px)] bg-white p-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <KeyRound className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Answer Key Generator</h2>
          <p className="text-gray-400 font-medium">Select a book and chapter with an existing worksheet to generate its answer key.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Book</label>
            <Select
              value={selectedBookId || undefined}
              onValueChange={(val) => {
                setSelectedBookId(val);
                setSelectedChapter(null);
              }}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                {booksWithWorksheets?.map((book, index) => (
                  <SelectItem
                    key={book.id || index}
                    value={book.id}
                    className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600"
                  >
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(
            "transition-all duration-300",
            selectedBookId ? "opacity-100" : "opacity-50 pointer-events-none"
          )}>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Chapter</label>
            <Select
              value={selectedChapter || undefined}
              onValueChange={setSelectedChapter}
              disabled={!selectedBookId}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                {availableChapters?.map((chapter, index) => (
                  <SelectItem
                    key={index}
                    value={chapter}
                    className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600"
                  >
                    {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!selectedBookId || !selectedChapter}
            onClick={() => onGenerate({ book: selectedBookId, chapter: selectedChapter })}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-base font-bold gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Generate Answer Key
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Answer Key Item Component (Inline) ---

function AnswerKeyItem({ item }) {
  const data = item.content?.answers ? item.content : (item.answers ? item : item.content);
  if (!data || (!data.answers && !data.worksheet_title)) return (
    <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
      No data available for this answer key.
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header with Actions */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Key className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Answer Key: {data.worksheet_title}</h2>
              <p className="text-sm text-gray-400 font-medium">Chapter: {data.chapter} • {data.total_questions} Questions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* All Questions */}
            {data?.answers?.map((q, idx) => (
              <div key={q.question_number || idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0">
                    {q.question_number}
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Question Text */}
                    <div className="prose prose-slate max-w-none font-bold text-lg text-gray-900 leading-tight">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
                    </div>

                    {/* Type Badge */}
                    <p className="inline-block px-3 py-1 rounded-lg bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {q.question_type?.replace("_", " ")}
                    </p>

                    {/* For MCQ Options */}
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-transparent">
                            <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">{key}</span>
                            <span className="text-sm font-semibold text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer Section */}
                    <div className="mt-6 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-12 h-12 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Official Correct Answer</span>
                      </div>
                      <div className="text-lg font-bold text-indigo-900 mb-4">
                        {typeof q.correct_answer === 'object' ? JSON.stringify(q.correct_answer) : String(q.correct_answer)}
                      </div>

                      {q.explanation && (
                        <div className="prose prose-sm max-w-none text-indigo-900/70 font-medium italic border-t border-indigo-100/50 pt-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Additional Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Common Mistakes */}
                      {q.common_mistakes?.length > 0 && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">Common Mistakes</p>
                          <ul className="space-y-2">
                            {q.common_mistakes.map((m, i) => (
                              <li key={i} className="flex gap-2 text-sm text-rose-800 font-medium leading-relaxed">
                                <span className="text-rose-300">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Acceptable Variations */}
                      {q.acceptable_variations?.length > 0 && (
                        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
                          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">Acceptable Variations</p>
                          <ul className="space-y-2">
                            {q.acceptable_variations.map((v, i) => (
                              <li key={i} className="flex gap-2 text-sm text-sky-800 font-medium leading-relaxed">
                                <span className="text-sky-300">•</span> {v}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Key Points */}
                      {q.key_points?.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Key Concepts</p>
                          <ul className="space-y-2">
                            {q.key_points.map((p, i) => (
                              <li key={i} className="flex gap-2 text-sm text-emerald-800 font-medium leading-relaxed">
                                <span className="text-emerald-300">•</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Scoring Guidance */}
                      {q.scoring_guidance && (
                        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                          <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3">Scoring Guidance</p>
                          <p className="text-sm text-violet-800 font-medium leading-relaxed">{q.scoring_guidance}</p>
                        </div>
                      )}
                    </div>

                    {/* Learning Point */}
                    {q.learning_point && (
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Takeaway Point</span>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 font-medium">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.learning_point}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {idx < data.answers.length - 1 && <div className="h-px bg-gray-100 mt-10" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function AnswerKeyPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.user?.uid;

  const [selectedItem, setSelectedItem] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // API Queries
  const { data: allAnswerKeys, isLoading: isLoadingHistory } = useGetAllAnswerKeys(uid);
  const { data: allWorksheets } = useUserWorksheet(uid, { enabled: !!uid });
  const { data: booksData, isLoading: bookLoading } = useGetBook();

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteAnswerKey,
    queryKeyToInvalidate: ["all-answer-keys", uid],
    idPropertyName: "answer_key_id",
    onDeleteSuccess: (variables) => {
      if (selectedItem?.id === variables.answer_key_id) {
        setSelectedItem(null);
      }
    },
  });

  const handleDeleteAnswerKey = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const { mutate: generateAnswerKey, isPending: isGenerating } = useGenerateAnswerKey({
    onSuccess: (data) => {
      setSelectedItem(data.answer_key || data);
      queryClient.invalidateQueries({ queryKey: ["all-answer-keys", uid] });
      queryClient.invalidateQueries({ queryKey: ["ws", uid] });
      toast.success("Answer key generated successfully.");
    },
    onError: (err) => {
      console.error("Failed to generate answer key", err);
      toast.error("Failed to generate answer key.");
    },
  });

  const historyData = useMemo(() => {
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

  const handleGenerate = (values) => {
    if (!uid) return;

    const worksheetExists = allWorksheets?.content?.find((ws) => {
      const bookMatch = String(ws.book_id) === String(values.book);
      const chapterMatch = String(ws.chapter).trim().toLowerCase() === String(values.chapter).trim().toLowerCase();
      return bookMatch && chapterMatch;
    });

    if (!worksheetExists) {
      toast.error(`Please generate a worksheet for "${values.chapter}" first.`);
      return;
    }

    const existingAnswerKey = allAnswerKeys?.content?.find((key) => key.worksheet_id === worksheetExists.id);

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

  return (
    <div className="flex bg-white h-[calc(100vh-80px)] overflow-hidden">
      <AnswerKeySidebar
        historyData={historyData}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        onDelete={handleDeleteAnswerKey}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => setSelectedItem(null)}
      />

      <div className="flex-1 flex flex-col h-full bg-white">
        {isGenerating || (isLoadingHistory && historyData.length === 0) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Generating Answer Key...</h3>
              <p className="text-sm text-gray-400 font-medium">This may take a moment.</p>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="flex-1 overflow-y-auto px-10 pt-10 pb-10 scrollbar-hide">
            <div className="max-w-4xl mx-auto w-full">
              <AnswerKeyItem item={selectedItem} />
            </div>
          </div>
        ) : bookLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <NewAnswerKeyForm
            onGenerate={handleGenerate}
            allWorksheets={allWorksheets}
            booksData={booksData}
          />
        )}
      </div>
    </div>
  );
}
