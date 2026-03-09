"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Key } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from "@/contexts/auth-context";
import { useGetTestPaperAnswers } from "@/lib/api/queries";

const TestPaperItem = ({ item, bookId, isNew, testPaperId }) => {
    const { user } = useAuth();
    const uid = user?.user?.uid;
    const [showAnswers, setShowAnswers] = useState(false);

    console.log("TestPaperItem rendered with:", { item, bookId, isNew, testPaperId });

    if (!item) {
        console.warn("TestPaperItem: No item provided");
        return null;
    }

    const itemWithId = isNew ? { ...item, id: testPaperId } : item;
    console.log("TestPaperItem itemWithId:", itemWithId);

    // Resolve each metadata field: top-level first, then data wrapper, then paper sub-object
    const dataMeta = (itemWithId.data && !Array.isArray(itemWithId.data)) ? itemWithId.data : {};
    const paperMeta = (itemWithId.paper && !Array.isArray(itemWithId.paper))
        ? itemWithId.paper
        : (dataMeta.paper && !Array.isArray(dataMeta.paper)) ? dataMeta.paper : {};

    // Fetch answers externally if not embedded in item
    const currentPaperId = itemWithId.test_paper_id || itemWithId.id || itemWithId.paper_id || dataMeta?.test_paper_id || dataMeta?.paper_id || dataMeta?.id || testPaperId;
    console.log("Answer Key - currentPaperId:", currentPaperId);

    const { data: fetchedAnswersData, isLoading: fetchingAnswers } = useGetTestPaperAnswers(currentPaperId, uid, {
        enabled: !!showAnswers && !!uid && !!currentPaperId
    });

    const externalAnswers = fetchedAnswersData?.answer_key || fetchedAnswersData?.content?.answers || fetchedAnswersData?.answers || fetchedAnswersData?.content?.answer_key || [];
    const embeddedAnswers = itemWithId.answer_key || dataMeta?.answer_key || [];
    const activeAnswers = externalAnswers.length > 0 ? externalAnswers : embeddedAnswers;
    console.log("activeAnswers:", activeAnswers);

    const sections = itemWithId.sections || dataMeta.sections || [];

    const paperData = {
        title: itemWithId.title || dataMeta.title || paperMeta.title || null,
        subject: itemWithId.subject || dataMeta.subject || paperMeta.subject || null,
        class: itemWithId.class || dataMeta.class || paperMeta.class || null,
        total_marks: itemWithId.total_marks || dataMeta.total_marks || paperMeta.total_marks || null,
        duration: itemWithId.duration || dataMeta.duration || paperMeta.duration || null,
    };

    console.log("Resolved paperData:", paperData);
    console.log("Resolved sections:", sections);

    // Flatten all questions from all sections, or use item.paper if it's a flat array
    let allQuestions = [];
    if (sections.length > 0) {
        allQuestions = sections.flatMap(section =>
            Array.isArray(section.questions) ? section.questions : []
        );
    } else if (Array.isArray(itemWithId.paper)) {
        allQuestions = itemWithId.paper;
    } else if (Array.isArray(dataMeta.paper)) {
        allQuestions = dataMeta.paper;
    } else if (Array.isArray(itemWithId.questions)) {
        allQuestions = itemWithId.questions;
    } else if (Array.isArray(dataMeta.questions)) {
        allQuestions = dataMeta.questions;
    }

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
                        <Button
                            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                            onClick={() => setShowAnswers(!showAnswers)}
                            disabled={fetchingAnswers}
                        >
                            <Key className="h-4 w-4" />
                            {fetchingAnswers ? "Loading..." : (showAnswers ? "Hide Answer Key" : "Answer Key")}
                        </Button>
                    </div>
                </div>

                {/* Test Paper Content */}
                <div className="p-8">
                    {showAnswers && (
                        <div className={`mb-8 p-4 border rounded-lg text-sm flex items-center justify-between shadow-sm ${fetchingAnswers
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : activeAnswers.length > 0
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                            }`}>
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5" />
                                <span className="font-semibold text-base">
                                    {fetchingAnswers
                                        ? 'Loading answer key...'
                                        : activeAnswers.length > 0
                                            ? 'Answer key generated successfully — scroll down to view it at the bottom of the paper'
                                            : 'No answers found for this test paper yet'}
                                </span>
                            </div>
                            {!fetchingAnswers && activeAnswers.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}>
                                    Scroll Down ↓
                                </Button>
                            )}
                        </div>
                    )}

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

                    {/* Answer Key Section */}
                    {showAnswers && activeAnswers && activeAnswers.length > 0 && (
                        <div className="mt-12 pt-8 border-t-2 border-dashed border-primary/30">
                            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <Key className="h-6 w-6" />
                                Answer Key
                            </h3>
                            <div className="space-y-6">
                                {activeAnswers.map((answerObj, idx) => (
                                    <div key={idx} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <p className="font-semibold text-foreground mb-2">
                                            <span className="text-primary mr-2">Q{answerObj.question_number || (idx + 1)}.</span>
                                            {answerObj.question}
                                        </p>
                                        <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-foreground">Answer:</span>
                                                <span className="font-bold text-green-600 dark:text-green-500">
                                                    {typeof answerObj.correct_answer === 'object'
                                                        ? JSON.stringify(answerObj.correct_answer)
                                                        : String(answerObj.correct_answer || answerObj.answer || answerObj.expected_answer || 'N/A')}
                                                </span>
                                            </div>

                                            {answerObj.explanation && (
                                                <div className="mt-2 text-muted-foreground italic">
                                                    <span className="font-semibold not-italic">Explanation:</span>{" "}
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{answerObj.explanation}</ReactMarkdown>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestPaperItem;
