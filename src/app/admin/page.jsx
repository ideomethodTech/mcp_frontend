"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePlus2, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUploadBook, useGetBook } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bookName, setBookName] = useState("");
  const [bookUrl, setBookUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const uploadMutation = useUploadBook({
    onSuccess: () => {
      toast({
        title: "Book uploaded successfully",
        description: "Your book has been uploaded and is being processed.",
      });
      setIsDialogOpen(false);
      setBookName("");
      setBookUrl("");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload book",
        variant: "destructive",
      });
    },
  });

  const booksQuery = useGetBook();

  const { user } = useAuth();

  const handleUpload = async () => {
    const uid = user?.user.uid;

    if (!uid) {
      toast({
        title: "User ID not found",
        description: "Cannot determine user ID",
        variant: "destructive",
      });
      return;
    }

    if (!bookName || !bookUrl) {
      toast({
        title: "Missing information",
        description: "Please provide book name and book URL",
        variant: "destructive",
      });
      return;
    }

    // Call the upload API
    uploadMutation.mutate({
      book_name: bookName,
      book_url: bookUrl,
      uid: uid,
    });
  };

  const books = booksQuery.data?.content || [];

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-4">Admin Dashboard</h1>
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
                <CardDescription>Manage uploaded books, PDFs, and learning materials.</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus2 className="mr-2 h-4 w-4" /> Upload Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Book</DialogTitle>
                    <DialogDescription>
                      Enter the URL of an online PDF or document. It will be processed and indexed automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="Book Title"
                        className="col-span-3"
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="book_url" className="text-right">
                        Book URL
                      </Label>
                      <Input
                        id="book_url"
                        placeholder="https://example.com/book.pdf"
                        className="col-span-3"
                        value={bookUrl}
                        onChange={(e) => setBookUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpload} disabled={uploadMutation.isPending}>
                      {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {booksQuery.isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : booksQuery.isError ? (
                <div className="text-center p-8 text-destructive">Failed to load books</div>
              ) : books.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">No books uploaded yet. Add your first book.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Chapters</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.book_name}</TableCell>
                        <TableCell>
                          <a
                            href={book.book_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View PDF
                          </a>
                        </TableCell>
                        <TableCell>{book.chapters?.length || 0} chapters</TableCell>
                        <TableCell>{new Date(book.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Monitor logs, chat requests, and generation counts.</CardDescription>
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
              <CardDescription>Manage tools and enable/disable features.</CardDescription>
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
