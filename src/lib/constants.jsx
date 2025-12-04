
import {
  BookText,
  ClipboardList,
  FileText,
  KeyRound,
  Presentation,
  Shield,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'An overview of all available tools and features.',
    itemtype: 'tile'
  },
  {
    title: 'Chat with Book',
    description: 'Engage in real-time conversations with your learning materials.',
    href: '/chat',
    icon: MessageSquare,
    itemtype: 'Chat'

  },
  {
    title: 'Lesson Plan Generator',
    description: 'Generate structured lesson plans for any topic or chapter.',
    href: '/lesson-plan',
    icon: ClipboardList,
    itemtype: 'Lesson Plan'

  },
  {
    title: 'Worksheet Generator',
    description: 'Create diverse worksheets with various question types.',
    href: '/worksheet',
    icon: FileText,
    itemtype: 'Worksheet'

  },
  {
    title: 'Answer Key Generator',
    description: 'Automatically generate answer keys for your worksheets.',
    href: '/answer-key',
    icon: KeyRound,
    itemtype: 'Answer Key'

  },
  {
    title: 'PPT Generator',
    description: 'Transform book chapters into engaging presentations.',
    href: '/ppt-generator',
    icon: Presentation,
    itemtype: 'PPT'

  },
];

export const ADMIN_NAV_ITEM = {
  title: 'Admin',
  href: '/admin',
  icon: Shield,
};

export const TOOLS = NAV_ITEMS.filter(item => item.href !== '/');

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_IN_BLANK: "fill_in_blank",
  SHORT_ANSWER: "short_answer"
};

export function segregateQuestions(questions = []) {
  return {
    multipleChoice: questions.filter(
      (q) => q.type === QUESTION_TYPES.MULTIPLE_CHOICE
    ),
    trueFalse: questions.filter(
      (q) => q.type === QUESTION_TYPES.TRUE_FALSE
    ),
    fillInTheBlanks: questions.filter(
      (q) => q.type === QUESTION_TYPES.FILL_IN_BLANK
    ),
    shortAnswer: questions.filter(
      (q) => q.type === QUESTION_TYPES.SHORT_ANSWER
    ),
  };
}