'use client';

import { useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import History from '@/app/componentsV2/ui/history';
import {
  useCreateLessonPlan,
  useDeleteLessonPlan,
  useGetBook,
  useUserLessonPlan
} from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { getNavItemByUrl } from '@/app/utils';
import useApiStore from '@/store/useApiStore';

// Components
import LessonPlanItem from './components/LessonPlanItem';
import { LessonPlanForm } from '@/components/lesson-plan/lesson-plan-form';

export default function LessonPlanPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const queryClient = useQueryClient();
  const { setLessonPlanStatus } = useApiStore();

  // State
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Queries
  const { data: userLP, isLoading: lpLoading } = useUserLessonPlan(uid, {
    enabled: !!uid,
  });
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Mutations
  const { mutate: generateLessonPlan, isPending: isGenerating } = useCreateLessonPlan({
    onMutate: () => setLessonPlanStatus('loading'),
    onSuccess: (data) => {
      setGeneratedData(data.lesson_plan);
      setLessonPlanStatus('success');
      if (uid) {
        queryClient.invalidateQueries({ queryKey: ['lp', uid] });
      }
    },
    onError: () => setLessonPlanStatus('error'),
  });

  const { mutate: deleteLessonPlanMutation } = useDeleteLessonPlan({
    onSuccess: (_, variables) => {
      setDeletingId(null);
      setLessonPlanStatus('success');
      queryClient.invalidateQueries({ queryKey: ['lp', uid] });
      if (selectedLessonPlan?.id === variables.lesson_plan_id) {
        setSelectedLessonPlan(null);
      }
    },
    onError: () => {
      setDeletingId(null);
      setLessonPlanStatus('error');
    },
  });

  const handleGenerate = (book, chapter) => {
    if (!uid || !book) return;
    generateLessonPlan({
      book_id: book.id,
      chapter: chapter,
      uid: uid,
      weeks: 2, // Default to 2 weeks
    });
  };

  const handleDelete = (item) => {
    if (!item?.id) return;
    setDeletingId(item.id);
    deleteLessonPlanMutation({ lesson_plan_id: item.id });
  };

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6 px-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-lg">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {navItem?.title || 'Lesson Plan Generator'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {navItem?.description || 'Generate structured lesson plans for any topic or chapter.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar History */}
        <History
          item={navItem?.itemtype || 'Lesson Plan'}
          selectedItem={selectedLessonPlan}
          setSelectedItem={(item) => {
            setSelectedLessonPlan(item);
            setGeneratedData(null); // Clear generated view when selecting from history
          }}
          historyData={userLP?.content || []}
          onDelete={handleDelete}
          deletingId={deletingId}
        />

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isGenerating || lpLoading ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-card rounded-2xl border border-border">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Processing...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we prepare your lesson plan.</p>
            </div>
          ) : selectedLessonPlan ? (
            <LessonPlanItem item={selectedLessonPlan} isgenrated={false} />
          ) : generatedData ? (
            <LessonPlanItem item={generatedData} isgenrated={true} />
          ) : bookLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <LessonPlanForm
              onGenerate={handleGenerate}
              data={bookData?.content}
            />
          )}
        </div>
      </div>
    </div>
  );
}
