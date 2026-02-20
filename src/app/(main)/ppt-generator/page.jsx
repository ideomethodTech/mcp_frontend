'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Presentation,
  Loader2,
  Download,
  BookOpen,
  Plus,
  Layers,
  Palette,
  FileType,
  Search,
  ChevronsLeft,
  Clock,
  Trash2,
  Sparkles,
  Zap,
  Printer,
  Airplay
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useGetBook } from "@/lib/api/queries";

// --- UI Components ---

const Tag = ({ children, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm", colorClasses[color])}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

// --- PPT Sidebar ---

const PptSidebar = ({
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
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300",
      "w-full md:h-[calc(100vh-80px)]",
      isNavCollapsed ? "md:w-20" : "md:w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-black text-gray-700 tracking-tight text-lg">Presentations</h2>}
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
          {!isNavCollapsed && "New Presentation"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {!isNavCollapsed && selectedItem && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 tracking-widest px-1">Selected Draft</p>
            <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
              <p className="font-bold text-indigo-900 text-sm line-clamp-2">
                {selectedItem.title}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-600 tracking-tight">Active Preview</span>
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
              <div key={item.id || index} className="group relative flex items-center gap-2">
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
                    <Presentation className="w-5 h-5" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate mb-0.5">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                        <span className="truncate max-w-[80px]">{item.book_name || "Library"}</span>
                        <span className="bg-gray-100 px-2 rounded-lg py-0.5 whitespace-nowrap ml-1 font-bold">
                          {item.created_at ? format(new Date(item.created_at), 'dd/MM') : '—'}
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
            {!isNavCollapsed && historyData.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No history found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PPT Details ---

function PptDetails({ item }) {
  const handleDownload = () => {
    toast.success("Presentation ready for download!");
    window.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Premium Header Card */}
      <div className="rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-sm overflow-hidden p-6 md:p-10 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-4 md:space-y-6 flex-1">
          <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {item.title}
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Tag icon={Layers} color="indigo">{item.slides} Slides</Tag>
            <Tag icon={Palette} color="purple">{item.details?.theme || 'Default'}</Tag>
            <Tag icon={FileType} color="emerald">PPTX</Tag>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          className="w-full md:w-auto rounded-[1.2rem] md:rounded-[1.5rem] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest gap-2 px-6 md:px-8 py-5 md:py-7 hover:opacity-90 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5" />
          Download PPTX
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Grid */}
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <div className="rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 bg-white p-6 md:p-10 shadow-sm space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4 md:pb-6">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
              <h3 className="font-black text-gray-900 tracking-widest text-xs md:text-sm">Presentation Insights</h3>
            </div>

            <div className="space-y-6 text-gray-600 font-bold leading-relaxed">
              <p>{item.details?.subtitle}</p>
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-400 space-y-2">
                <p className="flex justify-between"><span>Generated:</span> <span className="text-gray-900">{item.created_at ? format(new Date(item.created_at), 'PPPP') : '—'}</span></p>
                <p className="flex justify-between"><span>Source Artifact:</span> <span className="text-gray-900">{item.details?.filename}</span></p>
                <p className="flex justify-between"><span>Engine Version:</span> <span className="text-gray-900">EduPresenter v2.1 (Stability Mode)</span></p>
              </div>
            </div>

            <div className="pt-8">
              <h4 className="font-black text-gray-900 tracking-widest text-[10px] mb-6 pl-1">Dynamic Preview</h4>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Presentation, title: "Title Slide", desc: "Introduction & Context" },
                  { icon: Layers, title: "Structured Content", desc: "Main concepts visual" },
                  { icon: FileType, title: "Deep Analysis", desc: "Evidence-based slides" },
                  { icon: Palette, title: "Conclusion", desc: "Summary & Insights" }
                ].map((slide, i) => (
                  <div key={i} className="group p-5 rounded-[1.5rem] border-2 border-transparent bg-gray-50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer">
                    <div className="aspect-[16/9] bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl mb-4 flex items-center justify-center border border-indigo-100 transition-transform group-hover:scale-105">
                      <slide.icon className="w-8 h-8 text-indigo-300" />
                    </div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight mb-1">{slide.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{slide.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Airplay className="w-8 h-8" />
            </div>
            <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Live Presentation</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-normal mb-6">Host a live session directly from your browser with built-in tools.</p>
            <Button variant="outline" className="w-full rounded-xl border-2 font-black text-xs uppercase tracking-widest py-6">Enter Stage Mode</Button>
          </div>

          <div className="rounded-[2rem] border-2 border-dashed border-gray-100 p-8 text-center bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Export Options</p>
            <div className="space-y-3">
              <button className="w-full py-3 text-[10px] font-black text-gray-400 uppercase hover:text-indigo-600 transition-colors">Export as PDF</button>
              <button className="w-full py-3 text-[10px] font-black text-gray-400 uppercase hover:text-indigo-600 transition-colors">High-Res Images</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- New PPT Form ---

function NewPptForm({ onGenerate, isLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const booksQuery = useGetBook();
  const books = booksQuery.data?.content || [];
  const currentBook = books.find(b => b.book_name === selectedBook);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-400px)] md:h-[calc(100vh-80px)] bg-white p-6 md:p-10">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Presentation className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Create Presentation</h2>
          <p className="text-gray-400 font-bold text-sm tracking-tight">Convert chapters into high-impact, professional slide decks automatically.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-3 block pl-1">Knowledge Source</label>
            <Select
              onValueChange={(val) => {
                setSelectedBook(val);
                setSelectedChapter(null);
              }}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder={booksQuery.isLoading ? "Loading books..." : "Choose a book"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                {books.map((book, index) => (
                  <SelectItem key={book.id || index} value={book.book_name} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(
            "transition-all duration-300",
            selectedBook ? "opacity-100" : "opacity-40 pointer-events-none"
          )}>
            <label className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-3 block pl-1">Focus Chapter</label>
            <Select
              value={selectedChapter || undefined}
              onValueChange={setSelectedChapter}
              disabled={!selectedBook}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2 font-bold">
                {currentBook?.chapters?.map((chapter, index) => (
                  <SelectItem key={index} value={chapter} className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600">
                    {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!selectedBook || !selectedChapter || isLoading}
            onClick={() => onGenerate(selectedBook, selectedChapter)}
            className="w-full h-15 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Craft Visual Narrative
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function PptGeneratorPage() {
  const [selectedPpt, setSelectedPpt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ppt_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse PPT history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ppt_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = (book, chapter) => {
    setIsLoading(true);
    setSelectedPpt(null);

    // Simulate API delay
    setTimeout(() => {
      const newPpt = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${chapter} Deck`,
        slides: Math.floor(Math.random() * 8) + 10,
        created_at: new Date().toISOString(),
        book_name: book,
        details: {
          subtitle: `Automated visual summary of ${chapter}.`,
          author: 'Epoch AI Generated Presentation',
          theme: 'Modern Educational',
          filename: `Presentation_${Date.now()}.pptx`,
        },
      };
      setHistory(prev => [newPpt, ...prev]);
      setSelectedPpt(newPpt);
      setIsLoading(false);
      toast.success("Presentation generated successfully!");
    }, 2500);
  };

  const handleDeletePpt = useCallback((item) => {
    setDeletingId(item.id);
    setTimeout(() => {
      setHistory(prev => prev.filter(p => p.id !== item.id));
      if (selectedPpt?.id === item.id) setSelectedPpt(null);
      setDeletingId(null);
      toast.success("Presentation removed.");
    }, 600);
  }, [selectedPpt]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-[calc(100vh-80px)] md:overflow-hidden overflow-y-auto">
      <PptSidebar
        historyData={history}
        selectedItem={selectedPpt}
        setSelectedItem={setSelectedPpt}
        onDelete={handleDeletePpt}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => setSelectedPpt(null)}
      />

      <div className="flex-1 flex flex-col h-full bg-white transition-all duration-300">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-indigo-50 rounded-[2rem]" />
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-[2rem] border-t-transparent animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Assembling Deck...</h3>
              <p className="text-sm text-gray-400 font-bold tracking-[0.3em]">Curating visual elements</p>
            </div>
          </div>
        ) : selectedPpt ? (
          <div className="flex-1 flex flex-col min-h-[500px] md:h-full bg-white relative">
            {/* Upper Info Bar */}
            <div className="px-6 md:px-12 py-4 md:py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20 shadow-sm shadow-gray-50/50">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl md:rounded-[1.5rem] flex-shrink-0 flex items-center justify-center border-2 border-indigo-100 shadow-inner">
                  <Presentation className="w-5 h-5 md:w-7 md:h-7 text-indigo-500" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 tracking-tight text-xs md:text-sm">
                    {selectedPpt.title}
                  </h2>
                  <p className="text-[9px] md:text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-1 mt-1">
                    <Airplay className="w-2.5 h-2.5 md:w-3 md:h-3" /> Multi-Slide Presentation
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-6 md:pt-12 pb-24 scrollbar-hide">
              <div className="max-w-6xl mx-auto w-full">
                <PptDetails item={selectedPpt} />
              </div>
            </div>
          </div>
        ) : (
          <NewPptForm onGenerate={handleGenerate} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
