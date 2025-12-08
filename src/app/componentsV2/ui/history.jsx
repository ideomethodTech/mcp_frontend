import React from 'react';
import { File, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ITEM_TYPES, NAV_ITEMS } from '@/lib/constants';

const History = ({ selectedItem, setSelectedItem, historyData, item, isChat = false }) => {
  // console.log("historydata",selectedItem,historyData);
  console.log("historydata",selectedItem,historyData);
  const historyItem = ({ index, item, selectedItem, setSelectedItem }) => {
    return (
      <div key={index}>
        <button
          onClick={() => {
            isChat ? setSelectedItem({
              id: item.id,
              chat_title: item.title,
              uid: item.uid
            }) :
              setSelectedItem(item)
          }}
          className={`w-full text-left p-2 rounded-lg border ${selectedItem === item.id
            ? 'bg-primary/10 border-primary'
            : 'hover:bg-muted/50'
            }`}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <File className="text-xs text-muted-foreground mt-1" />
            <span>  {item.created_at}
            </span>
          </div>
          <p className="font-medium text-foreground text-sm mb-1">{item.title ? item.title : item.chapter}</p>
          <p className="text-xs text-muted-foreground truncate">
            {item.book ? item.book : (item?.content?.worksheet ? item?.content?.worksheet.title : item?.content?.lesson_plan.title)}
          </p>
        </button>
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
          {item===ITEM_TYPES.CHAT? (historyData?.length !== 0 && historyData?.map((item, index) => (
            historyItem({ index, item: item, selectedItem, setSelectedItem, isChat })
          ))): item=== ITEM_TYPES.LESSON_PLAN ?
          (
             historyData?.map((item, index) => (
              historyItem({ index, item: item, selectedItem, setSelectedItem })))
          ): item=== ITEM_TYPES.WORKSHEET ?
          (
             historyData.map((item, index) => (
              historyItem({ index, item: item, selectedItem, setSelectedItem })))
          ) : null}
        </div>
      </div>
    </div>
  )
};

export default History;
