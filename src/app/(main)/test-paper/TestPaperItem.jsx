"use client";

import React, { useMemo } from "react";
import {
    Download,
    Sparkles,
    GraduationCap,
    BookOpen,
    Zap,
    Clock,
    FileText,
    Printer,
    FileCheck,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

const Tag = ({ children, icon: Icon, color = "indigo" }) => {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };

    return (
        <span className={cn("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm", colorClasses[color])}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};

const TestPaperItem = ({ item, onRegenerate, isRegenerating, showAnswers, answersData }) => {
    if (!item) return null;

    // Robust data extraction (Stage Branch Logic integrated into Premium UI)
    const paperData = item.paper || item.content?.paper || item;
    const sections = item.sections || item.content?.sections || [];

    const questions = useMemo(() => {
        // Priority 1: Direct questions array
        if (item.questions) return item.questions;
        if (item.content?.questions) return item.content.questions;

        // Priority 2: Sections array (Stage Branch Pattern)
        if (sections.length > 0) {
            return sections.flatMap(section =>
                Array.isArray(section.questions) ? section.questions : []
            );
        }

        return [];
    }, [item, sections]);

    // Robust raw content extraction for fallback
    const rawContent = useMemo(() => {
        const raw = item?.paper || item?.content?.paper || item?.content || item;
        if (typeof raw === 'string') return raw;
        if (typeof raw?.paper === 'string') return raw.paper;
        return null;
    }, [item]);

    // Map answers to questions if answersData is available (Stage Branch Logic)
    const questionsWithAnswers = useMemo(() => {
        if (!showAnswers || !answersData) return questions;

        const answers = answersData.answer_key || answersData.content?.answer_key || [];
        return questions.map((q, idx) => {
            // Find matching answer by index or question text if possible
            const answer = answers[idx] || {};
            return { ...q, ...answer };
        });
    }, [questions, showAnswers, answersData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Premium Header Card */}
            <div className="rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-sm overflow-hidden p-8 md:p-10 flex flex-col md:flex-row items-start justify-between gap-6 print:hidden">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            {showAnswers ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {showAnswers ? "Assessment Answer Key" : (paperData.title || item.title || "Standard Assessment")}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Tag icon={GraduationCap} color="indigo">Class {paperData.class || item.class || "N/A"}</Tag>
                        <Tag icon={BookOpen} color="purple">{paperData.subject || item.subject || "Subject"}</Tag>
                        <Tag icon={Zap} color="blue">{paperData.total_marks || item.total_marks || "0"} Marks</Tag>
                        <Tag icon={Clock} color="emerald">{paperData.duration || item.duration || "N/A"}</Tag>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onRegenerate && onRegenerate(item)}
                        disabled={isRegenerating}
                        className="flex-1 md:flex-none rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest gap-2 px-6 py-6 h-auto hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                    >
                        {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Regenerate
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="flex-1 md:flex-none rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 px-6 py-6 h-auto shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 md:p-12 shadow-sm space-y-12">

                {/* Assessment Identification Box */}
                <div className="rounded-3xl border-2 border-indigo-50 p-8 md:p-10 bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/20 rounded-full blur-2xl -ml-10 -mb-10" />

                    <h3 className="text-center font-black text-xl md:text-2xl text-gray-900 mb-8 uppercase tracking-[0.15em] border-b-2 border-indigo-100 pb-6">
                        {showAnswers ? "Model Content Solution Key" : (paperData.title || "Assessment Sheet")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm relative z-10">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Name</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-bold text-gray-400 italic">Student's Full Name</div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Class/Section</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-black text-indigo-900">
                                Class {paperData.class || item.class || "____"}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Subject</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-black text-indigo-900">
                                {paperData.subject || item.subject || "English"}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Identification</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-bold text-gray-400 italic">Roll No: ________</div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Assessment Date</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-black text-indigo-900">
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Max Score</span>
                            <div className="h-10 border-b-2 border-indigo-100 flex items-end pb-1 font-black text-indigo-900">
                                {paperData.total_marks || item.total_marks || "50"} Points
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Header */}
                <div className="flex items-center gap-4 border-b border-gray-50 pb-8 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        {showAnswers ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 tracking-[0.2em] text-xs uppercase">
                            {showAnswers ? "Validation Reference" : "Instructional Content"}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tight">
                            {showAnswers ? "Verified correct answers for this assessment." : "Attempt all questions systematically."}
                        </p>
                    </div>
                </div>

                {questionsWithAnswers.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FileText className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-gray-400">Questions are being assembled...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {questionsWithAnswers.map((question, index) => (
                            <div key={index} className="group relative pl-12 md:pl-20 border-b border-gray-50 pb-12 last:border-0 last:pb-0">
                                {/* Question Badge */}
                                <div className="absolute left-0 top-0 w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm md:text-xl shadow-inner transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:scale-110">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="prose prose-slate max-w-none text-gray-800 font-bold text-lg md:text-xl leading-relaxed mb-8">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {question.question_text || question.question || question.text || "Question content missing."}
                                        </ReactMarkdown>
                                    </div>

                                    {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                            {question.options.map((option, optIndex) => (
                                                <div key={optIndex} className={cn(
                                                    "flex gap-4 p-4 md:p-5 rounded-[1.5rem] border-2 transition-all shadow-sm",
                                                    showAnswers && (option === question.correct_answer || option === question.answer)
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : "bg-gray-50 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md group/opt"
                                                )}>
                                                    <span className={cn(
                                                        "flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl border-2 flex items-center justify-center text-xs md:text-sm font-black",
                                                        showAnswers && (option === question.correct_answer || option === question.answer)
                                                            ? "bg-emerald-600 text-white border-emerald-600"
                                                            : "bg-white border-gray-100 text-gray-400 group-hover/opt:text-indigo-600 group-hover/opt:border-indigo-100"
                                                    )}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <p className={cn(
                                                        "text-sm md:text-base font-bold transition-colors py-2",
                                                        showAnswers && (option === question.correct_answer || option === question.answer)
                                                            ? "text-emerald-900"
                                                            : "text-gray-600 group-hover/opt:text-gray-900"
                                                    )}>{option}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Answer Section (if showAnswers is true) */}
                                    {showAnswers && (question.answer || (!question.options && question.correct_answer)) && (
                                        <div className="mt-8 p-6 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Verified Answer</span>
                                            </div>
                                            <div className="prose prose-sm max-w-none text-indigo-900 font-bold">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {question.answer || question.correct_answer}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50/50 w-fit border border-indigo-100/50">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500">Weightage</span>
                                        <span className="text-sm font-black text-indigo-900">{question.marks || "1"} Point{question.marks !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Narrative View Fallback */}
                {(questions.length === 0 && rawContent) && (
                    <div className="mt-12 pt-12 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 tracking-[0.2em] text-xs uppercase">Assessment Content</h3>
                                <p className="text-[10px] font-bold text-indigo-500 font-black uppercase tracking-widest mt-0.5">Narrative View</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-2 border-indigo-50 shadow-inner prose prose-indigo max-w-none prose-headings:font-black prose-p:font-bold prose-p:text-slate-600">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {rawContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestPaperItem;
