import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck as TruckIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TripContext } from '../App';

// Colors for each duty status
const STATUS_COLORS = {
  off_duty: '#9CA3AF',
  sleeper: '#8B5CF6',
  driving: '#1E3A8A',
  on_duty: '#F59E0B',
};

const STATUS_LABELS = {
  off_duty: 'Off Duty',
  sleeper: 'Sleeper Berth',
  driving: 'Driving',
  on_duty: 'On Duty (Not Driving)',
};

const STATUS_ORDER = ['off_duty', 'sleeper', 'driving', 'on_duty'];
const STATUS_ROW_INDEX = { off_duty: 0, sleeper: 1, driving: 2, on_duty: 3 };

/**
 * Draw the ELD log grid on a canvas with FMCSA-style horizontal duty lines
 * and vertical transition lines — like a real hand-drawn paper log.
 */
function drawLogGrid(canvas, segments, isDark) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  const labelWidth = 120;
  const topPadding = 28;
  const bottomPadding = 8;
  const gridLeft = labelWidth;
  const gridWidth = width - labelWidth - 8;
  const gridHeight = height - topPadding - bottomPadding;
  const rowHeight = gridHeight / 4;

  const colors = {
    bg: isDark ? '#1f2937' : '#ffffff',
    gridLine: isDark ? '#374151' : '#e5e7eb',
    gridLineLight: isDark ? '#2d3748' : '#f3f4f6',
    quarterMark: isDark ? '#2d3748' : '#f9fafb',
    text: isDark ? '#d1d5db' : '#374151',
    textMuted: isDark ? '#9ca3af' : '#9ca3af',
    headerText: isDark ? '#9ca3af' : '#6b7280',
    labelBg: isDark ? '#111827' : '#f9fafb',
  };

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  // ─── Hour labels at top ─────────────────────────────────────
  ctx.fillStyle = colors.headerText;
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let h = 0; h <= 24; h++) {
    const x = gridLeft + (h / 24) * gridWidth;
    let label;
    if (h === 0 || h === 24) label = 'M';
    else if (h === 12) label = 'N';
    else if (h > 12) label = String(h - 12);
    else label = String(h);
    ctx.fillText(label, x, topPadding - 10);
  }

  // ─── Row labels on the left ─────────────────────────────────
  ctx.textAlign = 'right';
  ctx.font = '10px Inter, system-ui, sans-serif';
  STATUS_ORDER.forEach((key, i) => {
    const y = topPadding + i * rowHeight + rowHeight / 2;

    // Label background
    ctx.fillStyle = colors.labelBg;
    ctx.fillRect(0, topPadding + i * rowHeight, labelWidth - 4, rowHeight);

    // Status dot
    const dotSize = 7;
    ctx.fillStyle = STATUS_COLORS[key];
    ctx.beginPath();
    ctx.roundRect(8, y - dotSize / 2, dotSize, dotSize, 2);
    ctx.fill();

    // Label text
    ctx.fillStyle = colors.text;
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(STATUS_LABELS[key], 20, y + 4);
  });

  // ─── Grid lines ─────────────────────────────────────────────
  // Horizontal row separators
  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = topPadding + i * rowHeight;
    ctx.beginPath();
    ctx.moveTo(gridLeft, y);
    ctx.lineTo(gridLeft + gridWidth, y);
    ctx.stroke();
  }

  // Vertical hour lines
  for (let h = 0; h <= 24; h++) {
    const x = gridLeft + (h / 24) * gridWidth;
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = h % 6 === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, topPadding);
    ctx.lineTo(x, topPadding + gridHeight);
    ctx.stroke();
  }

  // Quarter-hour tick marks
  for (let q = 0; q < 96; q++) {
    if (q % 4 === 0) continue; // Skip hour marks
    const x = gridLeft + (q / 96) * gridWidth;
    ctx.strokeStyle = colors.quarterMark;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    // Small ticks at top and bottom of each row
    for (let r = 0; r < 4; r++) {
      const rowTop = topPadding + r * rowHeight;
      ctx.moveTo(x, rowTop);
      ctx.lineTo(x, rowTop + rowHeight * 0.15);
      ctx.moveTo(x, rowTop + rowHeight * 0.85);
      ctx.lineTo(x, rowTop + rowHeight);
    }
    ctx.stroke();
  }

  // ─── Draw the actual duty status lines (FMCSA style) ───────
  if (!segments || segments.length === 0) return;

  // Sort segments by start_hour
  const sorted = [...segments].sort((a, b) => a.start_hour - b.start_hour);

  // Helper to get center Y of a status row
  const getRowCenterY = (statusKey) => {
    const idx = STATUS_ROW_INDEX[statusKey];
    return topPadding + idx * rowHeight + rowHeight / 2;
  };

  // Helper to get X from hour
  const getX = (hour) => gridLeft + (Math.min(Math.max(hour, 0), 24) / 24) * gridWidth;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw horizontal lines for each segment and vertical transitions between them
  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    const statusY = getRowCenterY(seg.status);
    const startX = getX(seg.start_hour);
    const endX = getX(Math.min(seg.end_hour, 24));
    const color = STATUS_COLORS[seg.status];

    // Horizontal duty line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, statusY);
    ctx.lineTo(endX, statusY);
    ctx.stroke();

    // Small circles at start/end of segment
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(startX, statusY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, statusY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Vertical transition line to next segment
    if (i < sorted.length - 1) {
      const nextSeg = sorted[i + 1];
      const nextY = getRowCenterY(nextSeg.status);
      if (Math.abs(statusY - nextY) > 1) {
        // Draw vertical line at the transition point
        const transX = endX;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(transX, statusY);
        ctx.lineTo(transX, nextY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

/**
 * Canvas-based ELD Log Grid component — draws lines like a real FMCSA paper log
 */
function ELDLogCanvas({ segments, isDark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLogGrid(canvasRef.current, segments, isDark);
    }
  }, [segments, isDark]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        drawLogGrid(canvasRef.current, segments, isDark);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [segments, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
      style={{ height: '220px' }}
    />
  );
}

export default function ELDLogs() {
  const { tripData } = useContext(TripContext);
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(0);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (!tripData || !tripData.log_sheets_data || tripData.log_sheets_data.length === 0) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Logs Available</h3>
        <p className="text-sm text-gray-300 dark:text-gray-500 mb-6 text-center max-w-xs">
          Generate a trip from the Dashboard to view ELD log sheets.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  const logSheets = tripData.log_sheets_data;
  const currentLog = logSheets[activeDay];

  // Calculate compliance
  const totalDriving = currentLog.total_driving || 0;
  const totalOnDuty = (currentLog.total_on_duty || 0) + totalDriving;
  const drivingCompliant = totalDriving <= 11;
  const dutyCompliant = totalOnDuty <= 14;

  return (
    <div className="fade-in space-y-6">
      {/* Day Tabs */}
      {logSheets.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
            disabled={activeDay === 0}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {logSheets.map((log, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDay(idx)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeDay === idx
                  ? 'bg-primary-800 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              Day {log.day}
            </button>
          ))}
          <button
            onClick={() => setActiveDay(Math.min(logSheets.length - 1, activeDay + 1))}
            disabled={activeDay === logSheets.length - 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Log Sheet Card */}
      <div className="card">
        {/* ─── Header: FMCSA Form Style ─── */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="section-title">Driver's Daily Log</h3>
                <p className="text-xs text-gray-400 mt-0.5">FMCSA §395.8 — Record of Duty Status</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Sheet {activeDay + 1} of {logSheets.length}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {currentLog.date}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Date', value: currentLog.date },
              { label: 'Driver', value: 'John Doe' },
              { label: 'Carrier', value: 'ABC Trucking Co.' },
              { label: 'Truck #', value: 'T-1001' },
              { label: 'Miles Today', value: `${currentLog.miles_driven?.toFixed(0) || 0}` },
              { label: 'Total Miles', value: `${tripData.total_distance?.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i}>
                <p className="label mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-dashed border-gray-300 dark:border-gray-600 pb-1">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 24-Hour Log Grid — Canvas Drawn ─── */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            24-Hour Record of Duty Status
          </h4>

          <ELDLogCanvas segments={currentLog.segments} isDark={isDark} />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {STATUS_ORDER.map((key) => (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[key] }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{STATUS_LABELS[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Remarks ─── */}
        {currentLog.remarks && currentLog.remarks.length > 0 && (
          <div className="px-6 pb-4">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Remarks & Condition of Vehicle</h4>
            <div className="bg-surface-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
              {currentLog.remarks.map((remark, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-300 py-1 border-b border-dashed border-gray-200 dark:border-gray-600 last:border-b-0">
                  <span className="text-xs text-gray-400 mr-2">{String(i + 1).padStart(2, '0')}.</span>
                  {remark}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ─── Summary Totals ─── */}
        <div className="p-6 bg-surface-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Daily Totals</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TruckIcon className="w-4 h-4 text-primary-800" />
                <span className="label">Driving</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDriving.toFixed(1)}h</p>
              <div className="mt-2">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${totalDriving > 11 ? 'bg-red-500' : totalDriving > 8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((totalDriving / 11) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">of 11h limit</p>
              </div>
            </div>

            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="label">On-Duty</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOnDuty.toFixed(1)}h</p>
              <div className="mt-2">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${totalOnDuty > 14 ? 'bg-red-500' : totalOnDuty > 11 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((totalOnDuty / 14) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">of 14h window</p>
              </div>
            </div>

            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="label">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tripData.remaining_cycle_hours}h
              </p>
              <div className="mt-2">
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-emerald-500"
                    style={{ width: `${Math.min((tripData.remaining_cycle_hours / 70) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">70h cycle</p>
              </div>
            </div>

            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {drivingCompliant && dutyCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span className="label">Status</span>
              </div>
              <div className="mt-2">
                {drivingCompliant && dutyCompliant ? (
                  <span className="badge-success text-sm px-3 py-1.5">Compliant ✓</span>
                ) : (
                  <span className="badge-warning text-sm px-3 py-1.5">Review</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">FMCSA §395.8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
