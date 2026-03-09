'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Loader2,
  Plus,
  Search,
  ChevronsLeft,
  Clock,
  Trash2,
  Sparkles,
  Printer,
  Download,
  BookOpen,
  GraduationCap,
  Zap,
  Key
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateTestPaper, useGetBook, useUserTestPapers, useDeleteTestPaper, useGetTestPaperAnswers } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { useHistoryDelete } from "@/hooks/use-history-delete";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import TestPaperItem from "./TestPaperItem";

// --- Test Paper Sidebar ---

const TestPaperSidebar = ({
  userTestPapers,
  selectedTestPaper,
  setSelectedTestPaper,
  onDeleteTestPaper,
  deletingId,
  isNavCollapsed,
  setIsNavCollapsed,
  onStartNew
}) => {
  const testPapers = useMemo(() => {
    let raw = [];
    if (!userTestPapers) raw = [];
    else if (Array.isArray(userTestPapers)) raw = userTestPapers;
    else if (Array.isArray(userTestPapers.content)) raw = userTestPapers.content;
    else if (Array.isArray(userTestPapers.data)) raw = userTestPapers.data;
    else if (Array.isArray(userTestPapers.test_papers)) raw = userTestPapers.test_papers;
    else if (Array.isArray(userTestPapers.papers)) raw = userTestPapers.papers;
    return raw;
  }, [userTestPapers]);

  return (
    <div className={cn(
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300",
      "w-full md:h-[calc(100vh-80px)]",
      isNavCollapsed ? "md:w-20" : "md:w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight text-lg">Assessments</h2>}
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
          {!isNavCollapsed && "New Assessment"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {/* Active Item Section */}
        {!isNavCollapsed && selectedTestPaper && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 tracking-widest px-1">Selected Draft</p>
            <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
              <p className="font-bold text-indigo-900 text-sm line-clamp-2">
                {selectedTestPaper.title || selectedTestPaper.paper?.title || "Standard Test Paper"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-600 tracking-tight">Active View</span>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-black text-gray-400 tracking-widest">History</p>}
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {testPapers.map((tp, index) => {
              const tpId = tp.id || tp.paper_id || tp.test_paper_id;
              const selectedId = selectedTestPaper?.id || selectedTestPaper?.paper_id || selectedTestPaper?.test_paper_id;
              const isActive = selectedId === tpId;

              return (
                <div key={tpId || `tp-${index}`} className="group relative flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTestPaper(tp)}
                    className={cn(
                      "flex-1 text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 border-2",
                      isActive
                        ? "bg-white border-indigo-100 shadow-md translate-x-1"
                        : "bg-transparent border-transparent hover:bg-gray-100/50"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm",
                      isActive ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    {!isNavCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-xs truncate mb-0.5">
                          {tp.title || tp.paper?.title || "Test Paper"}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                          <span className="truncate max-w-[80px]">{tp.subject || tp.paper?.subject || "Subject"}</span>
                          <span className="bg-gray-100 px-2 rounded-lg py-0.5 whitespace-nowrap ml-1 font-bold">
                            {tp.created_at ? new Date(tp.created_at).toLocaleDateString() : "Draft"}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                  {!isNavCollapsed && isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTestPaper(tp);
                      }}
                      disabled={deletingId === tpId}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deletingId === tpId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              );
            })}

            {testPapers.length === 0 && !isNavCollapsed && (
              <div className="text-center py-10 border-4 border-dashed border-gray-100 rounded-[2rem]">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-gray-400 tracking-widest">No history logs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Test Paper Form Component ---

function NewTestPaperForm({ onGenerate, data, isLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [formData, setFormData] = useState({
    class: "10",
    subject: "English",
    total_marks: "50",
    duration: "1 hour"
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-400px)] md:min-h-[calc(100vh-80px)] bg-white p-6 md:p-10 overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
            <FileText className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Create Test Paper</h2>
          <p className="text-gray-400 font-bold text-sm tracking-tight">Create professional assessments with automatic weighting and standard alignment.</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Book Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Knowledge Source</label>
              <Select
                value={selectedBook ? JSON.stringify(selectedBook) : undefined}
                onValueChange={(val) => {
                  const book = JSON.parse(val);
                  setSelectedBook(book);
                  setSelectedChapter(null);

                  // Dynamically infer subject from book name if possible
                  if (book.book_name) {
                    const subjects = ["Science", "Mathematics", "Maths", "Physics", "Chemistry", "Biology", "English", "History", "Geography"];
                    const matchedSubject = subjects.find(s =>
                      book.book_name.toLowerCase().includes(s.toLowerCase())
                    );
                    if (matchedSubject) {
                      setFormData(prev => ({ ...prev, subject: matchedSubject === "Maths" ? "Mathematics" : matchedSubject }));
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                  <SelectValue placeholder="Choose a book" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                  {data?.map((book, index) => (
                    <SelectItem key={book.id || index} value={JSON.stringify(book)} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                      {book.book_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Selection */}
            <div className={cn("space-y-2 transition-all", !selectedBook && "opacity-40 pointer-events-none")}>
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Target Chapter</label>
              <Select
                value={selectedChapter || undefined}
                onValueChange={setSelectedChapter}
                disabled={!selectedBook}
              >
                <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                  <SelectValue placeholder="Choose a chapter" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                  {(selectedBook?.chapters || []).map((chapter, index) => (
                    <SelectItem key={index} value={chapter} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                      {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Target Class</label>
              <Select value={formData.class} onValueChange={(v) => handleInputChange("class", v)}>
                <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                  {["5", "6", "7", "8", "9", "10", "11", "12"].map(grade => (
                    <SelectItem key={grade} value={grade} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">Grade {grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marks */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Total Marks</label>
              <Input
                value={formData.total_marks}
                onChange={(e) => handleInputChange("total_marks", e.target.value)}
                placeholder="e.g. 50"
                className="h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus-visible:ring-4 focus-visible:ring-indigo-50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Duration</label>
              <Select value={formData.duration} onValueChange={(v) => handleInputChange("duration", v)}>
                <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                  {["30 mins", "1 hour", "1.5 hours", "2 hours", "3 hours"].map(d => (
                    <SelectItem key={d} value={d} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            disabled={!selectedBook || !selectedChapter || isLoading}
            onClick={() => onGenerate(selectedBook, { ...formData, chapter: selectedChapter })}
            className="w-full h-15 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Standard Test
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Test Paper Display ---

function TestPaperDisplay({ item, onRegenerate, isRegenerating, toggleAnswerKey, showAnswers, answersData, isFetchingAnswers }) {
  const paperData = item.paper || item.content?.paper || item;

  return (
    <div className="flex-1 flex flex-col min-h-[500px] md:h-[calc(100vh-80px)] bg-white relative">
      {/* Upper Info Bar */}
      <div className="px-6 md:px-12 py-6 md:py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20 shadow-sm shadow-gray-50/50">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl md:rounded-[1.5rem] flex-shrink-0 flex items-center justify-center border-2 border-indigo-100 shadow-inner">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight text-xs md:text-sm">
              {paperData.title || item.title || "Generated Assessment"}
            </h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] flex items-center gap-1.5 mt-1">
              <Zap className="w-3 h-3" /> Educational Standard Verified • Class {paperData.class || item.class || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="rounded-[1.2rem] md:rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest h-12 md:h-14 px-4 md:px-8 gap-3 transition-all shadow-md group"
            onClick={toggleAnswerKey}
            disabled={isFetchingAnswers}
          >
            {isFetchingAnswers ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            )}
            {showAnswers ? "Show Questions" : "Answer Key"}
          </Button>
          <Button
            variant="outline"
            className="rounded-[1.2rem] md:rounded-[1.5rem] border-2 font-black uppercase text-[10px] md:text-xs tracking-widest h-12 md:h-14 px-4 md:px-6 hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-8 md:pt-12 pb-24 scrollbar-hide">
        <div className="max-w-6xl mx-auto w-full">
          <TestPaperItem
            item={item}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            showAnswers={showAnswers}
            answersData={answersData}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function TestPaperPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlParamId = searchParams.get("test_paper_id");
  const { setTestPaperStatus } = useApiStore();

  const [selectedTestPaper, setSelectedTestPaper] = useState(null);
  const [testPaperData, setTestPaperData] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const { data: userTestPapers, isLoading: testPapersLoading } = useUserTestPapers(uid, {
    enabled: !!uid,
  });
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Answer Key Fetching (Stage Branch Logic)
  const currentPaperIdForAnswers = useMemo(() => {
    const item = selectedTestPaper || testPaperData;
    if (!item) return null;
    // If the paper is a string (Narrative/Markdown mode), we can't fetch structured answers
    const innerPaper = item?.paper || item?.content?.paper || item?.content || item;
    if (typeof innerPaper === 'string') return null;
    // Check all possible ID locations in the response
    return (
      item?.id || item?.paper_id || item?.test_paper_id ||
      innerPaper?.id || innerPaper?.paper_id || innerPaper?.test_paper_id ||
      null
    );
  }, [selectedTestPaper, testPaperData]);

  const { data: answersData, isLoading: isFetchingAnswers } = useGetTestPaperAnswers(currentPaperIdForAnswers, uid, {
    enabled: showAnswers && !!currentPaperIdForAnswers && !!uid,
  });

  const toggleAnswerKey = useCallback(() => {
    setShowAnswers(prev => !prev);
  }, []);

  // URL Param Sync Logic (Stage Branch)
  useEffect(() => {
    if (urlParamId && userTestPapers?.content && !testPaperData && !selectedTestPaper) {
      const foundPaper = userTestPapers.content.find((tp) => (tp.id === urlParamId || tp.test_paper_id === urlParamId));
      if (foundPaper) {
        setSelectedTestPaper(foundPaper);
      }
    }
  }, [urlParamId, userTestPapers, testPaperData, selectedTestPaper]);

  const { mutate: generateTestPaperMutation, isPending: generatingTestPaper } = useGenerateTestPaper({
    onMutate: () => setTestPaperStatus("loading"),
    onSuccess: (data, variables) => {
      // API might return data differently (nested or direct)
      // Preserve the top-level ID which is required for fetching answers later
      const topLevelId = {
        ...(data.id && { id: data.id }),
        ...(data.paper_id && { paper_id: data.paper_id }),
        ...(data.test_paper_id && { test_paper_id: data.test_paper_id }),
      };

      const testPaperContent = {
        ...(data.test_paper || data.content || data),
        ...topLevelId,
        // Optimistically add context from variables so the sidebar renders immediately with valid info
        subject: data.subject || data.test_paper?.subject || variables.subject,
        chapter: data.chapter || data.test_paper?.chapter || variables.chapter,
        class: data.class || data.test_paper?.class || variables.class,
        title: data.title || data.test_paper?.title || `${variables.subject || "Test Paper"} - ${variables.chapter || "Mixed"}`,
        created_at: data.created_at || data.test_paper?.created_at || new Date().toISOString()
      };

      console.log("✅ Test paper stored with ID:", testPaperContent.id || testPaperContent.paper_id || testPaperContent.test_paper_id);
      setTestPaperData(testPaperContent);
      setSelectedTestPaper(null);
      setTestPaperStatus("success");
      setShowAnswers(false);
      queryClient.setQueryData(["test-papers", uid], (oldData) => {
        if (!oldData) return [testPaperContent]; // Default to simple array

        const newId = testPaperContent.id || testPaperContent.paper_id || testPaperContent.test_paper_id;

        // Handle direct array
        if (Array.isArray(oldData)) {
          const filtered = oldData.filter(item => (item.id || item.paper_id || item.test_paper_id) !== newId);
          return [testPaperContent, ...filtered];
        }

        // Handle wrapped arrays like { content: [...] } or { data: [...] }
        const key = oldData.content !== undefined ? 'content' :
          oldData.data !== undefined ? 'data' :
            oldData.test_papers !== undefined ? 'test_papers' : 'papers';

        const oldArray = Array.isArray(oldData[key]) ? oldData[key] : [];
        const filtered = oldArray.filter(item => (item.id || item.paper_id || item.test_paper_id) !== newId);

        return {
          ...oldData,
          [key]: [testPaperContent, ...filtered]
        };
      });

      // Add a slight delay before invalidation to ensure the backend has finished its background update
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["test-papers", uid],
        });
      }, 1500);
      toast.success("Test paper generated successfully!");
    },
    onError: (err) => {
      setTestPaperStatus("error");
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to generate.";
      toast.error(msg);
    },
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteTestPaper,
    queryKeyToInvalidate: ["test-papers", uid],
    idPropertyName: "test_paper_id", // Stage Branch uses test_paper_id
    onDeleteSuccess: (variables) => {
      setTestPaperStatus("success");
      const deletedId = variables.test_paper_id || variables.paper_id;
      if (selectedTestPaper && (selectedTestPaper.id === deletedId || selectedTestPaper.test_paper_id === deletedId || selectedTestPaper.paper_id === deletedId)) {
        setSelectedTestPaper(null);
      }
      if (uid) {
        queryClient.invalidateQueries({
          queryKey: ["test-papers", uid],
          refetchType: 'all'
        });
      }
    },
  });

  const handleDeleteTestPaper = useCallback((item) => {
    const id = item.test_paper_id || item.paper_id || item.id;
    handleHistoryDelete({ ...item, test_paper_id: id }, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = (book, formData) => {
    if (!book || !formData) return;
    setTestPaperData(null);
    setSelectedTestPaper(null);
    setShowAnswers(false);

    // Robust ID resolution
    const bookId = book.id || book.book_id || book._id;

    generateTestPaperMutation({
      uid: uid,
      book_id: bookId,
      chapter: formData.chapter,
      prompt: `Generate a ${formData.subject || "English"} test paper for Grade ${formData.class} on the topic: ${formData.chapter}. Ensure all questions are relevant to ${formData.subject || "English"}.`,
      topic: `${formData.subject || "English"}: ${formData.chapter}`,
      class: formData.class,
      subject: formData.subject || "English",
      total_marks: parseInt(formData.total_marks),
      duration: formData.duration,
    });
  };

  const handleRegenerate = useCallback((item) => {
    if (!item) return;
    const paperData = item.paper || item.content?.paper || item;
    setTestPaperData(null);
    setShowAnswers(false);
    const bookId = item.book_id || paperData.book_id;

    generateTestPaperMutation({
      uid: uid,
      book_id: bookId,
      chapter: item.chapter || paperData.chapter,
      class: item.class || paperData.class,
      subject: item.subject || paperData.subject,
      total_marks: parseInt(item.total_marks || paperData.total_marks || 50),
      duration: item.duration || paperData.duration || "1 hour",
    });
  }, [uid, generateTestPaperMutation]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-[calc(100vh-80px)] md:overflow-hidden overflow-y-auto">
      <TestPaperSidebar
        userTestPapers={userTestPapers}
        selectedTestPaper={selectedTestPaper}
        setSelectedTestPaper={(tp) => {
          setSelectedTestPaper(tp);
          setTestPaperData(null);
          setShowAnswers(false);
        }}
        onDeleteTestPaper={handleDeleteTestPaper}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => {
          setSelectedTestPaper(null);
          setTestPaperData(null);
          setShowAnswers(false);
        }}
      />

      <div className="flex-1 flex flex-col h-full bg-white transition-all duration-300">
        {generatingTestPaper ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-indigo-50 rounded-[2rem]" />
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-[2rem] border-t-transparent animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Generating Assessment...</h3>
              <p className="text-sm text-gray-400 font-bold tracking-[0.3em]">Aligning standards</p>
            </div>
          </div>
        ) : selectedTestPaper || testPaperData ? (
          <TestPaperDisplay
            item={selectedTestPaper || testPaperData}
            onRegenerate={handleRegenerate}
            isRegenerating={generatingTestPaper}
            toggleAnswerKey={toggleAnswerKey}
            showAnswers={showAnswers}
            answersData={answersData}
            isFetchingAnswers={isFetchingAnswers}
          />
        ) : bookLoading || testPapersLoading ? (
          <div className="flex-1 flex items-center justify-center font-black text-xs text-gray-300 uppercase tracking-widest">
            Fetching Library...
          </div>
        ) : (
          <NewTestPaperForm
            onGenerate={handleGenerate}
            data={bookData?.content}
            isLoading={generatingTestPaper}
          />
        )}
      </div>
    </div>
  );
}
