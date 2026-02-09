
"use client";

import { SpreadHeatmap } from "@/types";

interface HeatmapProps {
    data: SpreadHeatmap[];
    segmentMinutes?: number; // 30 or 60
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({ data, segmentMinutes = 60 }: HeatmapProps) {
    // Determine number of slots per hour
    const slotsPerHour = 60 / segmentMinutes;
    const totalSlots = 24 * slotsPerHour;

    // Transform data to KST (UTC+9)
    // DB returns UTC day, hour, minute_segment
    const kstData = data.map(d => {
        // Total minutes from start of week in UTC
        const totalMinutesUTC = d.day_of_week * 24 * 60 + d.hour_of_day * 60 + d.minute_segment;

        // Shift +9 hours (540 minutes)
        const totalMinutesKST = totalMinutesUTC + 9 * 60;

        // Wrap around week (7 * 24 * 60 = 10080 minutes)
        const wrappedMinutesKST = totalMinutesKST % 10080;

        const kstDay = Math.floor(wrappedMinutesKST / (24 * 60));
        const remainingMinutes = wrappedMinutesKST % (24 * 60);
        const kstHour = Math.floor(remainingMinutes / 60);
        const kstMinute = remainingMinutes % 60;

        // Align KST minute to segment (e.g., if shift results in :30 but we want :00 bucket alignment, 
        // effectively the bucket moves).
        // Actually, simply shifting the bucket start time is enough.

        return {
            ...d,
            day_of_week: kstDay,
            hour_of_day: kstHour,
            minute_segment: kstMinute
        };
    });

    // Calculate min/max for coloring
    const maxSpread = Math.max(...kstData.map(d => d.avg_spread), 0.5);
    const minSpread = Math.min(...kstData.map(d => d.avg_spread), 0);

    const getColor = (value: number) => {
        const ratio = (value - minSpread) / (maxSpread - minSpread || 1);
        const hue = (1 - ratio) * 120; // 0(Red) to 120(Green)
        return `hsl(${hue}, 70%, 50%)`;
    };

    // Build Grid
    // Rows: 7 Days
    // Cols: 24 * slotsPerHour
    const grid = Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: totalSlots }, (_, slotIndex) => {
            const hour = Math.floor(slotIndex / slotsPerHour);
            const minute = (slotIndex % slotsPerHour) * segmentMinutes;

            const cell = kstData.find(d =>
                d.day_of_week === day &&
                d.hour_of_day === hour &&
                (d.minute_segment === minute || (d.minute_segment === undefined && minute === 0))
            );

            return cell ? cell.avg_spread : null;
        })
    );

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header Row: Hours */}
                <div className="flex mb-1">
                    <div className="w-16 shrink-0"></div>
                    {Array.from({ length: 24 }).map((_, h) => (
                        <div key={h} className="flex-1 text-center text-xs text-muted-foreground border-l first:border-l-0 border-border/50">
                            {h}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {DAYS.map((dayName, dayIndex) => (
                    <div key={dayName} className="flex h-8 mb-1">
                        <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground flex items-center">
                            {dayName}
                        </div>
                        <div className="flex-1 flex">
                            {grid[dayIndex].map((val, slotIndex) => (
                                <div
                                    key={slotIndex}
                                    className="flex-1 h-full mx-[1px] rounded-sm relative group cursor-pointer hover:ring-1 hover:ring-ring z-0 hover:z-10"
                                    style={{ backgroundColor: val !== null ? getColor(val) : 'transparent' }}
                                >
                                    {val !== null && (
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 bg-popover text-popover-foreground text-xs p-2 rounded shadow-md whitespace-nowrap pointer-events-none border">
                                            <div className="font-bold">{val.toFixed(2)}%</div>
                                            <div className="text-[10px] opacity-70">
                                                {DAYS[dayIndex]} {Math.floor(slotIndex / slotsPerHour)}:{(slotIndex % slotsPerHour) * segmentMinutes === 0 ? "00" : (slotIndex % slotsPerHour) * segmentMinutes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end mt-4 items-center gap-2 text-xs text-muted-foreground">
                    <span>Low (Green)</span>
                    <div className="w-24 h-2 bg-gradient-to-r from-[hsl(120,70%,50%)] to-[hsl(0,70%,50%)] rounded"></div>
                    <span>High (Red)</span>
                </div>
            </div>
        </div>
    );
}
