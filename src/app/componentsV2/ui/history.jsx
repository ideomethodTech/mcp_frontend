import React from 'react';
import { File, Loader, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const History = ({
  selectedItem,
  setSelectedItem,
  historyData = [],
  item = "Item",
  isChat = false,
  onDelete,
  deletingId,
  isLoading = false,
}) => {

  const historyItem = ({ item: currentItem, selectedItem, setSelectedItem, stableKey }) => {
    // Correct selection check
    const isSelected = String(selectedItem?.id) === String(currentItem.id) || 
                       String(selectedItem?.worksheet_id) === String(currentItem.worksheet_id) || 
                       String(selectedItem?.answer_key_id) === String(currentItem.answer_key_id) ||
                       String(selectedItem?.lesson_plan_id) === String(currentItem.lesson_plan_id) ||
                       String(selectedItem?.paper_id) === String(currentItem.paper_id);

    // Correct delete state check
    const currentDeletingId = String(deletingId);
    const itemIds = [
      currentItem.id, 
      currentItem.worksheet_id, 
      currentItem.answer_key_id, 
      currentItem.lesson_plan_id, 
      currentItem.paper_id, 
      currentItem.test_paper_id, 
      currentItem.chat_id
    ].map(String);
    
    const isDeleting = deletingId && itemIds.includes(currentDeletingId);

    return (
      <div key={stableKey} className="flex items-start gap-2">
        <button
          onClick={() => {
            setSelectedItem(currentItem);
          }}
          className={`flex-1 min-w-0 text-left p-2 rounded-lg border ${isSelected
            ? 'bg-primary/10 border-primary'
            : 'hover:bg-muted/50'
            }`}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <File className="text-xs text-muted-foreground mt-1" />
            <span>{currentItem.created_at ? new Date(currentItem.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}</span>
          </div>
          <p className="font-medium text-foreground text-sm mb-1 truncate">
            {currentItem.title ? currentItem.title : currentItem.chapter}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentItem.book || currentItem.book_name || (currentItem?.content?.worksheet ? currentItem?.content?.worksheet.title : currentItem?.content?.lesson_plan?.title)}
          </p>
        </button>
        {onDelete && (
          <button
            aria-label="Delete"
            className="p-2 text-muted-foreground hover:text-destructive shrink-0 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(currentItem);
            }}
            disabled={!!isDeleting}
          >
            {isDeleting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-1">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-md)]">
        <Button 
          className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
          variant="outline" 
          onClick={() => setSelectedItem(null)}
        >
          <Plus className="h-4 w-4 mr-2" /> 
          <p>{item ? `New ${item}` : 'New worksheet'}</p>
        </Button>
        <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto overflow-x-hidden pr-1">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            History
          </p>
          {historyData && historyData.length > 0 ? (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-card/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              <div className="space-y-2">
                {historyData.map((itemData, index) => {
                  const stableKey = itemData.id || itemData.worksheet_id || itemData.answer_key_id || itemData.lesson_plan_id || itemData.paper_id || itemData.test_paper_id || itemData.chat_id || index;
                  return (
                    <div key={stableKey}>
                      {historyItem({ item: itemData, selectedItem, setSelectedItem, stableKey })}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs italic">Loading history...</p>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-lg">
              No previous {item?.toLowerCase() || 'items'} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
