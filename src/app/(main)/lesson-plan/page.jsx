
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardList, Loader2, Plus, File } from 'lucide-react';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    return (
        <div className="space-y-6">
            <PageHeader 
                title={item.title}
                description={`A lesson plan for ${item.grade}. Generated on ${format(item.date, 'MMMM dd, yyyy')}.`}
                icon={ClipboardList}
            />
            <Card>
              <CardHeader>
                <CardTitle>Generated Lesson Plan</CardTitle>
                <CardDescription>
                  This AI-generated lesson plan is ready for your classroom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                    <div>
                    <h3 className="font-headline font-semibold text-lg mb-2">Objective</h3>
                    <p className="text-muted-foreground">{lessonPlan.objective}</p>
                    </div>
                    <Separator />
                    <div>
                    <h3 className="font-headline font-semibold text-lg mb-2">Materials</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {lessonPlan.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                        ))}
                    </ul>
                    </div>
                    <Separator />
                    <div>
                    <h3 className="font-headline font-semibold text-lg mb-2">Activities</h3>
                    <div className="space-y-4">
                        {lessonPlan.activities.map((activity, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/50">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <p className="text-muted-foreground">{activity.description}</p>
                        </div>
                        ))}
                    </div>
                    </div>
                    <Separator />
                    <div>
                    <h3 className="font-headline font-semibold text-lg mb-2">Outcomes</h3>
                    <p className="text-muted-foreground">{lessonPlan.outcomes}</p>
                    </div>
                </div>
              </CardContent>
            </Card>
        </div>
    )
}

function NewLessonPlanForm({ onGenerate }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  return (
    <div className="space-y-6">
        <PageHeader
            title="Lesson Plan Generator"
            description="Generate a structured lesson plan for any topic."
            icon={ClipboardList}
        />
        <div className="flex justify-center items-center min-h-[400px]">
            <Card className="w-full max-w-2xl">
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
                                    <SelectItem key={i+1} value={`Grade ${i+1}`}>Grade {i+1}</SelectItem>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      <div className="hidden md:flex flex-col border-r bg-muted/20 p-4 space-y-4">
        <Button variant="outline" onClick={() => setSelectedItem(null)}>
          <Plus className="mr-2" /> New Lesson Plan
        </Button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-2">
            History
          </h3>
          <div className="space-y-2">
            {mockHistory.map((item) => (
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
                  <File className="w-4 h-4 text-green-500" />
                  <span>{format(item.date, 'dd/MM/yyyy')}</span>
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.grade}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6">
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
      </main>
    </div>
  );
}
