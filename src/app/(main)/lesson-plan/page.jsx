
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, File, FileText, Clock, BookOpen } from 'lucide-react';
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
import History from '@/app/componentsV2/ui/history';
import { usePathname } from 'next/navigation';
import { getNavItemByUrl } from '@/app/utils';
import { useCreateLessonPlan, useGetBook } from '@/lib/api/queries';

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
  // console.log(item);
  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
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

function NewLessonPlanForm({ onGenerate,data }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
     defaultValues: {
      book: "",
      chapter: "",
    },
  });

    const handleStart = () => {
    if (selectedBook) {
      onStartChat(selectedBook);
    }
  }
  const selectedBookId = form.watch("book");
  const selectedBook = data?.find((b) => b.book_id === selectedBookId);
  return (
      <div className="lg:col-span-3">
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-2xl">
        
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
                <CardTitle className="font-headline text-xl">Book & Chapter Selection</CardTitle>
              </div>
              <CardDescription>
                Choose the book and chapter to generate a worksheet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="book"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Book</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a book" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* {mockData.books.map((book) => (
                                <SelectItem key={book.name} value={book.name}>{book.name}</SelectItem>
                              ))} */}
                              {data?.map((book) => (
                                <SelectItem
                                  key={book.book_id}
                                  value={book.book_id}
                                >
                                  {book.book_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chapter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Chapter</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBook}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                             {selectedBook?.chapters?.map((chapter) => (
                                <SelectItem
                                  key={chapter}
                                  value={chapter}
                                >
                                  {chapter}
                                </SelectItem>
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
                  </div>

                  <Button type="submit" className="w-full !mt-8" size="lg" disabled={!form.formState.isValid}>
                    Generate Worksheet
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const uid = "nn170kZPMuWZlbzGbVps3YVyG9J3";
  const { mutate: createLessonPlanMutation, isPending: creatingLesson } =
  useCreateLessonPlan({
    onSuccess: (data) => {
      console.log("Lesson Plan Created:", data);
      setSelectedItem(data);      // Or data.id if backend returns id
      setIsLoading(false);
    },
    onError: (err) => {
      console.error("Error creating lesson plan:", err);
      setIsLoading(false);
    }
  });

  const { data: bookData, isLoading: isBookDataLoading } = useGetBook(uid);
  useEffect(() => {
    if (bookData) {
      console.log("📚 Book Data Loaded:", bookData);
    }
  }, [bookData]);

  const handleGenerate = ({book_id,chapter,uid,weeks}) => {
  setIsLoading(true);
  setSelectedItem(null);

  createLessonPlanMutation({
    book_id: book_id,
    chapter: chapter,
    uid: uid,
    weeks: weeks,    // or based on logic
  });
  };
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {navItem.title}
                      </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {navItem.description} 
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
   <History
           item={navItem.itemtype}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  historyData={mockHistory}
                />
        {/* Lesson Plan Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating {navItem.itemtype}...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while the AI builds your plan.
              </p>
            </div>
          </div>
        ) : selectedItem ? (
          <LessonPlanDetails item={selectedItem} />
        ) : (
          <NewLessonPlanForm onGenerate={handleGenerate}  data={bookData?.content} />
        )}
      </div>
    </div>
  );
}
