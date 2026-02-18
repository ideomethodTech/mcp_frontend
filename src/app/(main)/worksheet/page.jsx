"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileText, Loader2, BookOpen, Search, Zap, SlidersHorizontal,
  ArrowLeft, Plus, ChevronDown, CheckCircle2, ChevronRight, Minus, FileBox, LayoutList, GripVertical, ChevronsLeft, Trash2, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import WorksheetItem from "./WorksheetItem";
import { useQueryClient } from "@tanstack/react-query";
import { useUserWorksheet, useGetBook, useGenerateWorksheet, useDeleteWorksheet } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import useApiStore from "@/store/useApiStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHistoryDelete } from '@/hooks/use-history-delete';

// --- Sidebar Component ---

const WorksheetSidebar = ({
  userWorksheets,
  selectedWorksheet,
  setSelectedWorksheet,
  onDeleteWorksheet,
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
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight">Worksheets</h2>}
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
          {!isNavCollapsed && "New Worksheet"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {/* Active Worksheet Section */}
        {!isNavCollapsed && selectedWorksheet && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest px-1">Active Item</p>
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm transition-all animate-in fade-in slide-in-from-left-2 transition-all">
              <p className="font-bold text-indigo-900 text-sm line-clamp-1">
                {selectedWorksheet.title || selectedWorksheet.chapter || "Worksheet"}
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
            {(userWorksheets?.content || []).map((ws, index) => (
              <div key={ws.id || `worksheet-${index}`} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedWorksheet(ws)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-xl transition-all flex items-center gap-3",
                    selectedWorksheet?.id === ws.id
                      ? "bg-white border border-gray-100 shadow-sm"
                      : "hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedWorksheet?.id === ws.id ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                  )}>
                    <FileText className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-700 text-xs truncate mb-0.5">
                        {ws.title || ws.chapter || "Worksheet"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                        <span className="truncate max-w-[100px]">{ws.book || "Book"}</span>
                        <span className="bg-gray-100 px-1.5 rounded-full py-0.5 uppercase tracking-tighter whitespace-nowrap ml-1 font-bold">
                          {new Date(ws.created_at).toLocaleDateString() || "Recent"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
                {!isNavCollapsed && selectedWorksheet?.id === ws.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWorksheet(ws);
                    }}
                    disabled={deletingId === ws.id}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingId === ws.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ))}

            {(userWorksheets?.content || []).length === 0 && !isNavCollapsed && (
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

// --- New Worksheet Form Component ---

function NewWorksheetForm({ onGenerate, data, isLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-80px)] bg-white p-10">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Create Worksheet</h2>
          <p className="text-gray-400 font-medium">Select a book and chapter to generate a comprehensive, standard-aligned worksheet.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block pl-1">Knowledge Base</label>
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
                  <SelectItem
                    key={book.id || index}
                    value={JSON.stringify(book)}
                    className="rounded-xl py-3 px-4"
                  >
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
            <label className="text-sm font-bold text-gray-700 mb-2 block pl-1">Chapter Target</label>
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
                  <SelectItem
                    key={index}
                    value={chapter}
                    className="rounded-xl py-3 px-4"
                  >
                    {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!selectedBook || !selectedChapter || isLoading}
            onClick={() => onGenerate(selectedBook, selectedChapter)}
            className="w-full h-15 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Worksheet
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Worksheet Display Container ---

function WorksheetDisplay({ item, bookId, isNew, worksheetId, onRegenerate, isRegenerating }) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-white relative">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 scrollbar-hide">
        <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
          <WorksheetItem
            item={item}
            bookId={bookId}
            isNew={isNew}
            worksheetId={worksheetId}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function WorksheetPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();
  const { setWorksheetStatus } = useApiStore();

  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [worksheetData, setWorksheetData] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isNewWorksheet, setIsNewWorksheet] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [currentWorksheetId, setCurrentWorksheetId] = useState(null);

  // API Queries
  const { data: userWorksheets, isLoading: worksheetsLoading } = useUserWorksheet(uid);
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Mutations
  const { mutate: generateWorksheet, isPending: isGenerating } = useGenerateWorksheet({
    onMutate: () => setWorksheetStatus("loading"),
    onSuccess: (data) => {
      setWorksheetData(data.worksheet);
      setCurrentWorksheetId(data.worksheet_id);
      setSelectedWorksheet(null);
      setIsNewWorksheet(true);
      setWorksheetStatus("success");
      queryClient.invalidateQueries({ queryKey: ["ws", uid] });
      toast.success("Worksheet crafted successfully!");
    },
    onError: (err) => {
      setWorksheetStatus("error");
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to generate worksheet.";
      toast.error(msg);
    }
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteWorksheet,
    queryKeyToInvalidate: ['ws', uid],
    idPropertyName: 'worksheet_id',
    onDeleteSuccess: (variables) => {
      if (selectedWorksheet?.id === variables.worksheet_id) {
        setSelectedWorksheet(null);
      }
    }
  });

  const handleDeleteWS = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  const handleGenerate = useCallback((book, chapter) => {
    if (!book) return;

    setSelectedWorksheet(null);
    setWorksheetData(null);
    setSelectedBookId(book.id);

    generateWorksheet({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
    });
  }, [uid, generateWorksheet]);

  const handleRegenerate = useCallback((bookId, chapter) => {
    generateWorksheet({
      book_id: bookId,
      chapter: chapter,
      uid: uid,
    });
  }, [uid, generateWorksheet]);

  return (
    <div className="flex bg-white h-[calc(100vh-80px)] overflow-hidden">
      <WorksheetSidebar
        userWorksheets={userWorksheets}
        selectedWorksheet={selectedWorksheet}
        setSelectedWorksheet={(ws) => {
          setSelectedWorksheet(ws);
          setWorksheetData(null);
          setIsNewWorksheet(false);
        }}
        onDeleteWorksheet={handleDeleteWS}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => {
          setSelectedWorksheet(null);
          setWorksheetData(null);
        }}
      />

      <div className="flex-1 flex flex-col h-full bg-white transition-all duration-300">
        {isGenerating || (worksheetsLoading && (userWorksheets?.content || []).length === 0) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-indigo-50 rounded-[2rem]" />
                <div className="absolute inset-0 border-8 border-indigo-600 rounded-[2rem] border-t-transparent animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Crafting Worksheet...</h3>
              <p className="text-sm text-gray-400 font-bold tracking-[0.3em]">Building assessments</p>
            </div>
          </div>
        ) : selectedWorksheet ? (
          <WorksheetDisplay
            item={selectedWorksheet}
            bookId={selectedWorksheet.book_id}
            isNew={false}
            worksheetId={selectedWorksheet.id}
            onRegenerate={handleRegenerate}
            isRegenerating={isGenerating}
          />
        ) : worksheetData ? (
          <WorksheetDisplay
            item={worksheetData}
            bookId={selectedBookId}
            isNew={true}
            worksheetId={currentWorksheetId}
            onRegenerate={handleRegenerate}
            isRegenerating={isGenerating}
          />
        ) : bookLoading ? (
          <div className="flex-1 flex items-center justify-center font-black text-xs text-gray-300 uppercase tracking-widest">
            Syncing Library...
          </div>
        ) : (
          <NewWorksheetForm
            onGenerate={handleGenerate}
            data={bookData?.content}
            isLoading={isGenerating}
          />
        )}
      </div>
    </div>
  );
}
