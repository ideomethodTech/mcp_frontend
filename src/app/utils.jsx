import { NAV_ITEMS } from "@/lib/constants";

export function getNavItemByUrl(pathname) {
  return NAV_ITEMS.find(item => item.href === pathname) || null;
}

export function parseWorksheet(text) {
  const result = {
    title: '',
    multipleChoice: [],
    fillInTheBlanks: [],
    trueFalse: []
  };

  // Extract title
  const titleMatch = text.match(/\*\*Worksheet:\s*(.+?)\*\*/);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // Split text into sections
  const sections = text.split(/\*\*[A-Z]\.\s*/);

  sections.forEach(section => {
    // Multiple Choice Questions
    if (section.includes('Multiple Choice')) {
      const questionBlocks = section.split(/\n\d+\.\s+/).slice(1);
      
      questionBlocks.forEach((block, idx) => {
        const lines = block.trim().split('\n').filter(line => line.trim());
        const question = lines[0].trim();
        const options = [];
        
        lines.slice(1).forEach(line => {
          const optionMatch = line.match(/([a-d])\.\s+(.+)/);
          if (optionMatch) {
            options.push({
              label: optionMatch[1],
              text: optionMatch[2].trim()
            });
          }
        });
        
        if (question && options.length > 0) {
          result.multipleChoice.push({
            questionNumber: idx + 1,
            question: question,
            options: options
          });
        }
      });
    }

    // Fill in the Blanks
    if (section.includes('Fill in the Blanks')) {
      const questionMatches = section.matchAll(/(\d+)\.\s+(.+?)(?=\n\d+\.|$)/gs);
      
      for (const match of questionMatches) {
        result.fillInTheBlanks.push({
          questionNumber: parseInt(match[1]),
          question: match[2].trim()
        });
      }
    }

    // True or False
    if (section.includes('True or False')) {
      const questionMatches = section.matchAll(/(\d+)\.\s+(.+?)\s+\(True\/False\)/g);
      
      for (const match of questionMatches) {
        result.trueFalse.push({
          questionNumber: parseInt(match[1]),
          question: match[2].trim(),
          options: ['True', 'False']
        });
      }
    }
  });

  return result;
}
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

    // Detect week header: "## Week 1", "**Week 2**", "### Week 3"
    const weekMatch = line.match(/week\s*\d+/i);
    if (weekMatch) {
      currentWeek = weekMatch[0].replace(/\*\*/g, "").trim();

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


export function parseAnswerKey(text) {
  const result = {
    title: '',
    multipleChoice: [],
    fillInTheBlanks: [],
    trueFalse: []
  };

  // Extract title
  const titleMatch = text.match(/##\s*Answer Key:\s*(.+?)(?:\n|$)/);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // Split text into sections
  const sections = text.split(/###\s*[A-Z]\.\s*/);

  sections.forEach(section => {
    // Multiple Choice Questions
    if (section.includes('Multiple Choice')) {
      const questions = section.match(/\d+\.\s+\*\*([a-d])\.\s+(.+?)\*\*\s+\*\s+\*Explanation:\*\s+(.+?)(?=\n\d+\.|$)/gs);
      
      if (questions) {
        questions.forEach((q, idx) => {
          const match = q.match(/\d+\.\s+\*\*([a-d])\.\s+(.+?)\*\*\s+\*\s+\*Explanation:\*\s+(.+)/s);
          if (match) {
            result.multipleChoice.push({
              questionNumber: idx + 1,
              answer: match[1].trim(),
              answerText: match[2].trim(),
              explanation: match[3].trim().replace(/\n/g, ' ')
            });
          }
        });
      }
    }

    // Fill in the Blanks
    if (section.includes('Fill in the Blanks')) {
      const questions = section.match(/\d+\.\s+(.+?)\s+\*\*(.+?)\*\*/g);
      
      if (questions) {
        questions.forEach(q => {
          const match = q.match(/(\d+)\.\s+(.+?)\s+\*\*(.+?)\*\*/);
          if (match) {
            result.fillInTheBlanks.push({
              questionNumber: parseInt(match[1]),
              question: match[2].trim(),
              answer: match[3].trim()
            });
          }
        });
      }
    }

    // True or False
    if (section.includes('True or False')) {
      const questions = section.match(/\d+\.\s+\*\*(\w+)\.\*\*\s+(.+?)(?=\n\d+\.|$)/gs);
      
      if (questions) {
        questions.forEach(q => {
          const match = q.match(/(\d+)\.\s+\*\*(\w+)\.\*\*\s+(.+)/s);
          if (match) {
            result.trueFalse.push({
              questionNumber: parseInt(match[1]),
              answer: match[2].trim(),
              explanation: match[3].trim().replace(/\n/g, ' ')
            });
          }
        });
      }
    }
  });

  console.log("result",result)
  return result;
}

