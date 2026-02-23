"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FilePlus2,
  Trash2,
  Loader2,
  Upload,
  BookOpen,
  User,
  Settings,
  Edit2,
  Clock,
  Plus,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const [bookName, setBookName] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState(null);

  const resetForm = () => {
    setBookName("");
    setBookAuthor("");
    setBookFile(null);
    setCoverImage(null);
  };

  const uploadMutation = useUploadBook({
    onSuccess: () => {
      toast({
        title: "Book uploaded successfully",
        description: "Your book has been uploaded and is being processed.",
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload book.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const booksQuery = useGetBook(user?.user?.uid || user?.uid);

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
      toast({
        title: "Deletion failed",
        description: error.response?.data?.message || "Failed to delete book.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingBookId(null);
    },
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'pdf' && file.type !== "application/pdf") {
        toast({ title: "Invalid file type", description: "Please upload a PDF file", variant: "destructive" });
        return;
      }
      if (type === 'pdf') setBookFile(file);
      else setCoverImage(file);
    }
  };

  const handleUpload = async () => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) {
      toast({ title: "User ID not found", description: "Please log in again.", variant: "destructive" });
      return;
    }

    if (!bookName || !bookFile) {
      toast({ title: "Missing information", description: "Please provide book name and select a PDF file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", bookName);
      formData.append("author", bookAuthor);
      formData.append("uid", uid);
      formData.append("file", bookFile);
      if (coverImage) formData.append("cover", coverImage);

      uploadMutation.mutate(formData);
    } catch (error) {
      setIsUploading(false);
      toast({ title: "Upload failed", description: "An error occurred during upload", variant: "destructive" });
    }
  };

  const handleDeleteBook = (book) => {
    const currentUid = user?.user?.uid || user?.uid;
    const bookId = book.id || book.book_id;

    if (!currentUid) return;
    if (!bookId) {
      toast({ title: "Error", description: "Book ID not found", variant: "destructive" });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${book.book_name}"?`)) {
      deleteMutation.mutate({ uid: currentUid, book_id: bookId });
    }
  };

  const books = booksQuery.data?.content || [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-10">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="flex w-max md:w-full justify-start h-auto p-0 bg-transparent border-b border-gray-200 rounded-none mb-6 md:mb-8 min-w-full">
              <TabsTrigger
                value="books"
                className="px-6 md:px-8 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-400 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none bg-transparent whitespace-nowrap"
              >
                Book Management
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="px-6 md:px-8 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-400 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none bg-transparent whitespace-nowrap"
              >
                User Activity
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="px-6 md:px-8 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-400 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none bg-transparent whitespace-nowrap"
              >
                Tool Configuration
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="books" className="mt-0 outline-none">
            <Card className="border-none shadow-sm bg-white rounded-2xl md:rounded-3xl overflow-hidden mt-4">
              <CardHeader className="p-5 md:p-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:space-y-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Books & Documents</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium text-gray-400">Manage resources.</CardDescription>
                  </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-5 h-auto flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 text-xs md:text-sm">
                      <Upload className="w-4 h-4" />
                      Upload Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-[600px] p-0 border-none rounded-2xl md:rounded-3xl overflow-hidden overflow-y-auto max-h-[90vh]">
                    <div className="p-6 md:p-8">
                      <DialogHeader className="mb-6 md:mb-8">
                        <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">Upload New Book</DialogTitle>
                        <DialogDescription className="text-sm md:text-base font-medium text-gray-400">
                          Fill in details and upload file.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 md:gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs md:text-sm font-bold text-gray-700">Title</Label>
                            <Input
                              id="title"
                              placeholder="Book title"
                              className="bg-gray-50 border-none rounded-xl h-11 md:h-12 text-sm"
                              value={bookName}
                              onChange={(e) => setBookName(e.target.value)}
                              disabled={isUploading || uploadMutation.isPending}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="author" className="text-xs md:text-sm font-bold text-gray-700">Author</Label>
                            <Input
                              id="author"
                              placeholder="Author name"
                              className="bg-gray-50 border-none rounded-xl h-11 md:h-12 text-sm"
                              value={bookAuthor}
                              onChange={(e) => setBookAuthor(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Cover Image</Label>
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest px-0.5">JPG/PNG - Max 5mb</p>
                          <div
                            className="border-2 border-dashed border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative"
                            onClick={() => document.getElementById('cover-upload').click()}
                          >
                            <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                            {coverImage ? (
                              <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                                  <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-bold text-gray-900 truncate">{coverImage.name}</p>
                                  <p className="text-[10px] md:text-xs text-gray-400">{(coverImage.size / 1024 / 1024).toFixed(1)} MB</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:text-indigo-700 text-xs flex-shrink-0" onClick={(e) => { e.stopPropagation(); setCoverImage(null); }}>Remove</Button>
                              </div>
                            ) : (
                              <>
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 text-center">
                                  <span className="hidden sm:inline">Drag & Drop or </span><span className="text-indigo-600 font-bold">Browse Image</span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Book File (PDF)</Label>
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest px-0.5">PDF - Max 20mb</p>
                          <div
                            className="border-2 border-dashed border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('pdf-upload').click()}
                          >
                            <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e, 'pdf')} />
                            {bookFile ? (
                              <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                                  <FileText className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-bold text-gray-900 truncate">{bookFile.name}</p>
                                  <p className="text-[10px] md:text-xs text-gray-400">{(bookFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:text-indigo-700 text-xs flex-shrink-0" onClick={(e) => { e.stopPropagation(); setBookFile(null); }}>Remove</Button>
                              </div>
                            ) : (
                              <>
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 text-center">
                                  <span className="hidden sm:inline">Drag & Drop or </span><span className="text-indigo-600 font-bold">Browse PDF</span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto font-bold text-gray-500 h-11 md:h-12 px-6 order-2 sm:order-1">Cancel</Button>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || uploadMutation.isPending}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-10 h-11 md:h-12 flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100 order-1 sm:order-2"
                        >
                          {(isUploading || uploadMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {booksQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 md:p-20 gap-4">
                    <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-indigo-600" />
                    <p className="text-xs md:text-sm font-bold text-gray-400">Loading resources...</p>
                  </div>
                ) : booksQuery.isError ? (
                  <div className="text-center p-12 md:p-20 text-red-500 font-bold text-sm">Failed to load books. Please try again.</div>
                ) : books.length === 0 ? (
                  <div className="text-center p-12 md:p-20 flex flex-col items-center gap-4 text-sm">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-bold text-gray-900">No books uploaded yet</p>
                      <p className="text-xs md:text-sm text-gray-400">Your library is empty. Upload your first book.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-none">Title</TableHead>
                          <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-none whitespace-nowrap">Author</TableHead>
                          <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-none whitespace-nowrap">Date Added</TableHead>
                          <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-none">Status</TableHead>
                          <TableHead className="px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest border-none text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.map((book) => (
                          <TableRow key={book.id} className="group hover:bg-gray-50/30 border-b border-gray-50 transition-colors">
                            <TableCell className="px-5 md:px-8 py-4 md:py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <span className="font-bold text-xs md:text-sm text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{book.book_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 md:py-6">
                              <span className="text-[11px] md:text-sm font-bold text-indigo-500/80 hover:text-indigo-600 cursor-pointer transition-colors whitespace-nowrap">
                                {book.author || "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 md:py-6">
                              <span className="text-[11px] md:text-sm font-bold text-gray-400 whitespace-nowrap">
                                {new Date(book.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 md:py-6">
                              <Badge className="bg-green-50 text-green-600 border-none shadow-none px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 md:gap-1.5 w-fit whitespace-nowrap">
                                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500" />
                                Published
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 md:px-8 py-4 md:py-6 text-right">
                              <div className="flex items-center justify-end gap-1 md:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white shadow-sm transition-all active:scale-95">
                                  <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 md:h-9 md:w-9 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white shadow-sm transition-all active:scale-95"
                                  onClick={() => handleDeleteBook(book)}
                                  disabled={deletingBookId !== null}
                                >
                                  {deletingBookId === (book.id || book.book_id) ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-0 outline-none">
            <Card className="border-none shadow-sm bg-white rounded-2xl md:rounded-3xl overflow-hidden mt-4">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-900">User Activity</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium text-gray-400">Track logs.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12 md:p-20 flex flex-col items-center gap-6 justify-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <Clock className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Coming Soon</h3>
                  <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto mt-2">Activity monitoring is being developed.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-0 outline-none">
            <Card className="border-none shadow-sm bg-white rounded-2xl md:rounded-3xl overflow-hidden mt-4">
              <CardHeader className="p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Settings className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-900">Tool Configuration</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium text-gray-400">Manage tool settings.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12 md:p-20 flex flex-col items-center gap-6 justify-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <Clock className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Coming Soon</h3>
                  <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto mt-2">Control tool availability.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
