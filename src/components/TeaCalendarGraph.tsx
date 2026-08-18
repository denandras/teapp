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
  isMonthStart: boolean;
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

  // --- dynamic container width measurement ---
  // Measure the grid container so we can compute how many week columns fit.
  // Cell size and gap come from CSS custom properties (responsive, no JS flash).
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    // Set initial value
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Read CSS custom properties for cell size and gap (set in globals.css,
  // responsive via media query). Fallback to 14/3 if not available.
  const cellSize = useMemo(() => {
    if (typeof window === "undefined") return 14;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--cal-cell-size")
      .trim();
    return v ? parseInt(v, 10) : 14;
  }, [containerWidth]); // re-read when container resizes (crosses breakpoint)

  const cellGap = useMemo(() => {
    if (typeof window === "undefined") return 3;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--cal-cell-gap")
      .trim();
    return v ? parseInt(v, 10) : 3;
  }, [containerWidth]);

  // Compute how many week columns can fit in the available width.
  // Each column is cellSize wide, separated by cellGap.
  const numWeeks = useMemo(() => {
    if (containerWidth === 0) return 0; // not yet measured
    const colStride = cellSize + cellGap;
    // floor((width + gap) / stride) — the +gap accounts for no trailing gap
    const fit = Math.floor((containerWidth + cellGap) / colStride);
    // Minimum 4 weeks so very narrow containers still show something
    return Math.max(4, fit);
  }, [containerWidth, cellSize, cellGap]);

  // Generate cells for numWeeks weeks ending at the current week, organized
  // into a week-column grid (columns = weeks, rows = weekdays, Sun..Sat).
  // Dates with no data still render as empty/zero-intensity cells.
  const { columns, monthLabels, weekdayLabels, totalLogs, maxCount, daysShown } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End of the range = end of the current week (Saturday).
    const end = new Date(today);
    const endDow = end.getDay(); // 0=Sun..6=Sat
    end.setDate(end.getDate() + (6 - endDow)); // move forward to Saturday

    // Start = end minus (numWeeks * 7 - 1) days, aligned to Sunday
    const gridStart = new Date(end);
    gridStart.setDate(gridStart.getDate() - (numWeeks * 7 - 1));

    // Build all cells from gridStart to end (inclusive)
    const cells: DayCell[] = [];
    const cursor = new Date(gridStart);
    let totalLogs = 0;
    let maxCount = 0;

    while (cursor <= end) {
      const dateStr = toDateString(cursor);
      const isFuture = cursor > today;
      const isToday = toDateString(cursor) === toDateString(today);
      const isMonthStart = cursor.getDate() === 1;
      const dayLogs = logsByDate[dateStr] || [];
      const count = dayLogs.length;
      if (!isFuture) {
        totalLogs += count;
        if (count > maxCount) maxCount = count;
      }
      cells.push({
        date: new Date(cursor),
        dateStr,
        logs: dayLogs,
        count,
        isToday,
        isFuture,
        isMonthStart,
      });
      cursor.setDate(cursor.getDate() + 1);
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
      daysShown: cells.filter((c) => !c.isFuture).length,
    };
  }, [logsByDate, numWeeks]);

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
  const [flippedBelow, setFlippedBelow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  function handleCellEnter(cell: DayCell, e: React.MouseEvent) {
    if (cell.isFuture) return;
    setHoveredCell(cell);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      const cellCenterX = rect.left - containerRect.left + rect.width / 2;
      const cellTop = rect.top - containerRect.top;
      const containerW = containerRect.width;
      const tooltipW = 200; // estimated, maxWidth is 240 but most are narrower
      const tooltipH = 120; // estimated height

      // Clamp X so tooltip stays within container [0, containerW]
      let x = cellCenterX;
      const halfW = tooltipW / 2;
      if (x - halfW < 0) x = halfW + 2;
      if (x + halfW > containerW) x = containerW - halfW - 2;

      // If not enough space above the cell, flip tooltip below
      const flipBelow = cellTop < tooltipH + 8;
      const y = flipBelow ? rect.top - containerRect.top + rect.height + 8 : cellTop - 8;

      setFlippedBelow(flipBelow);
      setTooltipPos({ x, y });
    }
  }

  function handleCellLeave() {
    setHoveredCell(null);
    setTooltipPos(null);
  }

  // --- render ---
  // Responsive sizing via CSS custom properties (no JS flash, no SSR mismatch).
  // The grid measures its container and renders only as many week columns as fit.
  return (
    <div ref={containerRef} className="relative">
      {/* Month labels — offset to align with the grid (weekday column width + marginRight + parent gap) */}
      <div className="flex mb-1" style={{ gap: cellGap, paddingLeft: `calc(var(--cal-weekday-label-width) + 8px)` }}>
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
        {/* Weekday labels column — CSS var collapses width to 0 on mobile */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ gap: cellGap, marginRight: 4, width: "var(--cal-weekday-label-width)" }}
        >
          {weekdayLabels.map((day, i) => (
            <div
              key={day}
              className="text-[10px] text-muted flex items-center justify-end"
              style={{ height: cellSize, lineHeight: `${cellSize}px` }}
            >
              {i % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Calendar grid — ref for width measurement, flex-1 to fill space */}
        <div ref={gridRef} className="flex flex-1 min-w-0" style={{ gap: cellGap }}>
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
                      borderLeft: cell.isMonthStart
                        ? "2px solid var(--muted)"
                        : undefined,
                      outline: isToday ? `1.5px solid ${accentColor}` : "none",
                      outlineOffset: isToday ? "1px" : "0",
                      borderRadius: 2,
                      boxSizing: "border-box",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend — wraps on narrow screens */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px] text-muted">
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
        {totalLogs > 0 && daysShown > 0 && (
          <span className="ml-2">
            · {totalLogs} {totalLogs === 1 ? "log" : "logs"} in last {Math.round(daysShown / 7)} weeks
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
            transform: flippedBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
          }}
        >
          <div
            className="rounded-lg px-3 py-2 text-xs shadow-lg overflow-y-auto"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              minWidth: 140,
              maxWidth: 240,
              maxHeight: 300,
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