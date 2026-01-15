import React from 'react';
import { File, Loader, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ITEM_TYPES, NAV_ITEMS } from '@/lib/constants';

const History = ({
  selectedItem,
  setSelectedItem,
  historyData,
  item,
  isChat = false,
  onDelete,
  deletingId,
}) => {

  const historyItem = ({ item, selectedItem, setSelectedItem }) => {
    const isSelected = selectedItem?.id === item.id;

    return (
      <div className="flex items-start gap-2 w-full">
        <button
          onClick={() => {
            isChat ? setSelectedItem({
              id: item.id,
              chat_title: item.title,
              uid: item.uid
            }) :
              setSelectedItem(item)
          }}
          className={`w-full text-left p-2 rounded-lg border transition-all ${isSelected
            ? 'bg-primary/10 border-primary shadow-sm'
            : 'hover:bg-muted/50 border-transparent'
            }`}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <File className="h-3 w-3" />
              <span>{item.created_at}</span>
            </div>
          </div>
          <p className="font-medium text-foreground text-sm mb-1 truncate">
            {item.title || item.chapter || 'Untitled'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {item.book || item.chat_title || (item?.content?.worksheet?.title || item?.content?.lesson_plan?.title || 'Learning Material')}
          </p>
        </button>
        {onDelete && (
          <button
            aria-label="Delete"
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(item)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="lg:col-span-1">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg h-full max-h-[700px] flex flex-col">
        <Button
          className="w-full mb-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md"
          variant="default"
          onClick={() => setSelectedItem(null)}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>{item ? `New ${item}` : 'New Worksheet'}</span>
        </Button>

        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          History
        </p>

        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {historyData && historyData.length > 0 ? (
            historyData.map((item, index) => (
              <React.Fragment key={item.id || `history-${index}`}>
                {historyItem({ item, selectedItem, setSelectedItem, isChat })}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground italic">No history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default History;
