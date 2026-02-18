import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  FileText,
  MousePointer2
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const LessonPlanItem = ({ item, isgenrated = false }) => {
  // Robust data extraction
  const lesson_plan = item?.content?.lesson_plan ||
    (item?.activities ? item : null) ||
    item?.lesson_plan ||
    (isgenrated ? item : null);

  if (!lesson_plan) return null;

  const handleExport = () => {
    window.print();
  };

  // Helper for activity styling matching the screenshot
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-slate-800">

      {/* Subject Header Pill */}
      <div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          {lesson_plan.subject || "Subject"}
        </span>
      </div>

      {/* Top Grid: Goals & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Curriculum Goals Card */}
        <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">Curriculum Goals</h3>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>Target Grade: {lesson_plan.grade_level}</span>
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <span>Duration: {lesson_plan.duration}</span>
            </li>
            {Array.isArray(lesson_plan.key_vocabulary) && lesson_plan.key_vocabulary.map((vocab, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                <span>Vocabulary: {vocab?.toString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Learning Objectives Card */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-900">Learning Objectives</h3>
          </div>

          <ul className="space-y-5">
            {Array.isArray(lesson_plan.learning_objectives) && lesson_plan.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Class Structure Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-lg text-slate-900">Class Structure & Teaching Flow</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.isArray(lesson_plan.activities) && lesson_plan.activities.map((activity, idx) => {
            const config = getActivityConfig(idx);
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all flex flex-col h-full">
                {/* Pill */}
                <div className="mb-4">
                  <span className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase",
                    config.pillColor
                  )}>
                    {config.label}
                  </span>
                </div>

                {/* Title */}
                <h4 className={cn("font-bold text-base mb-3 leading-snug", config.titleColor)}>
                  {activity.activity_name}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 flex-1">
                  {activity.description}
                </p>

                {/* Footer Time */}
                <div className="mt-auto pt-4 border-t border-slate-50 text-xs font-semibold text-slate-400">
                  {activity.duration}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default LessonPlanItem;
