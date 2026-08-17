"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useTeaStore } from "@/lib/store";

// --- types ---

interface DayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  logs: { teaName: string; rating: number; note: string }[];
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

// --- helpers ---

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Normalize an ISO timestamp to a YYYY-MM-DD date string in local time.
function timestampToDateStr(ts: string): string {
  const d = new Date(ts);
  return toDateString(d);
}

// --- component ---

export default function TeaCalendarGraph() {
  const teaLogs = useTeaStore((s) => s.teaLogs);
  const allTeas = useTeaStore((s) => s.allTeas);
  const accentColor = useTeaStore((s) => s.accentColor);

  // Build slug → tea name lookup
  const teaNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of allTeas) {
      map[t.slug] = t.name;
    }
    return map;
  }, [allTeas]);

  // Build a map: dateStr → array of { teaName, rating, note }
  const logsByDate = useMemo(() => {
    const byDate: Record<string, { teaName: string; rating: number; note: string }[]> = {};
    for (const [slug, logs] of Object.entries(teaLogs)) {
      if (!logs || logs.length === 0) continue;
      const teaName = teaNameMap[slug] || slug;
      for (const log of logs) {
        const dateStr = timestampToDateStr(log.timestamp);
        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push({ teaName, rating: log.rating, note: log.note });
      }
    }
    return byDate;
  }, [teaLogs, teaNameMap]);

  // Generate the last 30 days of cells, organized into a week-column grid
  // (columns = weeks, rows = weekdays, Sun..Sat — GitHub style)
  const { columns, monthLabels, weekdayLabels, totalLogs, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start 29 days ago so we include today = 30 cells total
    const start = new Date(today);
    start.setDate(start.getDate() - 29);

    // Align start to the beginning of its week (Sunday)
    const startDow = start.getDay(); // 0=Sun
    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - startDow);

    // Build all cells from gridStart until we cover today
    const cells: DayCell[] = [];
    const cursor = new Date(gridStart);
    let totalLogs = 0;
    let maxCount = 0;

    // We need enough weeks to include today
    while (cursor <= today) {
      for (let dow = 0; dow < 7; dow++) {
        const dateStr = toDateString(cursor);
        const isFuture = cursor > today;
        const isToday = toDateString(cursor) === toDateString(today);
        const dayLogs = logsByDate[dateStr] || [];
        const count = dayLogs.length;
        totalLogs += count;
        if (count > maxCount) maxCount = count;
        cells.push({
          date: new Date(cursor),
          dateStr,
          logs: dayLogs,
          count,
          isToday,
          isFuture,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Organize into columns of 7 (one per week)
    const cols: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      cols.push(cells.slice(i, i + 7));
    }

    // Month labels — for each column, show the month name if it's the first
    // column where that month appears
    const months: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    cols.forEach((col, i) => {
      const m = col[0].date.getMonth();
      if (m !== lastMonth) {
        months.push({
          label: col[0].date.toLocaleDateString("en-US", { month: "short" }),
          colIndex: i,
        });
        lastMonth = m;
      }
    });

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      columns: cols,
      monthLabels: months,
      weekdayLabels: weekdays,
      totalLogs,
      maxCount,
    };
  }, [logsByDate]);

  // --- intensity scale ---
  function getCellBg(cell: DayCell): string {
    if (cell.isFuture) return "transparent";
    if (cell.count === 0) return "var(--border)";

    // Scale: 1-4 intensity levels based on count relative to maxCount
    const ratio = maxCount > 0 ? cell.count / maxCount : 0;
    let opacity: number;
    if (ratio <= 0.25) opacity = 0.35;
    else if (ratio <= 0.5) opacity = 0.55;
    else if (ratio <= 0.75) opacity = 0.75;
    else opacity = 1.0;

    // Convert accentColor hex to rgba
    const hex = accentColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // --- tooltip ---
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  function handleCellEnter(cell: DayCell, e: React.MouseEvent) {
    if (cell.isFuture) return;
    setHoveredCell(cell);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      // Position relative to container
      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      });
    }
  }

  function handleCellLeave() {
    setHoveredCell(null);
    setTooltipPos(null);
  }

  // Mobile detection for responsive sizing
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cellSize = isMobile ? 12 : 14;
  const cellGap = isMobile ? 2 : 3;

  // --- render ---
  return (
    <div ref={containerRef} className="relative">
      {/* Month labels */}
      <div
        className="flex mb-1"
        style={{ gap: cellGap, paddingLeft: isMobile ? 0 : 0 }}
      >
        {columns.map((col, i) => {
          const ml = monthLabels.find((m) => m.colIndex === i);
          return (
            <div
              key={i}
              className="text-[10px] text-muted"
              style={{ width: cellSize, textAlign: "center" }}
            >
              {ml ? ml.label : ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Weekday labels column */}
        {!isMobile && (
          <div className="flex flex-col" style={{ gap: cellGap, marginRight: 4 }}>
            {weekdayLabels.map((day, i) => (
              <div
                key={day}
                className="text-[10px] text-muted flex items-center justify-end"
                style={{ height: cellSize, width: 24, lineHeight: `${cellSize}px` }}
              >
                {i % 2 === 0 ? day : ""}
              </div>
            ))}
          </div>
        )}

        {/* Calendar grid */}
        <div className="flex" style={{ gap: cellGap }}>
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col" style={{ gap: cellGap }}>
              {col.map((cell, rowIdx) => {
                const bg = getCellBg(cell);
                const isToday = cell.isToday;
                return (
                  <div
                    key={rowIdx}
                    onMouseEnter={(e) => handleCellEnter(cell, e)}
                    onMouseLeave={handleCellLeave}
                    className="rounded-sm cursor-pointer transition-all duration-100 hover:ring-1 hover:ring-offset-0"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: bg,
                      outline: isToday ? `1.5px solid ${accentColor}` : "none",
                      outlineOffset: isToday ? "1px" : "0",
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted">
        <span>Less</span>
        {[0, 0.35, 0.55, 0.75, 1.0].map((opacity, i) => {
          const hex = accentColor.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 11,
                height: 11,
                backgroundColor: opacity === 0 ? "var(--border)" : `rgba(${r}, ${g}, ${b}, ${opacity})`,
                borderRadius: 2,
              }}
            />
          );
        })}
        <span>More</span>
        {totalLogs > 0 && (
          <span className="ml-2">
            · {totalLogs} {totalLogs === 1 ? "log" : "logs"} in last 30 days
          </span>
        )}
      </div>

      {/* Tooltip */}
      {hoveredCell && tooltipPos && (
        <div
          ref={tooltipRef}
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="rounded-lg px-3 py-2 text-xs shadow-lg"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              minWidth: 140,
              maxWidth: 240,
            }}
          >
            {/* Date header */}
            <div className="font-medium mb-1" style={{ color: "var(--text)" }}>
              {hoveredCell.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {hoveredCell.isToday && (
                <span className="ml-1" style={{ color: accentColor }}>· Today</span>
              )}
            </div>

            {hoveredCell.count === 0 ? (
              <p className="text-muted">No tea logged</p>
            ) : (
              <div className="space-y-1">
                {hoveredCell.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span
                      className="shrink-0 mt-0.5"
                      style={{ color: accentColor }}
                    >
                      {"★".repeat(Math.max(1, log.rating))}{" "}
                      <span className="text-muted">{log.rating}/5</span>
                    </span>
                    <span
                      className="truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {log.teaName}
                    </span>
                  </div>
                ))}
                {/* Show notes if any */}
                {hoveredCell.logs.some((l) => l.note) && (
                  <div className="pt-1 mt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    {hoveredCell.logs
                      .filter((l) => l.note)
                      .map((log, i) => (
                        <p key={i} className="text-muted text-[11px] leading-snug">
                          <span className="font-medium" style={{ color: "var(--text)" }}>
                            {log.teaName}:
                          </span>{" "}
                          {log.note}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}