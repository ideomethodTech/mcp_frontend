import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * A reusable hook for handling history item deletions with optimistic UI.
 * The item is removed from the cache immediately when delete is clicked.
 * - On success → stays removed, server re-synced in background.
 * - On 404    → stays removed (item was already gone server-side), no error shown.
 * - On other error → item is restored to the cache and an error toast is shown.
 */
export function useHistoryDelete({
    useMutation,
    queryKeyToInvalidate,
    idPropertyName = 'id',
    onDeleteSuccess = () => { }
}) {
    const [deletingId, setDeletingId] = useState(null);
    const queryClient = useQueryClient();

    // ─── Helper: build an updated cache snapshot with the item removed ───────
    const buildFilteredCache = (oldData, deletedId) => {
        if (!oldData) return oldData;
        const targetId = String(deletedId);
        let matchCount = 0;

        const filterOut = (arr) => {
            if (!Array.isArray(arr)) return arr;
            return arr.filter((item) => {
                const itemIds = [
                    item.id,
                    item.lesson_plan_id,
                    item.lessonPlanId,
                    item.worksheet_id,
                    item.worksheetId,
                    item.answer_key_id,
                    item.answerKeyId,
                    item.test_paper_id,
                    item.testPaperId,
                    item.paper_id,
                    item.paperId,
                    item.chat_id,
                    item.chatId
                ].filter(Boolean).map(String);

                // If any of the item's IDs match the target, filter it out
                const isMatch = itemIds.some(id => id === targetId);
                if (isMatch) matchCount++;
                return !isMatch;
            });
        };

        let resultData = oldData;
        if (Array.isArray(oldData)) {
            resultData = filterOut(oldData);
        } else {
            const newData = { ...oldData };
            let changed = false;

            Object.keys(oldData).forEach(key => {
                if (Array.isArray(oldData[key])) {
                    const filtered = filterOut(oldData[key]);
                    if (filtered.length !== oldData[key].length) {
                        newData[key] = filtered;
                        changed = true;
                    }
                }
            });
            if (changed) resultData = newData;
        }

        console.log(`[useHistoryDelete] Build cache removal: Filtered out ${matchCount} items matching ID ${targetId}. Current data keys:`,
            typeof resultData === 'object' ? Object.keys(resultData) : 'array');

        return resultData;
    };

    const mutation = useMutation({
        onSuccess: (data, variables) => {
            setDeletingId(null);
            onDeleteSuccess(variables);
            toast.success('Item deleted successfully');

            // Delay invalidation slightly to avoid eventual consistency "ghost" items
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }, 1500);
        },
        onError: (error, variables, context) => {
            const status = error?.response?.status;
            const currentId = context?.id || variables[idPropertyName];

            if (status === 404) {
                console.warn('[useHistoryDelete] 404 — item already gone server-side. Enforcing optimistic removal.');
                queryClient.setQueriesData(
                    { queryKey: queryKeyToInvalidate },
                    (oldData) => buildFilteredCache(oldData, currentId)
                );
                setDeletingId(null);
                onDeleteSuccess(variables);
                return;
            }

            // Real error — restore the cached snapshot 
            if (context?.previousData) {
                console.log('[useHistoryDelete] Restoring cache due to error.');
                queryClient.setQueryData(queryKeyToInvalidate, context.previousData);
            }

            console.error('[useHistoryDelete] Deletion failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete item');
            setDeletingId(null);
        },
    });

    const handleDelete = useCallback((item, additionalParams = {}) => {
        const id =
            item.lesson_plan_id ||
            item.lessonPlanId ||
            item.worksheet_id ||
            item.worksheetId ||
            item.answer_key_id ||
            item.answerKeyId ||
            item.test_paper_id ||
            item.testPaperId ||
            item.paper_id ||
            item.paperId ||
            item.chat_id ||
            item.chatId ||
            item.id;

        if (!id) {
            toast.warning('Attempted to delete item with no ID');
            return;
        }

        setDeletingId(id);

        // ── Snapshot current cache for potential rollback ──────────────────
        const previousData = queryClient.getQueryData(queryKeyToInvalidate);

        // ── Optimistically remove the item from the cache immediately ──────
        queryClient.setQueriesData(
            { queryKey: queryKeyToInvalidate },
            (oldData) => buildFilteredCache(oldData, id)
        );

        const mutationVariables = {
            [idPropertyName]: id,
            ...additionalParams
        };

        // Pass the snapshot and id as context
        mutation.mutate(mutationVariables, { context: { previousData, id } });
    }, [idPropertyName, mutation, queryKeyToInvalidate, queryClient]);

    return {
        handleDelete,
        deletingId,
        isDeleting: mutation.isPending
    };
}
