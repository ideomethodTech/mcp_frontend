
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, File, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Title from '@/app/componentsV2/ui/title';
import History from '@/app/componentsV2/ui/history';

const formSchema = z.object({
  topicName: z.string().min(3, 'Topic name must be at least 3 characters.'),
  gradeLevel: z.string().nonempty('Please select a grade level.'),
  duration: z.string().min(1, 'Please specify a duration.'),
});

const mockLessonPlan = {
  objective:
    'Students will be able to understand the concept of photosynthesis, identify its key components (sunlight, water, carbon dioxide), and describe its importance for plant life and the ecosystem.',
  materials: [
    'Whiteboard or blackboard',
    'Markers or chalk',
    'Diagram of a plant cell',
    'Video on photosynthesis (e.g., from YouTube or Khan Academy)',
    'Worksheets with fill-in-the-blanks and labeling exercises',
    'Art supplies: green construction paper, scissors, glue',
  ],
  activities: [
    {
      title: 'Introduction (10 minutes)',
      description:
        "Begin with a discussion about how plants get their food. Ask students what they already know. Introduce the term 'photosynthesis'.",
    },
    {
      title: 'Direct Instruction (15 minutes)',
      description:
        'Explain the process of photosynthesis using the whiteboard. Draw a simple diagram showing a plant taking in sunlight, water, and CO2, and releasing oxygen. Use the plant cell diagram to show where this happens (chloroplasts).',
    },
    {
      title: 'Visual Learning (10 minutes)',
      description: 'Show a short, engaging video that visually explains photosynthesis.',
    },
    {
      title: 'Group Activity: Leaf Craft (15 minutes)',
      description:
        'Students create a model of a leaf. They will label the parts involved in photosynthesis and write a short sentence explaining the process.',
    },
  ],
  outcomes:
    'Students will be able to verbally explain the basic process of photosynthesis. They will also be able to label a diagram with the inputs and outputs of photosynthesis. Their leaf craft will serve as a visual aid for their understanding.',
};

const defaultValues = {
  topicName: '',
  gradeLevel: '',
  duration: '',
};

// Local mock history used to render existing lesson plans
const mockHistory = [
  {
    id: '1',
    title: 'The Solar System',
    date: new Date('2025-10-10'),
    grade: 'Grade 5',
    data: mockLessonPlan
  },
  {
    id: '2',
    title: 'Photosynthesis',
    date: new Date('2025-10-12'),
    grade: 'Grade 7',
    data: {
      ...mockLessonPlan,
      objective: 'Students will understand Photosynthesis.'
    }
  }
];

function LessonPlanDetails({ item }) {
  const lessonPlan = item.data;
  console.log(item);
  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Title Section */}
        <Title item={item}></Title>

        {/* Lesson Plan Details */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">Generated Lesson Plan</p>
            <p className="text-foreground">This AI-generated lesson plan is ready for your classroom.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Objective</h3>
            <p className="text-muted-foreground">{lessonPlan.objective}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Materials</h3>
            <ul className="space-y-2 text-muted-foreground">
              {lessonPlan.materials.map((material, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{material}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Activities</h3>
            <div className="space-y-4">
              {lessonPlan.activities.map((activity) => (
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-start gap-3 mb-2">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-headline font-semibold text-lg mb-2">Outcomes</h3>
            <p className="text-muted-foreground">{lessonPlan.outcomes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewLessonPlanForm({ onGenerate }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  return (
    <div className="lg:col-span-3">
      <div className="flex justify-center items-center ">
        <Card >
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>
              Provide the details for your lesson plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Solar System" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1 week" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full !mt-8" size="lg" disabled={!form.formState.isValid}>
                  Generate Lesson Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (values) => {
    setIsLoading(true);
    setSelectedItem(null);

    setTimeout(() => {
      const newItem = {
        id: (mockHistory.length + 1).toString(),
        title: values.topicName,
        date: new Date(),
        grade: values.gradeLevel,
        data: mockLessonPlan
      };
      mockHistory.unshift(newItem);
      setSelectedItem(newItem);
      setIsLoading(false);
    }, 2000);
  }

  const showHistory = (item) => {
    return (
      <button
        key={item.id}
        onClick={() => setSelectedItem(item)}
        className={cn(
          'w-full text-left p-2 rounded-lg border',
          selectedItem?.id === item.id
            ? 'bg-primary/10 border-primary'
            : 'hover:bg-muted/50'
        )}
      >
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
          <File className="text-xs text-muted-foreground mt-1" />
          <span>{format(item.date, 'dd/MM/yyyy')}</span>
        </div>
        <p className="font-medium text-foreground text-sm mb-1">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {item.grade}
        </p>
      </button>
    )
  }
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Lesson Plan Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Generate structured lesson plans for any topic or chapter
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
   <History
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  historyData={mockHistory}
                />
        {/* Lesson Plan Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Lesson Plan...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while the AI builds your plan.
              </p>
            </div>
          </div>
        ) : selectedItem ? (
          <LessonPlanDetails item={selectedItem} />
        ) : (
          <NewLessonPlanForm onGenerate={handleGenerate} />
        )}
      </div>
    </div>
  );
}
