"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePlus2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";
import { useGetDocuments, useUploadDocument, useDeleteDocument } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { data: documents, isLoading } = useGetDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [deletingId, setDeletingId] = useState(null);

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get("file");

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // ADD THIS VALIDATION
    const allowedTypes = [".pdf", ".txt", ".doc", ".docx"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      toast.error(`Only ${allowedTypes.join(", ")} files are allowed`);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      // Send ONLY the file, not an object
      await uploadMutation.mutateAsync(file);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploadDialogOpen(false);
      event.target.reset();
    } catch (error) {
      console.log("Failed to upload document");
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(documentId);
    try {
      await deleteMutation.mutateAsync(documentId);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeletingId(null);
    } catch (error) {
      setDeletingId(null);
      console.log("Failed to delete document");
    }
  };
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
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus2 className="mr-2 h-4 w-4" /> Upload Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Book</DialogTitle>
                    <DialogDescription>
                      Upload a new PDF or text file. It will be processed and indexed automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input id="title" name="title" placeholder="Book Title" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="author" className="text-right">
                          Author
                        </Label>
                        <Input id="author" name="author" placeholder="Author Name" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                          File
                        </Label>
                        <Input id="file" name="file" type="file" className="col-span-3" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
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
                  {isLoading ? (
                    <TableRow key="loading">
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : documents && documents.length > 0 ? (
                    documents.map((document, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{document.name || document.filename}</TableCell>
                        <TableCell>{document.author || "Unknown Author"}</TableCell>
                        <TableCell>{document.subject || "General"}</TableCell>
                        <TableCell>{document.grade || "All Grades"}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500/80 hover:bg-green-500/90">
                            {document.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(document.document_id)}
                            disabled={deletingId === document.document_id}
                          >
                            {deletingId === document.document_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key="empty">
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No documents uploaded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
