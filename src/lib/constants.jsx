import {
  BookText,
  ClipboardList,
  FileText,
  KeyRound,
  Presentation,
  Shield,
  LayoutDashboard,
  MessageSquare,
  FileCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "An overview of all available tools and features.",
    itemtype: "tile",
  },
  {
    title: "Chat with Book",
    description: "Engage in real-time conversations with your learning materials.",
    href: "/chat",
    icon: MessageSquare,
    itemtype: "Chat",
  },
  {
    title: "Lesson Plan Generator",
    description: "Generate structured lesson plans for any topic or chapter.",
    href: "/lesson-plan",
    icon: ClipboardList,
    itemtype: "Lesson Plan",
  },
  {
    title: "Worksheet Generator",
    description: "Create diverse worksheets with various question types.",
    href: "/worksheet",
    icon: FileText,
    itemtype: "Worksheet",
  },
  {
    title: "Test Paper Generator",
    description: "Create comprehensive test papers with marks and duration.",
    href: "/test-paper",
    icon: FileCheck,
    itemtype: "Test Paper",
  },
  {
    title: "Answer Key Generator",
    description: "Automatically generate answer keys for your worksheets.",
    href: "/answer-key",
    icon: KeyRound,
    itemtype: "Answer Key",
  },
  {
    title: "PPT Generator",
    description: "Transform book chapters into engaging presentations.",
    href: "/ppt-generator",
    icon: Presentation,
    itemtype: "PPT",
  },
];

export const ITEM_TYPES = {
  TILE: "tile",
  CHAT: "Chat",
  LESSON_PLAN: "Lesson Plan",
  WORKSHEET: "Worksheet",
  TEST_PAPER: "Test Paper",
  ANSWER_KEY: "Answer Key",
  PPT: "PPT",
};

export const ADMIN_NAV_ITEM = {
  title: "Admin",
  href: "/admin",
  icon: Shield,
};

export const TOOLS = NAV_ITEMS.filter((item) => item.href !== "/");

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_IN_BLANK: "fill_in_blank",
  SHORT_ANSWER: "short_answer",
};

export function segregateQuestions(questions = []) {
  if (!Array.isArray(questions)) return { multipleChoice: [], trueFalse: [], fillInTheBlanks: [], shortAnswer: [], others: [] };
  
  return {
    multipleChoice: questions.filter((q) => {
      const type = (q.type || q.question_type || "").toLowerCase();
      return type === QUESTION_TYPES.MULTIPLE_CHOICE || type === "multiple choice" || type === "mcq";
    }),
    trueFalse: questions.filter((q) => {
      const type = (q.type || q.question_type || "").toLowerCase();
      return type === QUESTION_TYPES.TRUE_FALSE || type === "true false" || type === "true/false";
    }),
    fillInTheBlanks: questions.filter((q) => {
      const type = (q.type || q.question_type || "").toLowerCase();
      return type === QUESTION_TYPES.FILL_IN_BLANK || type === "fill in blank" || type === "fib" || type === "fill_in_the_blanks";
    }),
    shortAnswer: questions.filter((q) => {
      const type = (q.type || q.question_type || "").toLowerCase();
      return type === QUESTION_TYPES.SHORT_ANSWER || type === "short answer" || type === "sa";
    }),
    others: questions.filter((q) => {
      const type = (q.type || q.question_type || "").toLowerCase();
      const known = [
        QUESTION_TYPES.MULTIPLE_CHOICE, "multiple choice", "mcq",
        QUESTION_TYPES.TRUE_FALSE, "true false", "true/false",
        QUESTION_TYPES.FILL_IN_BLANK, "fill in blank", "fib", "fill_in_the_blanks",
        QUESTION_TYPES.SHORT_ANSWER, "short answer", "sa"
      ];
      // Include it if it's NOT in the known categories (this ensures no question is lost)
      return !known.includes(type);
    })
  };
}
