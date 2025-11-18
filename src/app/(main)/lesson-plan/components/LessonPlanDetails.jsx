export function LessonPlanDetails({ item }) {
  console.log("Learning Detail:", item);

  const learningContent = item?.learning?.content || item?.content || "";
  const learningTitle = item?.learning?.title || item?.title || "Lesson Plan";

  return (
    <div className="lg:col-span-7">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{learningTitle}</h2>
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">Generated Learning Path</p>
            <p className="text-foreground">This AI-generated learning path is ready for your classroom.</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <div
            className="text-muted-foreground leading-relaxed"
            style={{
              fontFamily: "inherit",
              fontSize: "0.95rem",
              lineHeight: "1.7",
            }}
          >
            {learningContent.split("\n").map((line, index) => {
              // Skip lines that are just "---" (horizontal rules)
              if (line.trim() === "---") {
                return <div key={index} className="my-0" />; // Reduced spacing
              }

              // Handle headers (lines starting with #)
              if (line.startsWith("####")) {
                return (
                  <h4 key={index} className="text-base font-semibold text-foreground mt-5 mb-2">
                    {line.replace(/^####\s*#*\s*/, "")}
                  </h4>
                );
              }
              if (line.startsWith("###")) {
                return (
                  <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
                    {line.replace(/^###\s*#*\s*/, "")}
                  </h3>
                );
              }
              if (line.startsWith("##")) {
                return (
                  <h2 key={index} className="text-xl font-bold text-foreground mt-8 mb-4">
                    {line.replace(/^##\s*#*\s*/, "")}
                  </h2>
                );
              }

              // Handle bullet points - NO bullet, just text with left padding
              if (line.trim().startsWith("*")) {
                return (
                  <div key={index} className="ml-6 mb-2">
                    <span>{line.replace(/^\s*\*\s*/, "").replace(/\*\*/g, "")}</span>
                  </div>
                );
              }
              // Handle bold text (**text**)
              if (line.includes("**")) {
                const parts = line.split("**");
                return (
                  <p key={index} className="mb-3">
                    {parts.map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="font-semibold text-foreground">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }

              // Regular paragraphs
              if (line.trim()) {
                return (
                  <p key={index} className="mb-3">
                    {line}
                  </p>
                );
              }

              // Empty lines (reduced spacing)
              return <div key={index} className="h-1" />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}