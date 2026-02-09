import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Target,
  Users,
  Lightbulb,
  ListChecks,
  Sparkles,
  Package,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

/* ------------------ UI Components ------------------ */

const Tag = ({ children, className }) => (
  <span className={cn(
    "px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium shadow-sm flex items-center gap-1.5",
    className
  )}>
    {children}
  </span>
);

const SectionHeader = ({ icon: Icon, title, className }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      {title}
    </h3>
  </div>
);

const ActivityTag = ({ children }) => (
  <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
    {children}
  </span>
);

/* ------------------ Main Component ------------------ */

const LessonPlanItem = ({ item, isgenrated = false }) => {
  const lesson_plan = isgenrated
    ? item
    : item?.content?.lesson_plan;

  const handleExport = () => {
    window.print();
  };

  if (!lesson_plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground italic border border-dashed rounded-3xl">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p>No lesson plan data available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-card to-muted/30 p-8 shadow-[var(--shadow-lg)]">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="h-32 w-32 text-primary" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
              {lesson_plan?.title}
            </h2>

            <div className="flex flex-wrap gap-3">
              <Tag>
                <BookOpen className="w-4 h-4" />
                {lesson_plan?.subject || "Subject"}
              </Tag>
              <Tag className="bg-accent/10 text-accent">
                <GraduationCap className="w-4 h-4" />
                {lesson_plan?.grade_level || "Level"}
              </Tag>
              <Tag className="bg-muted text-muted-foreground border border-border">
                <Clock className="w-4 h-4" />
                {lesson_plan?.duration || "Duration"}
              </Tag>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={handleExport}
            className="print:hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-glow)] transition-all font-bold"
          >
            <FileText className="w-5 h-5 mr-3" />
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Objectives & Vocabulary Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Learning Objectives */}
        <Card className="border-none shadow-[var(--shadow-md)] bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <SectionHeader icon={Target} title="Learning Objectives" />
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {lesson_plan?.learning_objectives?.map((objective, idx) => (
                <li key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold transition-colors group-hover:bg-primary group-hover:text-white">
                    {idx + 1}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{objective}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Vocabulary */}
        <Card className="border-none shadow-[var(--shadow-md)] bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <SectionHeader icon={BookOpen} title="Key Vocabulary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2.5">
              {lesson_plan?.key_vocabulary?.map((word, idx) => (
                <Tag key={idx} className="bg-accent/5 text-accent border border-accent/20 px-4 py-2 text-base">
                  {word}
                </Tag>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Accordion */}
      <Card className="border-none shadow-[var(--shadow-lg)] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4 border-b border-border/50">
          <SectionHeader icon={Calendar} title="Instructional Activities" />
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {lesson_plan?.activities?.map((activity, idx) => (
              <AccordionItem
                key={idx}
                value={`activity-${idx}`}
                className="border-b last:border-b-0 border-border/50 transition-all hover:bg-muted/10 px-6 py-2"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left w-full">
                    <ActivityTag>Activity {idx + 1}</ActivityTag>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-foreground truncate">
                        {activity.activity_name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Description</h4>
                        <p className="text-foreground leading-relaxed">{activity.description}</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Goal</h4>
                        <p className="text-foreground font-medium italic">"{activity.learning_objective}"</p>
                      </div>
                    </div>

                    {/* Right Column - Steps */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ListChecks className="h-4 w-4" /> Sequence of Steps
                      </h4>
                      <div className="space-y-3">
                        {activity.steps?.map((step, sidx) => (
                          <div key={sidx} className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                              {sidx + 1}
                            </span>
                            <p className="text-sm text-foreground leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Materials Tag Strip */}
                  {activity.materials_used?.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Required Assets</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activity.materials_used.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-medium text-foreground">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Assessments & Strategies Grid */}
      <div className="grid gap-6 md:grid-cols-2 pb-10">
        {/* Assessment Section */}
        <Card className="border-none shadow-[var(--shadow-md)] bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <SectionHeader icon={ListChecks} title="Evaluation Methods" />
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" /> Formative
              </h4>
              <div className="grid grid-cols-1 gap-2 pl-3">
                {lesson_plan?.assessment_methods?.formative?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                <div className="w-1.5 h-6 bg-accent rounded-full" /> Summative
              </h4>
              <div className="grid grid-cols-1 gap-2 pl-3">
                {lesson_plan?.assessment_methods?.summative?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Differentiation & Homework Section */}
        <div className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-md)] bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <SectionHeader icon={Users} title="Inclusion Strategies" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-primary uppercase tracking-tight">Advanced Track</h4>
                </div>
                <ul className="space-y-2 pl-6 list-disc text-sm text-muted-foreground">
                  {lesson_plan?.differentiation_strategies?.for_advanced_students?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <h4 className="font-bold text-sm text-accent uppercase tracking-tight">Supports</h4>
                </div>
                <ul className="space-y-2 pl-6 list-disc text-sm text-muted-foreground">
                  {lesson_plan?.differentiation_strategies?.for_struggling_students?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[var(--shadow-lg)] bg-gradient-to-br from-primary to-accent overflow-hidden text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Homework</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <p className="text-white/90 text-sm leading-relaxed font-medium italic">
                "{lesson_plan?.homework_assignment}"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanItem;
