'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  FileText,
  Loader2,
  Plus,
  Search,
  ChevronsLeft,
  Clock,
  Trash2,
  Sparkles,
  ChevronDown,
  Printer,
  Download,
  BookOpen,
  GraduationCap,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateTestPaper, useGetBook, useUserTestPapers } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { toast } from "react-toastify";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

// --- UI Components ---

const Tag = ({ children, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm", colorClasses[color])}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

// --- Test Paper Item Component ---

const TestPaperItem = ({ item, onRegenerate, isRegenerating }) => {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header Card */}
      <div className="rounded-[2rem] border-2 border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-8 flex items-start justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {item.title || "Standard Assessment"}
            </h2>

            <div className="flex flex-wrap gap-3">
              <Tag icon={GraduationCap} color="indigo">Class {item.class}</Tag>
              <Tag icon={BookOpen} color="purple">{item.subject}</Tag>
              <Tag icon={Zap} color="blue">{item.total_marks} Marks</Tag>
              <Tag icon={Clock} color="emerald">{item.duration}</Tag>
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onRegenerate && onRegenerate(item)}
              disabled={isRegenerating}
              className="rounded-xl border-2 font-bold gap-2 px-6 py-7 hover:bg-gray-50 shadow-sm"
            >
              {isRegenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrint}
              className="rounded-xl border-2 font-bold gap-2 px-6 py-7 hover:bg-gray-50 shadow-sm"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm space-y-12">
        {item.questions?.map((question, index) => (
          <div key={index} className="group relative pl-16 last:border-0 border-b border-gray-50 pb-12 last:pb-0">
            {/* Question Badge */}
            <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-[#6366f1] font-black text-lg shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:scale-110">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="prose prose-sm max-w-none text-gray-900 font-bold text-xl leading-relaxed mb-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question.question}
                </ReactMarkdown>
              </div>

              {question.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm hover:shadow-md group/opt">
                      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border-2 border-gray-100 flex items-center justify-center text-sm font-black text-gray-400 group-hover/opt:text-indigo-600 group-hover/opt:border-indigo-100 group-hover/opt:shadow-sm">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <p className="text-base font-bold text-gray-600 group-hover/opt:text-gray-900 transition-colors py-2">{option}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-50/50 w-fit border border-indigo-100/50">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Allocation</span>
                <span className="text-base font-black text-indigo-900">{question.marks || "1"} Mark</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Test Paper Sidebar ---

const TestPaperSidebar = ({
  userTestPapers,
  selectedTestPaper,
  setSelectedTestPaper,
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
                {selectedTestPaper.title || "Standard Test Paper"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-600 tracking-tight">Active View</span>
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
            {(userTestPapers?.content || []).map((tp, index) => (
              <div key={tp.id || index} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedTestPaper(tp)}
                  className={cn(
                    "flex-1 text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 border-2",
                    selectedTestPaper?.id === tp.id
                      ? "bg-white border-indigo-100 shadow-md translate-x-1"
                      : "bg-transparent border-transparent hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm",
                    selectedTestPaper?.id === tp.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate mb-0.5">
                        {tp.title || "Test Paper"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                        <span className="truncate max-w-[80px]">{tp.subject || "Subject"}</span>
                        <span className="bg-gray-100 px-2 rounded-lg py-0.5 whitespace-nowrap ml-1 font-bold">
                          {tp.created_at ? new Date(tp.created_at).toLocaleDateString() : "Draft"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}

            {(userTestPapers?.content || []).length === 0 && !isNavCollapsed && (
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
    subject: "Science",
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

            {/* Subject Input (Selective) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-2 block pl-1">Major Subject</label>
              <Select value={formData.subject} onValueChange={(v) => handleInputChange("subject", v)}>
                <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                  {["Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography"].map(sub => (
                    <SelectItem key={sub} value={sub} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

function TestPaperDisplay({ item, onRegenerate, isRegenerating }) {
  return (
    <div className="flex-1 flex flex-col min-h-[500px] md:h-[calc(100vh-80px)] bg-white relative">
      {/* Upper Info Bar */}
      <div className="px-12 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20 shadow-sm shadow-gray-50/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center border-2 border-indigo-100 shadow-inner">
            <Sparkles className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight text-sm">
              {item.title || "Generated Assessment"}
            </h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] flex items-center gap-1.5 mt-1">
              <Zap className="w-3 h-3" /> Educational Standard Verified • Class {item.class}
            </p>
          </div>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-10 md:pt-12 pb-24 scrollbar-hide">
        <div className="max-w-5xl mx-auto w-full">
          <TestPaperItem
            item={item}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
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
  const { setTestPaperStatus } = useApiStore();

  const [selectedTestPaper, setSelectedTestPaper] = useState(null);
  const [testPaperData, setTestPaperData] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const { data: userTestPapers, isLoading: testPapersLoading } = useUserTestPapers(uid);
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  const { mutate: generateTestPaperMutation, isPending: generatingTestPaper } = useGenerateTestPaper({
    onMutate: () => setTestPaperStatus("loading"),
    onSuccess: (data) => {
      setTestPaperData(data.test_paper || data);
      setSelectedTestPaper(null);
      setTestPaperStatus("success");
      queryClient.invalidateQueries({ queryKey: ["test-papers", uid] });
      toast.success("Test paper generated successfully!");
    },
    onError: (err) => {
      setTestPaperStatus("error");
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to generate test paper.";
      toast.error(msg);
    },
  });

  const handleGenerate = (book, formData) => {
    if (!book || !formData) return;
    setTestPaperData(null);
    setSelectedTestPaper(null);
    generateTestPaperMutation({
      uid: uid,
      book_id: book.id,
      chapter: formData.chapter,
      class: formData.class,
      subject: formData.subject,
      total_marks: parseInt(formData.total_marks),
      duration: formData.duration,
    });
  };

  const handleRegenerate = useCallback((item) => {
    if (!item) return;
    setTestPaperData(null);
    generateTestPaperMutation({
      uid: uid,
      book_id: item.book_id,
      chapter: item.chapter,
      class: item.class,
      subject: item.subject,
      total_marks: parseInt(item.total_marks),
      duration: item.duration,
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
        }}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => {
          setSelectedTestPaper(null);
          setTestPaperData(null);
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
          />
        ) : bookLoading ? (
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
