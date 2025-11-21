import ReactMarkdown from 'react-markdown';

export function parseDynamicLessonPlan(lessonPlanString) {
  if (!lessonPlanString || typeof lessonPlanString !== "string") {
    return { weeks: {} };
  }

  const lines = lessonPlanString.split("\n");
  const weeks = {};
  let currentWeek = null;
  let currentSection = null;

  // Section matchers
  const sectionMatchers = {
    objectives: /objective/i,
    materials: /material/i,
    outcomes: /outcome|result/i,
    activities: /activit/i
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    // Detect week header: "## Week 1", "Week 2", "### Week 3"
    const weekMatch = line.match(/week\s\d+/i);
    if (weekMatch) {
      currentWeek = weekMatch[0].replace(/\s+/g, " ").trim();

      if (!weeks[currentWeek]) {
        weeks[currentWeek] = {
          objectives: [],
          materials: [],
          outcomes: [],
          activities: []
        };
      }

      currentSection = null;
      continue;
    }

    // Detect section headers dynamically
    for (const [section, pattern] of Object.entries(sectionMatchers)) {
      if (pattern.test(line)) {
        currentSection = section;
        break;
      }
    }

    // If line is a bullet or numbered item → add to section
    if (currentWeek && currentSection && /^[-*0-9.]/.test(line)) {
      const cleaned = line.replace(/^[-*0-9.)\s]+/, "").trim();
      if (cleaned.length > 0) {
        weeks[currentWeek][currentSection].push(cleaned);
      }
    }
  }

  return { weeks };
}

export function LessonPlanDetails({ item }) {
  console.log("Lesson Plan Data:", item);
  
  // Handle different response structures and parse JSON if needed
  let lessonPlanContent = item?.learning?.lesson_plan || 
                         item?.content || 
                         item?.message || 
                         "No content available";

  // If it's a string that looks like JSON, try to parse it
  if (typeof lessonPlanContent === 'string' && lessonPlanContent.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(lessonPlanContent);
      lessonPlanContent = parsed.lesson_plan || parsed.content || parsed.message || JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, keep the original string but clean up escaped characters
      lessonPlanContent = lessonPlanContent.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
  }

  // Clean up any remaining escaped characters
  lessonPlanContent = lessonPlanContent.replace(/\\"/g, '"').replace(/\\n/g, '\n');

  // Parse the lesson plan using your function
  const parsedLessonPlan = parseDynamicLessonPlan(lessonPlanContent);
  const hasStructuredData = Object.keys(parsedLessonPlan.weeks).length > 0;

  const learningTitle = item?.learning?.title || item?.title || "AI Response";

  return (
    <div className="lg:col-span-7">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-md)]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{learningTitle}</h2>
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-2">AI Response</p>
            <p className="text-foreground">Generated content from the AI assistant.</p>
          </div>
        </div>

        {/* Show structured data if available, otherwise show raw markdown */}
        {hasStructuredData ? (
          <StructuredLessonPlanView data={parsedLessonPlan} />
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-foreground mt-8 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-foreground mt-6 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-foreground mt-5 mb-2">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-2 mb-4 ml-4">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-muted-foreground leading-relaxed before:content-['•'] before:mr-2 before:text-primary">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
              }}
            >
              {lessonPlanContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// Component to display the structured lesson plan
function StructuredLessonPlanView({ data }) {
  const { weeks } = data;

  return (
    <div className="space-y-6">
      {Object.entries(weeks).map(([week, weekData]) => (
        <div key={week} className="border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">{week}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectives */}
            {weekData.objectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Objectives</h4>
                <ul className="space-y-1">
                  {weekData.objectives.map((obj, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {weekData.materials.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Materials</h4>
                <ul className="space-y-1">
                  {weekData.materials.map((material, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {material}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcomes */}
            {weekData.outcomes.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Outcomes</h4>
                <ul className="space-y-1">
                  {weekData.outcomes.map((outcome, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activities */}
            {weekData.activities.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Activities</h4>
                <ul className="space-y-1">
                  {weekData.activities.map((activity, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {activity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}