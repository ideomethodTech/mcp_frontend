import { useGetWorksheet } from "@/lib/api/queries";
import WorksheetItem from "./WorksheetItem";
import { LoadingState } from "@/components/ui/LoadingState";

export const WorksheetDetails = ({ item, documents }) => {
  const { data: worksheetData, isLoading } = useGetWorksheet(item.worksheet_id);

  if (isLoading) {
    return <LoadingState title="Loading Worksheet..." description="Please wait while we load the worksheet data." />;
  }

  return (
    <div className="lg:col-span-7">
      <WorksheetItem item={item} worksheetData={worksheetData} documents={documents} />
    </div>
  );
};
