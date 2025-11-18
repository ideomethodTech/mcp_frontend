import { Loader2, Key } from "lucide-react";
import { useGetDocumentChapters } from "@/lib/api/queries";

export function AnswerKeyDetails({ item, worksheetData, isLoading, selectedItem, documents }) {
  const answerKey = item || {};
  const worksheet = worksheetData?.worksheet || worksheetData || {};
  const book = documents?.find((doc) => doc.document_id === selectedItem?.document_id);
  const bookName = book?.name || book?.filename;
  const { data: chapters } = useGetDocumentChapters(selectedItem?.document_id);
  const chapter = chapters?.messages?.find((ch) => ch.chapter_id === selectedItem?.chapter_id);
  const chapterName = chapter?.chapter_name || "Unknown Chapter";
  console.log("Chapters data:", chapters);
  if (isLoading) {
    return (
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Loading Answer Key...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we generate the answers.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform the API data to match your structure
  const transformToAnswersArray = () => {
    const answers = [];

    // Match MCQs - add safe checks
    answerKey.mcqs?.forEach((answerObj, index) => {
      const question = worksheet.mcqs?.find((q) => q.question_id === answerObj.question_id);
      if (question) {
        answers.push({
          id: index + 1,
          title: question.question,
          explanation: ` ${answerObj.answer}`,
        });
      }
    });

    // Match Fill Ups
    answerKey.fill_ups?.forEach((answerObj, index) => {
      const question = worksheet.fill_ups?.find((q) => q.question_id === answerObj.question_id);
      if (question) {
        answers.push({
          id: answers.length + 1,
          title: question.question,
          explanation: `${answerObj.answer}`,
        });
      }
    });

    // Match Brief QAs
    answerKey.brief_qas?.forEach((answerObj, index) => {
      const question = worksheet.brief_qas?.find((q) => q.question_id === answerObj.question_id);
      if (question) {
        answers.push({
          id: answers.length + 1,
          title: question.question,
          explanation: ` ${answerObj.answer}`,
        });
      }
    });

    // Match True/False
    answerKey.true_false?.forEach((answerObj, index) => {
      const question = worksheet.true_false?.find((q) => q.question_id === answerObj.question_id);
      if (question) {
        answers.push({
          id: answers.length + 1,
          title: question.statement,
          explanation: `${answerObj.answer}`,
        });
      }
    });

    // Match Following
    answerKey.match_following?.forEach((answerObj, index) => {
      const question = worksheet.match_following?.find((q) => q.question_id === answerObj.question_id);
      if (question) {
        answers.push({
          id: answers.length + 1,
          title: question.question || "Match the following",
          explanation: `Answer: ${answerObj.answer}`,
        });
      }
    });

    return answers;
  };

  const answers = transformToAnswersArray();

  return (
    <div className="lg:col-span-7">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Key className="h-6 w-6 text-primary mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {" "}
              {selectedItem?.title || worksheetData?.title || "Answer Key"}
            </h2>
            <div className="text-muted-foreground text-sm">
              <p className="text-muted-foreground text-sm">
                Answer Key for "{chapterName || "Unknown Chapter"}" from the book "{bookName || "Unknown Book"}"
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 mb-8 border border-primary/10">
          <p className="text-sm text-muted-foreground mb-2">Generated Answer Key</p>
          <p className="text-foreground">The AI-generated answer key for the worksheet based on "{chapterName}".</p>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          {answers.map((ans) => (
            <div key={ans.id} className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {ans.id}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">{ans.title}</p>

                  {ans.explanation && (
                    <p className="text-sm text-muted-foreground italic">
                      <strong>Answer:</strong> {ans.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!answers || answers.length === 0) && (
            <div className="p-6 rounded-xl border border-border bg-muted/30">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">No answer key available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}