import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  FileText,
  MousePointer2,
  GraduationCap,
  Sparkles,
  Users,
  Lightbulb,
  ListChecks,
  Package,
} from "lucide-react";
import React, { useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

/* ------------------ UI Components ------------------ */

const Tag = ({ children, className }) => (
  <span className={cn(
    "px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center gap-2",
    className
  )}>
    {children}
  </span>
);

/* ------------------ Main Component ------------------ */

const LessonPlanItem = ({ item, isgenrated = false }) => {
  // Robust data extraction
  const rawData = isgenrated
    ? (item?.lesson_plan || item?.content?.lesson_plan || item)
    : (item?.content?.lesson_plan || item?.lesson_plan || item);

  // Determine if we have a string (Markdown) or an object (Structured)
  const lesson_plan = useMemo(() => {
    if (!rawData) return null;
    if (typeof rawData === 'string') {
      return {
        isMarkdown: true,
        rawContent: rawData,
        title: item?.title || item?.chapter || "Lesson Plan",
        grade_level: item?.grade_level || "N/A",
        duration: item?.duration || "N/A",
      };
    }
    return rawData;
  }, [rawData, item]);

  if (!lesson_plan || typeof lesson_plan !== 'object') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic border border-dashed rounded-3xl border-slate-200 bg-slate-50">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p className="font-bold">No lesson plan data available.</p>
      </div>
    );
  }

  const handleExport = () => {
    window.print();
  };

  // Helper for activity styling
  const getActivityConfig = (index) => {
    const configs = [
      {
        label: "INTRODUCTION",
        pillColor: "bg-[#E0E7FF] text-[#4338ca]", // Indigo
        titleColor: "text-[#1e1b4b]"
      },
      {
        label: "EXPLORATION",
        pillColor: "bg-[#FFEDD5] text-[#c2410c]", // Orange
        titleColor: "text-[#431407]"
      },
      {
        label: "CONCLUSION",
        pillColor: "bg-[#E0F2FE] text-[#0369a1]", // Sky Blue
        titleColor: "text-[#0c4a6e]"
      },
      {
        label: "ACTIVITY",
        pillColor: "bg-[#DCFCE7] text-[#15803d]", // Green
        titleColor: "text-[#052e16]"
      }
    ];
    return configs[index % configs.length];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 font-sans text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {lesson_plan.title || "Lesson Assessment"}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Tag>
              <BookOpen className="w-4 h-4" />
              {lesson_plan.subject || "Subject"}
            </Tag>
            <Tag className="bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-4 h-4" />
              {lesson_plan.grade_level || "Grade"}
            </Tag>
            <Tag className="bg-slate-100 text-slate-600">
              <Clock className="w-4 h-4" />
              {lesson_plan.duration || "Duration"}
            </Tag>
          </div>
        </div>

        <Button
          onClick={handleExport}
          className="print:hidden h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <FileText className="w-5 h-5" />
          EXPORT TO PDF
        </Button>
      </div>

      {/* Top Grid: Goals & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Curriculum Goals Card */}
        <div className="bg-[#F8FAFC] rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">Curriculum Scope</h3>
          </div>

          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Target Level: {lesson_plan.grade_level}</span>
            </li>
            <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Timeframe: {lesson_plan.duration}</span>
            </li>
            {Array.isArray(lesson_plan.key_vocabulary) && lesson_plan.key_vocabulary.length > 0 && (
              <li className="space-y-3">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Key Vocabulary</span>
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  {lesson_plan.key_vocabulary.map((vocab, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white border border-slate-100 text-xs font-bold text-slate-500 shadow-sm">
                      {vocab}
                    </span>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Learning Objectives Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">Competency Goals</h3>
          </div>

          <ul className="space-y-5">
            {Array.isArray(lesson_plan.learning_objectives) && lesson_plan.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Class Structure Section */}
      <div className="pt-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="font-bold text-xl text-slate-900 tracking-tight">Instructional Flow</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.isArray(lesson_plan.activities) && lesson_plan.activities.map((activity, idx) => {
            const config = getActivityConfig(idx);
            return (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col h-full group">
                <div className="mb-6">
                  <span className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase shadow-sm",
                    config.pillColor
                  )}>
                    {config.label}
                  </span>
                </div>

                <h4 className={cn("font-black text-lg mb-4 leading-snug group-hover:text-indigo-600 transition-colors", config.titleColor)}>
                  {activity.activity_name}
                </h4>

                <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8 flex-1">
                  {activity.description}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {activity.duration}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <MousePointer2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment & Strategies Grid (Hybrid integration) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 pb-12">
        {/* Inclusion Supports */}
        <div className="lg:col-span-2 bg-[#F1F5F9] rounded-[2rem] p-8 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">Differentiation & Supports</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Track</h4>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {Array.isArray(lesson_plan.differentiation_strategies?.for_advanced_students)
                  ? lesson_plan.differentiation_strategies.for_advanced_students.join(". ")
                  : "Personalized challenging tasks."}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Support Track</h4>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {Array.isArray(lesson_plan.differentiation_strategies?.for_struggling_students)
                  ? lesson_plan.differentiation_strategies.for_struggling_students.join(". ")
                  : "Scaffolded activities and visual aids."}
              </p>
            </div>
          </div>
        </div>

        {/* Homework Section */}
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl tracking-tight">Homework</h3>
            </div>
            <p className="text-indigo-50 font-bold text-lg leading-relaxed italic">
              "{lesson_plan.homework_assignment || "Research the key theme discussed today in your local context."}"
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 opacity-60">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Independent Study • Extension</span>
          </div>
        </div>
      </div>

      {/* Narrative Section - Always shown if Markdown is detected */}
      {lesson_plan.isMarkdown && (
        <div className="pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">Full Lesson Narrative</h3>
          </div>
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm prose prose-indigo max-w-none prose-headings:font-black prose-p:font-bold prose-p:text-slate-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson_plan.rawContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanItem;
