import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Separator } from "@radix-ui/react-separator";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Package,
  Target,
  Users,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import React from "react";

/* ------------------ UI Enhancements ------------------ */

const Tag = ({ children }) => (
  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium shadow-sm">
    {children}
  </span>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2">
    <div className="p-2 rounded-xl bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
);

const ActivityTag = ({ children }) => (
  <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
    {children}
  </span>
);

/* ------------------ Main Component ------------------ */

const LessonPlanItem = ({ item }) => {
  const lesson_plan = item.content?.lesson_plan;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">

      {/* Main Title */}
      <div className="rounded-lg border-2 border-border bg-card shadow-sm">
        <div className="p-6 flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">{lesson_plan?.title}</h2>

            <div className="flex flex-wrap gap-2">
              <Tag>
                <BookOpen className="w-3 h-3 mr-1 inline" />
                {lesson_plan?.subject}
              </Tag>
              <Tag>
                <GraduationCap className="w-3 h-3 mr-1 inline" />
                {lesson_plan?.grade_level}
              </Tag>
              <Tag>
                <Clock className="w-3 h-3 mr-1 inline" />
                {lesson_plan?.duration}
              </Tag>
            </div>
          </div>

          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Learning Objectives */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <SectionHeader icon={Target} title="Learning Objectives" />
          </div>
          <div className="p-6 pt-0">
            <ul className="space-y-2">
              {lesson_plan?.learning_objectives?.map((objective, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground font-semibold">
                    {idx + 1}.
                  </span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Vocabulary */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <SectionHeader icon={BookOpen} title="Key Vocabulary" />
          </div>
          <div className="p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {lesson_plan?.key_vocabulary?.slice(0, 3).map((word, idx) => (
                <Tag key={idx}>{word}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Materials Needed */}
      {/* <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <SectionHeader icon={Package} title="Materials Needed" />
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 truncate">
            {lesson_plan?.materials?.map((item, idx) => (
      <div key={idx} className="flex items-start gap-2 w-full min-w-0">
        <Circle className="w-3 h-3 text-muted-foreground mt-1" />

        <span
          className="text-sm text-muted-foreground truncate w-full min-w-0"
          title={item}
        >
          {item}
        </span>
      </div>
    ))}
          </div>
        </div>
      </div> */}

      {/* Activities */}
      <div className="rounded-lg border-2 border-primary/20 bg-card shadow-sm">
        <div className="p-6 bg-primary/5">
          <SectionHeader icon={Calendar} title="Activities" />
        </div>

        <div className="p-6 pt-6">
          <Accordion type="single" collapsible className="space-y-4">
            {lesson_plan?.activities?.map((activity, idx) => (
              <AccordionItem
                key={idx}
                value={`activity-${idx}`}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger>
                  <div className="flex items-center gap-3 text-left">
                    <ActivityTag>Activity {idx + 1}</ActivityTag>
                    <div>
                      <div className="font-semibold">
                        {activity.activity_name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="space-y-4 pt-4">
                  {/* Description */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="text-sm mt-1">{activity.description}</p>
                  </div>

                  {/* Learning Objective */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Learning Objective
                    </p>
                    <p className="text-sm mt-1">{activity.learning_objective}</p>
                  </div>

                  {/* Materials Used */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Materials Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activity.materials_used?.map((m, i) => (
                        <Tag key={i}>{m}</Tag>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Steps
                    </p>
                    <ol className="space-y-2">
                      {activity.steps?.map((step, sidx) => (
                        <li key={sidx} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground font-semibold">
                            {sidx + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Assessment Methods */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <SectionHeader icon={ListChecks} title="Assessment Methods" />
        </div>

        <div className="p-6 pt-0 space-y-6">
          {/* Formative */}
          <div>
            <Tag>Formative</Tag>
            <ul className="space-y-1.5 mt-3">
              {lesson_plan?.assessment_methods?.formative?.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Summative */}
          <div>
            <Tag>Summative</Tag>
            <ul className="space-y-1.5 mt-3">
              {lesson_plan?.assessment_methods?.summative?.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Differentiation */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <SectionHeader
            icon={Users}
            title="Differentiation Strategies"
          />
        </div>

        <div className="p-6 pt-0 space-y-6">
          {/* Advanced */}
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">For Advanced Students</h4>
            </div>

            <ul className="space-y-1.5 mt-2">
              {lesson_plan?.differentiation_strategies?.for_advanced_students?.map(
                (s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    {s}
                  </li>
                )
              )}
            </ul>
          </div>

          <Separator />

          {/* Struggling */}
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">For Struggling Students</h4>
            </div>

            <ul className="space-y-1.5 mt-2">
              {lesson_plan?.differentiation_strategies?.for_struggling_students?.map(
                (s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    {s}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Homework */}
      <div className="rounded-lg border-2 border-primary/20 bg-card shadow-sm">
        <div className="p-6 bg-primary/5">
          <SectionHeader icon={FileText} title="Homework Assignment" />
        </div>

        <div className="p-6 pt-6">
          <p className="text-sm">{lesson_plan?.homework_assignment}</p>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanItem;
