import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TOOLS } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Welcome to the AI Learning Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          Your intelligent partner for creating and understanding educational content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.href} className="flex flex-col">
              <CardHeader className='flex-1'>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {tool.title}
                  </CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={tool.href}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}