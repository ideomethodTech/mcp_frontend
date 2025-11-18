import { Loader2 } from "lucide-react";
import { useGetWorksheet } from "@/lib/api/queries";
import WorksheetItem from "./WorksheetItem";

export const WorksheetDetails = ({ item, documents }) => {
  const { data: worksheetData, isLoading } = useGetWorksheet(item.worksheet_id);

  if (isLoading) {
    return (
      <div className="lg:col-span-7">
        <div className="flex  justify-center h-full">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Loading Worksheet...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we load the worksheet data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7">
      <WorksheetItem item={item} worksheetData={worksheetData} documents={documents} />
    </div>
  );
};
