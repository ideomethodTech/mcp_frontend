import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';
import { Separator } from '@radix-ui/react-separator';
import { Badge, BookOpen, Calendar, CheckCircle2, Clock, FileText, GraduationCap, ListChecks, Package, Target } from 'lucide-react';
import React from 'react';
import { Button } from 'react-day-picker';

const LessonPlanItem = ( lesson_plan) => {
    return (
        <div>
             <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{lesson_plan.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {lesson_plan.subject}
                </Badge>
                <Badge variant="secondary">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {lesson_plan.grade_level}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {lesson_plan.duration}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle>Learning Objectives</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson_plan.learning_objectives.map((objective, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground font-semibold">{idx + 1}.</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Vocabulary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Key Vocabulary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lesson_plan.key_vocabulary.map((word, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {word}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Needed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>Materials Needed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lesson_plan.materials_needed.map((material, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{material}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="space-y-4">
            {lesson_plan.activities.map((activity, idx) => (
              <AccordionItem key={idx} value={`activity-${idx}`} className="border rounded-lg px-4">
                <AccordionTrigger>
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="outline">Activity {idx + 1}</Badge>
                    <div>
                      <div className="font-semibold">{activity.activity_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{activity.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Learning Objective</p>
                    <p className="text-sm mt-1">{activity.learning_objective}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Materials Used</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.materials_used.map((material, midx) => (
                        <Badge key={midx} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Steps</p>
                    <ol className="space-y-2">
                      {activity.steps.map((step, sidx) => (
                        <li key={sidx} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground font-semibold">{sidx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Assessment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <CardTitle>Assessment Methods</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Badge variant="default">Formative</Badge>
            </h4>
            <ul className="space-y-1.5">
              {lesson_plan.assessment_methods.formative.map((method, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Badge variant="default">Summative</Badge>
            </h4>
            <ul className="space-y-1.5">
              {lesson_plan.assessment_methods.summative.map((method, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Differentiation Strategies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Differentiation Strategies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              For Advanced Students
            </h4>
            <ul className="space-y-1.5">
              {lesson_plan.differentiation_strategies.for_advanced_students.map((strategy, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              For Struggling Students
            </h4>
            <ul className="space-y-1.5">
              {lesson_plan.differentiation_strategies.for_struggling_students.map((strategy, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Homework Assignment */}
      <Card className="border-primary/20 border-2">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Homework Assignment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm">{lesson_plan.homework_assignment}</p>
        </CardContent>
      </Card>

        </div>
    );
}

export default LessonPlanItem;
