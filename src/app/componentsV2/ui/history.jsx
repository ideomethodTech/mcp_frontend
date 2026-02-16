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
  isLoading = false,
}) => {

  const historyItem = ({ index, item, selectedItem, setSelectedItem }) => {
    return (
      <div key={index} className="flex items-start gap-2">
        <button
          onClick={() => {
            isChat ? setSelectedItem({
              id: item.id,
              chat_title: item.title,
              uid: item.uid
            }) :
              setSelectedItem(item)
          }}
          className={`w-full text-left p-2 rounded-lg border ${(selectedItem?.id === item.id || selectedItem === item)
            ? 'bg-primary/10 border-primary'
            : 'hover:bg-muted/50'
            }`}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <File className="text-xs text-muted-foreground mt-1" />
            <span>  {item.created_at}
            </span>
          </div>
          <p className="font-medium text-foreground text-sm mb-1 truncate">{item.title ? item.title : item.chapter}</p>
          <p className="text-xs text-muted-foreground truncate">
            {item.book ? item.book : (item?.content?.worksheet ? item?.content?.worksheet.title : item?.content?.lesson_plan?.title)}
          </p>
        </button>
        {onDelete && (
          <button
            aria-label="Delete"
            className="p-2 text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            disabled={!!deletingId && (deletingId === item.id || deletingId === item.chat_id || deletingId === item.lesson_plan_id || deletingId === item.worksheet_id || deletingId === item.answer_key_id)}
          >
            {(deletingId && (deletingId === item.id || deletingId === item.chat_id || deletingId === item.lesson_plan_id || deletingId === item.worksheet_id || deletingId === item.answer_key_id)) ? (
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
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-md)]">
        <Button className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" variant="outline" onClick={() => setSelectedItem(null)}>
          <Plus className="h-4 w-4 mr-2" /> <p>{item ? `New ${item}` : 'New worksheet'}</p>
        </Button>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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
                {historyData.map((item, index) => (
                  historyItem({ index, item, selectedItem, setSelectedItem, isChat })
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs">Loading history...</p>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-lg">
              No previous {item?.toLowerCase() || 'items'} found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default History;
