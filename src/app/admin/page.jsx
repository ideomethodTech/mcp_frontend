"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FilePlus2, Trash2, Loader2, Upload, Book, BookOpen,
  User, Calendar, CheckCircle2, AlertCircle, Edit2,
  X, Image as ImageIcon, FileText, CloudUpload
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Form State
  const [bookName, setBookName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("books");

  const booksQuery = useGetBook();
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
        description: error.response?.data?.message || "Failed to upload book",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setBookName("");
    setAuthorName("");
    setBookFile(null);
    setCoverImage(null);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "pdf") {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setBookFile(file);
    } else if (type === "image") {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      setCoverImage(file);
    }
  };

  const handleUpload = async () => {
    const uid = user?.user?.uid || user?.uid;

    if (!uid) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to upload books.",
        variant: "destructive",
      });
      return;
    }

    if (!bookName || !bookFile) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a book title and PDF file.",
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
      if (authorName) formData.append("author", authorName);
      // Backend might need update to handle cover images
      // if (coverImage) formData.append("cover", coverImage);

      uploadMutation.mutate(formData, {
        onSuccess: () => setIsUploading(false),
        onError: () => setIsUploading(false),
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: "A system error occurred during upload.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const books = booksQuery.data?.content || [];

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-10 space-y-10 bg-white min-h-screen font-sans">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 gap-12">
          <TabsTrigger
            value="books"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 text-gray-400 font-bold text-base pb-4 px-0 transition-all"
          >
            Book Management
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 text-gray-400 font-bold text-base pb-4 px-0 transition-all"
          >
            User Activity
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 text-gray-400 font-bold text-base pb-4 px-0 transition-all"
          >
            Tool Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-10 bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Books & Documents</CardTitle>
                  <CardDescription className="text-gray-400 font-medium mt-1 uppercase text-[10px] tracking-widest">
                    Manage all uploaded books, PDFs and learning resources.
                  </CardDescription>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white font-bold rounded-2xl px-6 h-14 shadow-xl shadow-indigo-100 transition-all gap-3">
                    <CloudUpload className="w-5 h-5" />
                    Upload Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0 border-none rounded-[32px] overflow-hidden shadow-2xl" hideClose>
                  <div className="flex flex-col h-[90vh] md:h-auto max-h-[90vh]">
                    <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-start">
                        <div>
                          <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Upload New Book</DialogTitle>
                          <DialogDescription className="text-gray-400 font-medium text-sm mt-2">Fill in the details and upload the book file.</DialogDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsDialogOpen(false)}
                          className="rounded-full bg-gray-50 text-gray-400 hover:text-gray-900"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="uppercase text-[10px] font-black text-gray-400 tracking-widest ml-1">Title</Label>
                          <Input
                            placeholder="Enter the book title"
                            className="bg-gray-50/50 border-gray-100 rounded-xl h-12 font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 transition-all"
                            value={bookName}
                            onChange={(e) => setBookName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="uppercase text-[10px] font-black text-gray-400 tracking-widest ml-1">Author</Label>
                          <Input
                            placeholder="Enter the author's name"
                            className="bg-gray-50/50 border-gray-100 rounded-xl h-12 font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 transition-all"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Cover Image Upload Area */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <Label className="uppercase text-[10px] font-black text-gray-400 tracking-widest">Cover Image</Label>
                          <span className="text-[10px] font-bold text-gray-300">JPG/PNG - Max 5mb</span>
                        </div>
                        <div className={cn(
                          "relative h-44 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-3 group overflow-hidden",
                          coverImage ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100"
                        )}>
                          {coverImage ? (
                            <div className="flex items-center gap-4 w-full px-6 py-4 bg-white/80 backdrop-blur-sm relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden">
                                <ImageIcon className="w-8 h-8 text-indigo-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-700 text-sm truncate">{coverImage.name}</p>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-tighter">{(coverImage.size / (1024 * 1024)).toFixed(1)} MB</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button onClick={() => setCoverImage(null)} className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors">Remove</button>
                                <label className="text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors">
                                  Replace image
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "image")} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                <CloudUpload className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-gray-400">
                                Drag & Drop your image here or <span className="text-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors">Click to browse</span>
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "image")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* PDF File Upload Area */}
                      <div className="space-y-3 pb-4">
                        <div className="flex justify-between items-end px-1">
                          <Label className="uppercase text-[10px] font-black text-gray-400 tracking-widest">Book File (PDF)</Label>
                          <span className="text-[10px] font-bold text-gray-300">PDF - Max 20mb</span>
                        </div>
                        <div className={cn(
                          "relative h-44 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-3 group overflow-hidden",
                          bookFile ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100"
                        )}>
                          {bookFile ? (
                            <div className="flex items-center gap-4 w-full px-6 py-4 bg-white/80 backdrop-blur-sm relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden">
                                <FileText className="w-8 h-8 text-indigo-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-700 text-sm truncate">{bookFile.name}</p>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-tighter">{(bookFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button onClick={() => setBookFile(null)} className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors">Remove</button>
                                <label className="text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors">
                                  Replace file
                                  <input type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e, "pdf")} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-gray-400">
                                Drag & Drop your PDF here or <span className="text-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors">Click to browse</span>
                              </p>
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, "pdf")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="font-bold text-gray-400 hover:text-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || uploadMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-12 transition-all gap-2 min-w-[140px]"
                      >
                        {isUploading || uploadMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {booksQuery.isLoading ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200">
                    <Book className="w-8 h-8" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No books uploaded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="hover:bg-transparent border-gray-100">
                        <TableHead className="font-extrabold text-gray-900 uppercase text-[10px] tracking-widest py-6 pl-10">Title</TableHead>
                        <TableHead className="font-extrabold text-gray-900 uppercase text-[10px] tracking-widest py-6">Author</TableHead>
                        <TableHead className="font-extrabold text-gray-900 uppercase text-[10px] tracking-widest py-6">Date Added</TableHead>
                        <TableHead className="font-extrabold text-gray-900 uppercase text-[10px] tracking-widest py-6">Status</TableHead>
                        <TableHead className="font-extrabold text-gray-900 uppercase text-[10px] tracking-widest py-6 text-right pr-10">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id} className="hover:bg-gray-50/30 transition-colors border-gray-50 group">
                          <TableCell className="py-6 pl-10">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-gray-700">{book.book_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-indigo-400/80 hover:text-indigo-600 transition-colors cursor-pointer py-6">Don Norman</TableCell>
                          <TableCell className="text-gray-400 font-bold text-xs py-6 tracking-tighter">{new Date(book.created_at).toISOString().split('T')[0]}</TableCell>
                          <TableCell className="py-6">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-[10px] tracking-widest uppercase",
                              book.chapters?.length > 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", book.chapters?.length > 0 ? "bg-emerald-500" : "bg-amber-500")} />
                              {book.chapters?.length > 0 ? "Published" : "Draft"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-10 py-6">
                            <div className="flex items-center justify-end gap-2 transition-all">
                              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-indigo-400 bg-indigo-50/30 hover:text-indigo-600 hover:bg-indigo-50 border border-indigo-100/50">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-rose-400 bg-rose-50/30 hover:text-rose-600 hover:bg-rose-50 border border-rose-100/50">
                                <Trash2 className="h-4 w-4" />
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

        <TabsContent value="activity" className="mt-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] p-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">User Activity Logging</CardTitle>
              <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Functionality coming soon</CardDescription>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] p-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Tool Configuration</CardTitle>
              <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Functionality coming soon</CardDescription>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}