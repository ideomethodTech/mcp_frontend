import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export function useHistoryDelete({ 
    useMutation, 
    queryKeyToInvalidate, 
    idPropertyName = 'id',
    onDeleteSuccess = () => {} 
}) {
    const [deletingId, setDeletingId] = useState(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    /**
     * Helper to safely remove an item from various cache structures.
     * Checks ALL possible ID fields to ensure thorough removal regardless of backend structure.
     */
    const buildFilteredCache = (oldData, targetId) => {
        if (!oldData) return oldData;
        const targetIdStr = String(targetId);
        let matchCount = 0;

        const filterOut = (list) => {
            return list.filter(item => {
                const possibleIds = [
                    item.id,
                    item.worksheet_id,
                    item.worksheetId,
                    item.answer_key_id,
                    item.answerKeyId,
                    item.lesson_plan_id,
                    item.lessonPlanId,
                    item.chat_id,
                    item.chatId,
                    item.paper_id,
                    item.paperId,
                    item.test_paper_id,
                    item.testPaperId,
                    item.id_paper
                ].filter(val => val !== undefined && val !== null).map(String);
                
                const isMatch = possibleIds.includes(targetIdStr);
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

            // Deep clean all array properties (like 'content', 'data', 'papers', 'lesson_plans')
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

        if (matchCount > 0) {
            console.log(`[useHistoryDelete] Cache filter: Successfully hidden ${matchCount} local matches for ID ${targetIdStr}.`);
        }
        return resultData;
    };

    const mutation = useMutation({
        onMutate: async (variables) => {
            // Priority for idPropertyName, fall back to .id
            const currentId = variables[idPropertyName] || variables.id;
            if (!currentId) return null;

            console.log(`[useHistoryDelete] Mutating ID: ${currentId}`);
            setDeletingId(currentId);

            // Cancel outgoing refetches so they don't overwrite our optimistic update
            const keys = Array.isArray(queryKeyToInvalidate) && Array.isArray(queryKeyToInvalidate[0]) 
                ? queryKeyToInvalidate 
                : [queryKeyToInvalidate];

            await Promise.all(keys.map(key => 
                queryClient.cancelQueries({ queryKey: key, exact: false })
            ));

            // Snapshot current state for potential rollback
            const snapshots = keys.map(key => ({
                key,
                data: queryClient.getQueryData(key)
            }));

            // Optimistically update ALL matched keys
            keys.forEach(key => {
                queryClient.setQueriesData(
                    { queryKey: key },
                    (oldData) => buildFilteredCache(oldData, currentId)
                );
            });

            return { snapshots, id: currentId };
        },
        onSuccess: (data, variables) => {
            setDeletingId(null);
            onDeleteSuccess(variables);
            
            toast({
                title: 'Success',
                description: 'Deleted successfully'
            });

            // Re-sync with server after a delay (ensuring DB deletion has propagated)
            const keys = Array.isArray(queryKeyToInvalidate) && Array.isArray(queryKeyToInvalidate[0]) 
                ? queryKeyToInvalidate 
                : [queryKeyToInvalidate];
            
            setTimeout(() => {
                keys.forEach(key => {
                    queryClient.invalidateQueries({ queryKey: key, exact: false });
                });
            }, 5000); // 5 seconds is safer for slower backends
        },
        onError: (error, variables, context) => {
            console.error('[useHistoryDelete] Deletion failed:', error);
            const status = error?.response?.status;
            
            // 404 means it's already gone, so we treat it as success locally
            if (status === 404) {
                setDeletingId(null);
                onDeleteSuccess(variables);
                return;
            }

            // Rollback optimistic changes if request failed
            if (context?.snapshots) {
                context.snapshots.forEach(({ key, data }) => {
                    queryClient.setQueryData(key, data);
                });
            }

            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete. Please try again.',
                variant: 'destructive'
            });
            setDeletingId(null);
        },
    });

    const handleDelete = useCallback((item, additionalParams = {}) => {
        // Detect the best ID to send to the backend
        const id = item[idPropertyName] || item.id || item.worksheet_id || item.answer_key_id || item.lesson_plan_id || item.chat_id || item.paper_id || item.test_paper_id;
        
        if (!id) {
            console.warn('[useHistoryDelete] Item has no detectable ID:', item);
            return;
        }

        const mutationVariables = {
            [idPropertyName]: id,
            ...additionalParams
        };

        mutation.mutate(mutationVariables);
    }, [idPropertyName, mutation]);

    return {
        handleDelete,
        deletingId,
        isDeleting: mutation.isPending
    };
}
