import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FilePlus2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    subject: 'Literature',
    grade: 'Grade 11',
    status: 'Active',
  },
  {
    title: 'Introduction to Algebra',
    author: 'Jane Doe',
    subject: 'Mathematics',
    grade: 'Grade 8',
    status: 'Active',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    subject: 'Science',
    grade: 'Grade 12',
    status: 'Processing',
  },
  {
    title: 'World History: Ancient Civilizations',
    author: 'John Smith',
    subject: 'History',
    grade: 'Grade 9',
    status: 'Error',
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-4">
        Admin Dashboard
      </h1>
      <Tabs defaultValue="books">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="books">Book Management</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="config">Tool Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Books & Documents</CardTitle>
                <CardDescription>
                  Manage uploaded books, PDFs, and learning materials.
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button><FilePlus2 className="mr-2 h-4 w-4" /> Upload Book</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Book</DialogTitle>
                    <DialogDescription>
                      Upload a new PDF or text file. It will be processed and indexed automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" placeholder="Book Title" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="author" className="text-right">Author</Label>
                      <Input id="author" placeholder="Author Name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">File</Label>
                        <Input id="file" type="file" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.title}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.subject}</TableCell>
                      <TableCell>{book.grade}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            book.status === 'Active'
                              ? 'default'
                              : book.status === 'Processing'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={book.status === 'Active' ? 'bg-green-500/80 hover:bg-green-500/90' : ''}
                        >
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                Monitor logs, chat requests, and generation counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              <p>User activity monitoring is coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Tool Configuration</CardTitle>
              <CardDescription>
                Manage tools and enable/disable features.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Tool configuration options are coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
