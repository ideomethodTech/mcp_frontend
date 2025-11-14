import { Button } from '@/components/ui/button';
import { ExternalLink, Printer, Sheet } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const WorksheetItem = ({ item, questions }) => {
    return (
        <div>
                <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
                    {/* Header with Actions */}
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sheet className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Worksheet: The Brahmin and the Disciple</h2>
                                <p className="text-sm text-muted-foreground">
                                    Generated from 'Oliver English Class 05' on October 13, 2025
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 ">
                                <Link href="/answer-key">
                                    <ExternalLink className="ml-2 h-4 w-10" /> Answer Key
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Worksheet Content */}
                    <div className="p-8">
                        <div className="max-w-4xl">
                            {/* Info Box */}
                            <div className="rounded-xl border-2 border-primary/20 p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
                                <h3 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">
                                    CHAPTER: {item.title}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Name:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Class:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Roll No:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Section:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Date:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Grade:</span>
                                        <div className="flex-1 border-b border-muted-foreground/30"></div>
                                    </div>
                                </div>
                                <div className="mt-4 text-right text-sm text-muted-foreground">
                                    Teacher's Signature: _______________
                                </div>
                            </div>

                            {/* Questions Section */}
                            <div className="space-y-8">
                                <h3 className="text-lg font-semibold mb-4">A. Multiple Choice Questions</h3>

                                {questions?.map((question, index) => (
                                    <div key={index} className="space-y-4">
                                        <div>
                                            <p className="font-medium mb-2">
                                                {index + 1}. {question.question}
                                            </p>
                                            <div className="pl-4 space-y-1 text-sm">
                                                {question.options?.map((option, i) => (
                                                    <p key={i}>
                                                        {i + 1}. {option}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">B. Short Answer Questions</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="font-medium mb-2">1. Describe the main character of the story.</p>
                                            <div className="space-y-2">
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-medium mb-2">2. What lesson did you learn from this chapter?</p>
                                            <div className="space-y-2">
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                                <div className="border-b border-muted-foreground/20 h-6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default WorksheetItem;
