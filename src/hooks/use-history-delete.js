import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * A reusable hook for handling history item deletions.
 * @param {Object} options - Configuration options for deletion.
 * @param {Function} options.useMutation - The React Query mutation hook to use.
 * @param {Array} options.queryKeyToInvalidate - The query key to invalidate on success.
 * @param {string} options.idPropertyName - The property name of the ID in the mutation object.
 * @param {Function} options.onDeleteSuccess - Success callback.
 */
export function useHistoryDelete({
    useMutation,
    queryKeyToInvalidate,
    idPropertyName = 'id',
    onDeleteSuccess = () => { }
}) {
    const [deletingId, setDeletingId] = useState(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        onSuccess: (data, variables) => {
            toast.success('Item deleted successfully');
            queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            setDeletingId(null);
            onDeleteSuccess(variables);
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete item');
            setDeletingId(null);
        },
    });

    const handleDelete = useCallback((item, additionalParams = {}) => {
        const id = item.id || item.test_paper_id || item.paper_id || item.chat_id || item.lesson_plan_id || item.worksheet_id || item.answer_key_id;

        if (!id) {
            toast.warning('Attempted to delete item with no ID');
            return;
        }

        setDeletingId(id);

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
