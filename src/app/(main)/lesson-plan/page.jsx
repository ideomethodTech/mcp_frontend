'use client';

import { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import {
  useCreateLessonPlan,
  useDeleteLessonPlan,
  useGetBook,
  useUserLessonPlan
} from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { getNavItemByUrl } from "@/app/utils";
import { ToolPageLayout } from "@/components/layout/tool-page-layout";
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
    <ToolPageLayout
      title={navItem.title}
      description={navItem.description}
      icon={BookOpen}
      isLoading={isGenerating || lpLoading}
      loadingTitle="Processing..."
      loadingDescription="Please wait while we prepare your lesson plan."
      historyProps={{
        item: navItem?.itemtype || 'Lesson Plan',
        selectedItem: selectedLessonPlan,
        setSelectedItem: (item) => {
          setSelectedLessonPlan(item);
          setGeneratedData(null); // Clear generated view when selecting from history
        },
        historyData: userLP?.content || [],
        onDelete: handleDelete,
        deletingId: deletingId,
        isLoading: lpLoading,
      }}
    >
      {selectedLessonPlan ? (
        <LessonPlanItem item={selectedLessonPlan} isgenrated={false} />
      ) : generatedData ? (
        <LessonPlanItem item={generatedData} isgenrated={true} />
      ) : (
        <LessonPlanForm onGenerate={handleGenerate} data={bookData?.content} />
      )}
    </ToolPageLayout>
  );
}
