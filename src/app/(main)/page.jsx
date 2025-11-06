import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TOOLS } from '@/lib/constants';

export default function DashboardPage() {
  // Filter to show only the first 3 tools in the Explore Tools section
  const featuredTools = TOOLS.slice(0, 3);

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-12 border border-border/50 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            ✨ AI-Powered Educational Tools
          </div>
          <h1 className="text-5xl md:text-6xl py-1.5 font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Welcome to AI Learning Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Transform your educational content creation with intelligent tools designed for modern educators and learners.
          </p>
        </div>
      </div>

      {/* Explore Tools Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Tools</h2>
          <p className="text-gray-600">
            Choose a tool to get started with AI-powered content creation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="flex flex-col items-center justify-center
          relative h-full p-8 rounded-2xl bg-card border border-border/50
          transition-all duration-500 ease-out
          hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30
          shadow-md overflow-hidden backdrop-blur-sm ">

                  <CardHeader className="flex flex-col space-y-4">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent mb-6 self-start group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-primary/30">
                      <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50 group-hover:border-primary/20 transition-colors duration-300">
                      <span className="text-primary font-semibold text-sm">Explore Tool</span>
                      <div className="flex items-center gap-1 text-primary">
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}