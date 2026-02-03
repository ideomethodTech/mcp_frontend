'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import History from '@/app/componentsV2/ui/history';
import { getNavItemByUrl } from '@/app/utils';

/**
 * ToolPageLayout - A standard layout for tool pages with a history sidebar and main content area.
 * 
 * @param {Object} props
 * @param {Array} props.historyData - The data to display in the history sidebar.
 * @param {Object} props.selectedItem - The currently selected item from history.
 * @param {Function} props.setSelectedItem - Function to update the selected item.
 * @param {Function} props.onDelete - Function to handle item deletion.
 * @param {boolean} props.isHistoryLoading - Whether history data is being fetched.
 * @param {string|number} props.deletingId - ID of the item currently being deleted.
 * @param {boolean} props.isProcessing - Whether the tool is currently generating/creating something.
 * @param {string} props.processingText - Text to show during processing.
 * @param {React.ReactNode} props.children - Main content (Form or Item Details).
 * @param {string} props.title - Optional title override.
 * @param {string} props.description - Optional description override.
 */
export function ToolPageLayout({
    historyData = [],
    selectedItem = null,
    setSelectedItem,
    onDelete,
    isHistoryLoading = false,
    deletingId = null,
    isProcessing = false,
    processingText = "Generating...",
    children,
    title: titleOverride,
    description: descriptionOverride,
}) {
    const pathname = usePathname();
    const navItem = useMemo(() => getNavItemByUrl(pathname), [pathname]);

    const title = titleOverride || navItem?.title || "Tool";
    const description = descriptionOverride || navItem?.description || "";
    const Icon = navItem?.icon;

    return (
        <div className="max-w-7xl mx-auto my-5 space-y-6 px-4">
            {/* HEADER */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
                <div className="relative flex items-center gap-4">
                    {Icon && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
                            <Icon className="h-8 w-8 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SIDEBAR / HISTORY */}
                <History
                    item={navItem?.itemtype || "Item"}
                    historyData={historyData}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    isLoading={isHistoryLoading}
                    onDelete={onDelete}
                    deletingId={deletingId}
                />

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-3 min-h-[500px]">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-full max-w-2xl text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                                <h3 className="text-lg font-medium text-foreground">{processingText}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while the AI prepares your content.
                                </p>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
}
