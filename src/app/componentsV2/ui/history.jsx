import React from 'react';
import { File, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const History = ({ selectedItem, setSelectedItem, historyData, item }) => {
  console.log("historydata",selectedItem,historyData);
  const historyItem = ({ index, item, selectedItem, setSelectedItem }) => {
    return (
      <div key={index}>
      <button
        onClick={() => setSelectedItem(item)}
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
        <p className="font-medium text-foreground text-sm mb-1">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {item.book}
        </p>
      </button>
      </div>
    )
  }
  return (
    <div className="lg:col-span-1">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-md)]">
        <Button className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" variant="outline" onClick={() => setSelectedItem(null)}>
          <Plus className="h-4 w-4 mr-2" /> <p>{item ? `New ${item}` : 'New worksheet' }</p>
        </Button>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            History
          </p>
          {historyData?.chats?.length !== 0 && historyData?.chats?.map((item, index) => (
            historyItem({ index, item:item, selectedItem, setSelectedItem })
          ))}
        </div>
      </div>
    </div>
  )
};

export default History;
