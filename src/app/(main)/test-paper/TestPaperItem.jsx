"use client";

import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TestPaperItem = ({ item, bookId, isNew, testPaperId }) => {
    console.log("TestPaperItem rendered with:", { item, bookId, isNew, testPaperId });

    if (!item) {
        console.warn("TestPaperItem: No item provided");
        return null;
    }

    const itemWithId = isNew ? { ...item, id: testPaperId } : item;
    console.log("TestPaperItem itemWithId:", itemWithId);

    // Extract metadata from the correct location
    const paperData = itemWithId.paper || itemWithId;
    const sections = itemWithId.sections || [];

    console.log("paperData:", paperData);
    console.log("sections:", sections);

    // Flatten all questions from all sections
    const allQuestions = sections.flatMap(section =>
        Array.isArray(section.questions) ? section.questions : []
    );

    console.log("allQuestions:", allQuestions);
    if (allQuestions.length > 0) {
        console.log("Sample question object:", allQuestions[0]);
        console.log("Question object keys:", Object.keys(allQuestions[0] || {}));
    }

    return (
        <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
                {/* Header with Actions */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {paperData.title || itemWithId.title || "Test Paper"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Assessment for {paperData.subject || itemWithId.subject || "Subject"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* Test Paper Content */}
                <div className="p-8">
                    <div className="max-w-4xl">
                        {/* Info Box */}
                        <div className="rounded-xl border-2 border-primary/20 p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
                            <h3 className="text-center font-bold text-lg mb-4 uppercase tracking-wide">
                                {paperData.title || "Test Paper"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Name:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30"></div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Class:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30">
                                        <span className="text-xs">{paperData.class || itemWithId.class || ""}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Roll No:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30"></div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Subject:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30">
                                        <span className="text-xs">{paperData.subject || itemWithId.subject || ""}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Date:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30"></div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Total Marks:</span>
                                    <div className="flex-1 border-b border-muted-foreground/30">
                                        <span className="text-xs">{paperData.total_marks || itemWithId.total_marks || ""}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Duration: {paperData.duration || itemWithId.duration || "N/A"}</span>
                                <span className="text-muted-foreground">Teacher's Signature: _______________</span>
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className="space-y-8">
                            {allQuestions.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>No questions available. The test paper may still be generating.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {allQuestions.map((question, index) => (
                                        <div key={index} className="space-y-3 pb-6 border-b border-border/50 last:border-0">
                                            <div className="flex gap-3">
                                                <span className="font-semibold text-foreground">{index + 1}.</span>
                                                <div className="flex-1">
                                                    <div className="prose prose-sm max-w-none text-foreground font-medium">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {question.question_text || question.question || question.text || "Question not available"}
                                                        </ReactMarkdown>
                                                    </div>

                                                    {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                                            {question.options.map((option, optIndex) => (
                                                                <p key={optIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-medium">
                                                                        {String.fromCharCode(65 + optIndex)}
                                                                    </span>
                                                                    {option}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                                                        <span className="font-bold">Marks:</span>
                                                        <span>{question.marks || "1"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPaperItem;
