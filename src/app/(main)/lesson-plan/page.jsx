'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  Search,
  ChevronsLeft,
  Trash2,
  Zap,
  Layers,
  Palette,
  FileType
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCreateLessonPlan, useDeleteLessonPlan, useGetBook, useUserLessonPlan } from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHistoryDelete } from '@/hooks/use-history-delete';
import LessonPlanItem from './components/LessonPlanItem';
import { usePathname } from "next/navigation";
import { getNavItemByUrl } from "@/app/utils";

// --- Lesson Plan Sidebar ---

const LessonPlanSidebar = ({
  userLessonPlans,
  selectedPlan,
  setSelectedPlan,
  onDeletePlan,
  deletingId,
  isNavCollapsed,
  setIsNavCollapsed,
  onStartNew
}) => {
  return (
    <div className={cn(
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300",
      "w-full md:h-[calc(100vh-80px)]",
      isNavCollapsed ? "md:w-20" : "md:w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight">Lesson Plans</h2>}
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
          {!isNavCollapsed && "Create New Plan"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {/* Active Plan Section */}
        {!isNavCollapsed && selectedPlan && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest px-1">Active Plan</p>
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm transition-all animate-in fade-in slide-in-from-left-2">
              <p className="font-bold text-indigo-900 text-sm line-clamp-1">
                {selectedPlan.title || selectedPlan.chapter || "Lesson Plan"}
              </p>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-bold text-gray-400 tracking-widest">History</p>}
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {(userLessonPlans?.content || []).map((plan, index) => (
              <div key={plan.lesson_plan_id || `lesson-plan-${index}`} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-xl transition-all flex items-center gap-3",
                    selectedPlan?.lesson_plan_id === plan.lesson_plan_id
                      ? "bg-white border border-gray-100 shadow-sm"
                      : "hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedPlan?.lesson_plan_id === plan.lesson_plan_id ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                  )}>
                    <FileText className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-700 text-xs truncate mb-0.5">
                        {plan.title || plan.chapter || "Lesson Plan"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                        <span className="truncate max-w-[100px]">{plan.book || "Book"}</span>
                        <span className="bg-gray-100 px-1.5 rounded-full py-0.5 uppercase tracking-tighter whitespace-nowrap ml-1">
                          {plan.created_at || "Recent"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
                {!isNavCollapsed && selectedPlan?.lesson_plan_id === plan.lesson_plan_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlan(plan);
                    }}
                    disabled={deletingId === plan.lesson_plan_id}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingId === plan.lesson_plan_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ))}

            {(userLessonPlans?.content || []).length === 0 && !isNavCollapsed && (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                <Clock className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 tracking-widest">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Lesson Plan Display Component ---

function LessonPlanDisplay({ lessonPlan }) {
  if (!lessonPlan) return null;
  return (
    <div className="flex-1 flex flex-col min-h-[500px] md:h-[calc(100vh-80px)] bg-white relative">
      {/* Upper Info Bar */}
      <div className="px-6 md:px-10 py-4 md:py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 rounded-xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight text-xs md:text-sm">
              {lessonPlan.chapter || "Lesson Plan"}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold italic">{lessonPlan.book || "Generated Plan"}</p>
          </div>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-10 pb-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full">
          <LessonPlanItem item={lessonPlan} isgenrated={false} />
        </div>
      </div>
    </div>
  );
}

// --- New Lesson Plan Form Component ---

function NewLessonPlanForm({ onGenerate, data, isLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const weekCount = 2;

  const currentBook = data?.find(b => b.book_name === (selectedBook?.book_name || selectedBook));

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-400px)] md:h-[calc(100vh-80px)] bg-white p-6 md:p-10">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Create Lesson Plan</h2>
          <p className="text-gray-400 font-medium">Choose a book and chapter to generate a comprehensive lesson plan.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Book</label>
            <Select
              onValueChange={(val) => {
                const book = data.find(b => b.book_name === val);
                setSelectedBook(book);
                setSelectedChapter(null);
              }}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                {data?.map((book, index) => (
                  <SelectItem key={book.id || index} value={book.book_name} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(
            "transition-all duration-300",
            selectedBook ? "opacity-100" : "opacity-50 pointer-events-none"
          )}>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Chapter</label>
            <Select
              value={selectedChapter || undefined}
              onValueChange={setSelectedChapter}
              disabled={!selectedBook}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                {(selectedBook?.chapters || []).map((chapter, index) => (
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
            disabled={!selectedBook || !selectedChapter || isLoading}
            onClick={() => onGenerate(selectedBook, selectedChapter, weekCount)}
            className="w-full h-15 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Lesson Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function LessonPlanPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [lessonPlanData, setLessonPlanData] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // API Queries
  const { data: userLP, isLoading: LPloading } = useUserLessonPlan(uid, {
    enabled: !!uid,
  });
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Mutations
  const { mutate: generateLessonPlan, isPending: isCreateLPPending } = useCreateLessonPlan({
    onSuccess: (data) => {
      setLessonPlanData(data);
      setSelectedPlan(null);
      if (uid) {
        queryClient.invalidateQueries({ queryKey: ['lp', uid] });
      }
      toast.success("Lesson plan generated successfully!");
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to generate lesson plan.";
      toast.error(errorMessage);
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteLessonPlan,
    queryKeyToInvalidate: ['lp', uid],
    idPropertyName: 'lesson_plan_id',
    onDeleteSuccess: (variables) => {
      if (selectedPlan && selectedPlan.lesson_plan_id === variables.lessonPlanId) {
        setSelectedPlan(null);
      }
    }
  });

  const handleDeleteLP = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter, weekCount = 2) => {
    if (!book || !book.id) {
      toast.error("Invalid book selection.");
      return;
    }

    setSelectedPlan(null);
    setLessonPlanData(null);

    generateLessonPlan({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
      weeks: weekCount,
    });
  }, [uid, generateLessonPlan]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-[calc(100vh-80px)] md:overflow-hidden overflow-y-auto">
      <LessonPlanSidebar
        userLessonPlans={userLP}
        selectedPlan={selectedPlan}
        setSelectedPlan={(plan) => {
          setSelectedPlan(plan);
          setLessonPlanData(null);
        }}
        onDeletePlan={handleDeleteLP}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => {
          setSelectedPlan(null);
          setLessonPlanData(null);
        }}
      />

      <div className="flex-1 flex flex-col h-full bg-white">
        {isCreateLPPending || (LPloading && (userLP?.content || []).length === 0) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Crafting Your Plan...</h3>
              <p className="text-sm text-gray-400 font-medium">This may take a moment.</p>
            </div>
          </div>
        ) : selectedPlan ? (
          <LessonPlanDisplay lessonPlan={selectedPlan} />
        ) : lessonPlanData ? (
          <LessonPlanDisplay lessonPlan={lessonPlanData} />
        ) : (
          <NewLessonPlanForm
            onGenerate={handleGenerate}
            data={bookData?.content}
            isLoading={isCreateLPPending || bookLoading}
          />
        )}
      </div>
    </div>
  );
}
