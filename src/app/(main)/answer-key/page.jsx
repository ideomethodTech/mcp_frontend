"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  KeyRound,
  Loader2,
  BookOpen,
  Search,
  Zap,
  ChevronsLeft,
  Trash2,
  Clock,
  Sparkles,
  Key,
  FileText,
  Printer,
  Lightbulb,
  Plus,
  ChevronDown,
  Layers,
  CheckCircle2,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAllAnswerKeys,
  useGetBook,
  useGenerateAnswerKey,
  useUserWorksheet,
  useDeleteAnswerKey,
} from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useHistoryDelete } from '@/hooks/use-history-delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- UI Components ---

const Tag = ({ children, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm", colorClasses[color])}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

// --- Answer Key Sidebar ---

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
        {!isNavCollapsed && <h2 className="font-black text-gray-700 tracking-tight text-lg">Solutions</h2>}
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
            "w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white rounded-xl py-7 shadow-xl shadow-indigo-100 transition-all font-black gap-3 uppercase text-xs tracking-widest",
            isNavCollapsed && "px-0 justify-center"
          )}
        >
          <Plus className="w-5 h-5" />
          {!isNavCollapsed && "New Answer Key"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {!isNavCollapsed && selectedItem && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 tracking-widest px-1">Active Key</p>
            <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
              <p className="font-bold text-indigo-900 text-sm line-clamp-2">
                {selectedItem.worksheet_title || selectedItem.chapter || "Answer Key"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 tracking-tight">Verified Solution</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-black text-gray-400 tracking-widest">History</p>}
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
                    "flex-1 text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 border-2",
                    selectedItem?.id === item.id
                      ? "bg-white border-indigo-100 shadow-md translate-x-1"
                      : "bg-transparent border-transparent hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm",
                    selectedItem?.id === item.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    <Key className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate mb-0.5">
                        {item.worksheet_title || item.chapter || "Answer Key"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-black tracking-tighter">
                        <span className="truncate max-w-[80px]">{item.book_name || "Book"}</span>
                        <span className="bg-gray-100 px-2 rounded-lg py-0.5 whitespace-nowrap ml-1 font-bold">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
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
                    {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}

            {historyData.length === 0 && !isNavCollapsed && (
              <div className="text-center py-10 border-4 border-dashed border-gray-100 rounded-[2rem]">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No keys generated</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Answer Key Form ---

function NewAnswerKeyForm({ onGenerate, allWorksheets, booksData, isLoading }) {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const booksWithWorksheets = useMemo(() => {
    if (!booksData?.content || !allWorksheets?.content) return [];
    const worksheetBookIds = [...new Set(allWorksheets.content.map((ws) => String(ws.book_id)))];
    return booksData.content.filter((book) => worksheetBookIds.includes(String(book.id)));
  }, [booksData, allWorksheets]);

  const availableChapters = useMemo(() => {
    if (!selectedBookId || !allWorksheets?.content) return [];
    return [...new Set(allWorksheets.content
      .filter((ws) => String(ws.book_id) === String(selectedBookId))
      .map((ws) => ws.chapter))];
  }, [selectedBookId, allWorksheets]);

  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-80px)] bg-white p-10">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <KeyRound className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Generate Answer Key</h2>
          <p className="text-gray-400 font-bold text-sm tracking-tight">Select a processed book to generate verified answer keys for your worksheets.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block pl-1">Source Repository</label>
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
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                {booksWithWorksheets?.map((book, index) => (
                  <SelectItem key={book.id || index} value={book.id} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(
            "transition-all duration-300",
            selectedBookId ? "opacity-100" : "opacity-40 pointer-events-none"
          )}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block pl-1">Target Chapter</label>
            <Select
              value={selectedChapter || undefined}
              onValueChange={setSelectedChapter}
              disabled={!selectedBookId}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                {availableChapters?.map((chapter, index) => (
                  <SelectItem key={index} value={chapter} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                    {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!selectedBookId || !selectedChapter || isLoading}
            onClick={() => onGenerate({ book: selectedBookId, chapter: selectedChapter })}
            className="w-full h-15 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Official Key
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Answer Key Item (Display) ---

function AnswerKeyItem({ item }) {
  const data = item.content?.answers ? item.content : (item.answers ? item : item.content);
  if (!data || (!data.answers && !data.worksheet_title)) return (
    <div className="p-16 text-center text-gray-300 font-black uppercase tracking-[0.3em] bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 animate-pulse">
      No data packet available.
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Premium Header Card */}
      <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-sm overflow-hidden p-10 flex items-start justify-between">
        <div className="space-y-6 flex-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
            {data.worksheet_title || "Official Answer Key"}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Tag icon={BookOpen} color="indigo">{data.chapter}</Tag>
            <Tag icon={Layers} color="purple">{data.total_questions || data.answers?.length} Questions</Tag>
            <Tag icon={CheckCircle2} color="emerald">Quality Verified</Tag>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.print()}
          className="rounded-[1.5rem] border-2 font-black uppercase text-xs tracking-widest gap-2 px-8 py-7 hover:bg-gray-50 print:hidden transition-all active:scale-95 shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Print Solutions
        </Button>
      </div>

      {/* Solutions Body */}
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-12 shadow-sm space-y-16">
        {data.answers?.map((q, idx) => (
          <div key={idx} className="group relative pl-20 last:border-0 border-b border-gray-50 pb-16 last:pb-0">
            {/* Number Badge */}
            <div className="absolute left-0 top-0 w-14 h-14 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-[#6366f1] font-black text-xl shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110">
              {q.question_number || idx + 1}
            </div>

            <div className="space-y-10">
              {/* Question Text */}
              <div className="prose prose-slate max-w-none text-2xl text-gray-900 leading-tight">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
              </div>

              {/* Sub-Metadata */}
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border border-gray-200">
                  {q.question_type?.replace("_", " ") || "Evaluation"}
                </span>
              </div>

              {/* MCQ Options Display */}
              {q.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {Object.entries(q.options).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-[1.5rem] border-2 border-transparent transition-all hover:bg-white hover:border-indigo-100 group/opt">
                      <span className="w-10 h-10 rounded-xl bg-white border-2 border-gray-100 flex items-center justify-center text-xs font-black text-gray-300 group-hover/opt:text-indigo-600 group-hover/opt:border-indigo-100">{key}</span>
                      <span className="text-base font-bold text-gray-600 group-hover/opt:text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Correct Answer Premium Box */}
              <div className="bg-indigo-50 rounded-[2rem] p-10 border-2 border-indigo-100/50 relative overflow-hidden group/ans transition-all hover:shadow-xl hover:shadow-indigo-100 self-start">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/ans:opacity-10 transition-opacity">
                  <Sparkles className="w-20 h-20 text-indigo-600" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 tracking-[0.3em]">Verified Solution</span>
                </div>
                <div className="text-2xl font-black text-indigo-900 mb-6 leading-relaxed">
                  {typeof q.correct_answer === 'object' ? JSON.stringify(q.correct_answer) : String(q.correct_answer)}
                </div>

                {q.explanation && (
                  <div className="prose prose-sm max-w-none text-indigo-900/70 font-bold italic border-t-2 border-indigo-100/50 pt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Additional Insight Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.common_mistakes?.length > 0 && (
                  <div className="bg-rose-50/50 border-2 border-rose-100 rounded-[1.5rem] p-6 transition-all hover:shadow-lg">
                    <p className="text-[10px] font-black text-rose-500 tracking-[0.2em] mb-4">Common Pitfalls</p>
                    <ul className="space-y-3">
                      {q.common_mistakes.map((m, i) => (
                        <li key={i} className="flex gap-3 text-sm text-rose-800 font-bold leading-relaxed">
                          <span className="text-rose-300">•</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {q.key_points?.length > 0 && (
                  <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[1.5rem] p-6 transition-all hover:shadow-lg">
                    <p className="text-[10px] font-black text-emerald-500 tracking-[0.2em] mb-4">Key Concepts</p>
                    <ul className="space-y-3">
                      {q.key_points.map((p, i) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-800 font-bold leading-relaxed">
                          <span className="text-emerald-300">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Scoring Logic */}
              {q.scoring_guidance && (
                <div className="bg-amber-50/30 border-2 border-amber-100 rounded-[1.5rem] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Scoring Guidance</span>
                  </div>
                  <p className="text-sm font-bold text-amber-900/80 italic">{q.scoring_guidance}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Answer Key Display Container ---

function AnswerKeyDisplay({ item }) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-white relative">
      <div className="px-12 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20 shadow-sm shadow-gray-50/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center border-2 border-indigo-100 shadow-inner">
            <Key className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight text-sm">
              {item.worksheet_title || "Verified Key"}
            </h2>
            <p className="text-[10px] text-indigo-500 font-black tracking-[0.3em] flex items-center gap-1.5 mt-1">
              <Zap className="w-3 h-3" /> Educational Standard AI-Verified
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-12 pt-12 pb-24 scrollbar-hide">
        <div className="max-w-5xl mx-auto w-full">
          <AnswerKeyItem item={item} />
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
      toast.success("Answer key generated and verified.");
    },
    onError: (err) => {
      console.error("Failed to generate answer key", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to generate answer key.";
      toast.error(errorMessage);
    },
  });

  const historyData = useMemo(() => {
    const allKeys = allAnswerKeys?.content || [];
    return allKeys.reduce((acc, current) => {
      const exists = acc.find((item) => item.worksheet_id === current.worksheet_id);
      if (!exists) acc.push(current);
      return acc;
    }, []);
  }, [allAnswerKeys]);

  const handleGenerate = (values) => {
    if (!uid) return;
    const worksheetExists = allWorksheets?.content?.find((ws) =>
      String(ws.book_id) === String(values.book) &&
      String(ws.chapter).trim().toLowerCase() === String(values.chapter).trim().toLowerCase()
    );

    if (!worksheetExists) {
      toast.error(`A generated worksheet is required for "${values.chapter}".`);
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

      <div className="flex-1 flex flex-col h-full bg-white transition-all duration-300">
        {isGenerating || (isLoadingHistory && historyData.length === 0 && !allAnswerKeys?.content) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-indigo-50 rounded-[2rem]" />
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-[2rem] border-t-transparent animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Analyzing Responses...</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em]">Building solution matrix</p>
            </div>
          </div>
        ) : selectedItem ? (
          <AnswerKeyDisplay item={selectedItem} />
        ) : bookLoading ? (
          <div className="flex-1 flex items-center justify-center font-black text-xs uppercase tracking-widest text-gray-300">
            Fetching Library...
          </div>
        ) : (
          <NewAnswerKeyForm
            onGenerate={handleGenerate}
            allWorksheets={allWorksheets}
            booksData={booksData}
            isLoading={isGenerating}
          />
        )}
      </div>
    </div>
  );
}
