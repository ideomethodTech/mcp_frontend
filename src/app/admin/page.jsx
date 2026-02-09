"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePlus2, Trash2, Loader2, Upload } from "lucide-react";
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
import { useUploadBook, useGetBook, useDeleteBook } from "@/lib/api/queries";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bookName, setBookName] = useState("");
  const [bookFile, setBookFile] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadBook({
    onSuccess: () => {
      toast({
        title: "Book uploaded successfully",
        description: "Your book has been uploaded and is being processed.",
      });
      setIsDialogOpen(false);
      setBookName("");
      setBookFile(null);
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

  const [deletingBookId, setDeletingBookId] = useState(null);
  const { user } = useAuth();
  const booksQuery = useGetBook(user?.user?.uid || user?.uid);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setBookFile(file);
    }
  };

  const forceSyncFirebase = null; // Removed Auth sync

  const handleUpload = async () => {
    const uid = user?.user?.uid || user?.uid;
    console.log("Admin Upload Debug - User Object:", user);
    console.log("Admin Upload Debug - Detected UID:", uid);

    if (!uid) {
      toast({
        title: "User ID not found",
        description: "Cannot determine user ID",
        variant: "destructive",
      });
      return;
    }

    if (!bookName || !bookFile) {
      toast({
        title: "Missing information",
        description: "Please provide book name and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", bookName);
      formData.append("uid", uid);
      formData.append("file", bookFile);

      uploadMutation.mutate(formData, {
        onSuccess: () => {
          setIsUploading(false);
        },
        onError: () => {
          setIsUploading(false);
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const deleteMutation = useDeleteBook({
    onMutate: (variables) => {
      setDeletingBookId(variables.book_id);
    },
    onSuccess: () => {
      toast({
        title: "Book deleted",
        description: "The book has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      const serverMessage = error.response?.data?.message || error.response?.data?.detail;
      toast({
        title: "Deletion failed",
        description: serverMessage || "Failed to delete book. You may not have administrative privileges.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingBookId(null);
    },
  });

  const handleDeleteBook = (book) => {
    const currentUid = user?.user?.uid || user?.uid;
    const bookId = book.id || book.book_id;

    if (!currentUid) return;
    if (!bookId) {
      toast({ title: "Error", description: "Book ID not found", variant: "destructive" });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${book.book_name}"?`)) {
      // Use the currently logged-in admin's UID for the path to ensure authorization
      deleteMutation.mutate({ uid: currentUid, book_id: bookId });
    }
  };

  const books = booksQuery.data?.content || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        {user && (
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Role: {user?.user?.role || "Unknown"}
            </span>
          </div>
        )}
      </div>
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
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Upload Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Book</DialogTitle>
                    <DialogDescription>
                      Select a PDF file to upload. It will be stored in Firebase and processed automatically.
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
                        disabled={isUploading || uploadMutation.isPending}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="book_file" className="text-right">
                        PDF File
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="book_file"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          disabled={isUploading || uploadMutation.isPending}
                        />
                        {bookFile && (
                          <div className="text-sm mt-2">
                            <p className="text-muted-foreground font-medium">Selected: {bookFile.name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleUpload}
                      disabled={isUploading || uploadMutation.isPending}
                    >
                      {(isUploading || uploadMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isUploading
                        ? "Uploading..."
                        : uploadMutation.isPending
                          ? "Processing..."
                          : "Upload"}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteBook(book)}
                            disabled={deletingBookId !== null}
                          >
                            {deletingBookId === (book.id || book.book_id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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