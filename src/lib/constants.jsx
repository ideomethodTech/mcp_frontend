
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
    },
    {
      title: 'Chat with Book',
      description: 'Engage in real-time conversations with your learning materials.',
      href: '/chat',
      icon: MessageSquare,
    },
    {
      title: 'Lesson Plan Generator',
      description: 'Generate structured lesson plans for any topic or chapter.',
      href: '/lesson-plan',
      icon: ClipboardList,
    },
    {
      title: 'Worksheet Generator',
      description: 'Create diverse worksheets with various question types.',
      href: '/worksheet',
      icon: FileText,
    },
    {
      title: 'Answer Key Generator',
      description: 'Automatically generate answer keys for your worksheets.',
      href: '/answer-key',
      icon: KeyRound,
    },
    {
      title: 'PPT Generator',
      description: 'Transform book chapters into engaging presentations.',
      href: '/ppt-generator',
      icon: Presentation,
    },
  ];
  
  export const ADMIN_NAV_ITEM = {
    title: 'Admin',
    href: '/admin',
    icon: Shield,
  };
  
  export const TOOLS = NAV_ITEMS.filter(item => item.href !== '/');
  