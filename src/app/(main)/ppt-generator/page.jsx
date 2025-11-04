
'use client';

import { useState } from 'react';
import {
  Presentation,
  Loader2,
  Download,
  BookOpen,
  FileIcon,
  Plus,
  FileImage,
  Palette,
  Layers,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const mockHistory = [
  {
    id: '1',
    title: 'The Brahmin and the Disciple',
    slides: 11,
    date: new Date('2025-10-13'),
    details: {
      subtitle: 'A Tale of Greed, Magic, and Unexpected Consequences',
      author: 'Epoch AI Generated Presentation',
      theme: 'Dark',
      filename: 'The_Brahmin_and_the_Disciple_1760352312808.pptx',
    },
  },
  {
    id: '2',
    title: 'Introduction to Photosynthesis',
    slides: 15,
    date: new Date('2025-10-11'),
    details: {
      subtitle: 'Understanding how plants create food.',
      author: 'Epoch AI Generated Presentation',
      theme: 'Light',
      filename: 'Intro_to_Photosynthesis_1759992312808.pptx',
    },
  },
];

const mockData = {
    books: [
        {
            name: 'Oliver English Class 05',
            chapters: [
                { name: 'The Brahmin and the Disciple (Story)', pages: '7 - 16' },
                { name: 'Another Chapter', pages: '17 - 28' },
            ]
        },
        {
            name: 'The Great Gatsby',
            chapters: [
                { name: 'Chapter 1', pages: '1 - 20' },
                { name: 'Chapter 2', pages: '21 - 45' },
            ]
        }
    ]
}


function PptDetails({ item }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                <CardDescription>{item.details.subtitle}</CardDescription>
              </div>
              <Button size="lg">
                <Download className="mr-2" />
                Download PPT
              </Button>
          </div>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <Card className="p-4 bg-primary/10">
                    <Layers className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{item.slides}</p>
                    <p className="text-sm text-muted-foreground">Slides</p>
                </Card>
                <Card className="p-4 bg-purple-500/10">
                     <Palette className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">
                        {item.details.theme}
                    </p>
                    <p className="text-sm text-muted-foreground">Theme</p>
                </Card>
                 <Card className="p-4 bg-green-500/10">
                    <FileIcon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">PPTX</p>
                    <p className="text-sm text-muted-foreground">Format</p>
                </Card>
                <Card className="p-4 bg-orange-500/10">
                     <FileImage className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-600">Standard</p>
                    <p className="text-sm text-muted-foreground">Aspect Ratio</p>
                </Card>
            </div>
            <div className="mt-6 text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold">Generated on:</span> {format(item.date, 'MMMM dd, yyyy')}</p>
                <p><span className="font-semibold">Filename:</span> <span className="break-all">{item.details.filename}</span></p>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}


function NewPptForm({ onGenerate }) {
    const [selectedBook, setSelectedBook] = useState(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px]">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                     <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                        <CardTitle className="font-headline text-xl">Generate a New Presentation</CardTitle>
                    </div>
                    <CardDescription>
                        Choose a book and chapter to automatically create a PowerPoint presentation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Select Book</label>
                            <Select onValueChange={setSelectedBook}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a book" />
                                </SelectTrigger>
                                <SelectContent>
                                {mockData.books.map((book) => (
                                    <SelectItem key={book.name} value={book.name}>{book.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                             <label className="text-sm font-medium">Select Chapter</label>
                             <Select disabled={!selectedBook}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a chapter" />
                                </SelectTrigger>
                                <SelectContent>
                                {mockData.books.find(b => b.name === selectedBook)?.chapters.map((chapter) => (
                                    <SelectItem key={chapter.name} value={chapter.name}>{chapter.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <Button onClick={onGenerate} className="w-full !mt-8" size="lg">
                        <Presentation className="mr-2 h-4 w-4" />
                        Generate Presentation
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PptGeneratorPage() {
  const [selectedPpt, setSelectedPpt] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setSelectedPpt(null);
    setTimeout(() => {
        const newPpt = {
            id: '3',
            title: 'New Presentation',
            slides: 12,
            date: new Date(),
            details: {
              subtitle: 'Generated from selected chapter.',
              author: 'Epoch AI Generated Presentation',
              theme: 'Dark',
              filename: 'New_Presentation.pptx',
            },
        };
        mockHistory.unshift(newPpt);
        setSelectedPpt(newPpt);
        setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      {/* Left Sidebar for history */}
      <div className="hidden md:flex flex-col border-r bg-muted/20 p-4 space-y-4">
        <Button variant="outline" onClick={() => setSelectedPpt(null)}>
          <Plus className="mr-2" /> New PPT
        </Button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-2">
            Presentations
          </h3>
          <div className="space-y-2">
            {mockHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedPpt(item)}
                className={cn(
                  'w-full text-left p-2 rounded-lg border',
                  selectedPpt?.id === item.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <FileIcon className="w-4 h-4 text-red-500" />
                  <span>{format(item.date, 'dd/MM/yyyy')}</span>
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.slides} slides
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-6">
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Generating Presentation...</h3>
                    <p className="text-sm text-muted-foreground">
                        Please wait while the AI crafts your slides.
                    </p>
                </div>
            </div>
        ) : selectedPpt ? (
          <PptDetails item={selectedPpt} />
        ) : (
          <NewPptForm onGenerate={handleGenerate} />
        )}
      </main>
    </div>
  );
}
