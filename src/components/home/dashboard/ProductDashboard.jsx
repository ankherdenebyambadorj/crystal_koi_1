import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '../../../content/brand.js';
import { dashboard } from '../../../content/homeContent.js';
import { ROUTES } from '../../../content/routes.js';
import { useReveal } from '../../../hooks/useReveal.js';
import { buildSmoothPath, normalise, seededSeries } from '../../../lib/chartMath.js';
import { Logo } from '../../icons/Logo.jsx';
import { DashboardChart } from './DashboardChart.jsx';

const KPI_COLORS = ['#9b8cff', '#ff8fd8', '#7fd6ff', '#7cf0bd'];
const KPI_SEEDS = [
  [14, 3, 20, 7, 10],
  [14, 7, 18, 6, 9],
  [14, 11, 22, 6, -6],
  [14, 5, 12, 4, 14],
];

const MIX_COLORS = ['#9b8cff', '#7fd6ff', '#ff8fd8', '#ffc27a', '#7cf0bd'];

function Sparkline({ spec, color, index, drawn }) {
  const rawId = useId().replace(/:/g, '');
  const gradId = `ck-spark-${index}-${rawId}`;

  const { linePath, areaPath } = useMemo(() => {
    const raw = seededSeries(spec[0], spec[1], spec[2], spec[3], spec[4]);
    const norm = normalise(raw);
    const pts = norm.map((v, i) => ({
      x: (i * 200) / (raw.length - 1),
      y: 28 - v * 24,
    }));
    const line = buildSmoothPath(pts);
    return {
      linePath: line,
      areaPath: `${line} L 200 30 L 0 30 Z`,
    };
  }, [spec]);

  return (
    <svg
      viewBox="0 0 200 30"
      preserveAspectRatio="none"
      className={`dash-spark ${drawn ? 'is-drawn' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} className="dash-draw-fade" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
        className="dash-draw-line"
      />
    </svg>
  );
}

function SidebarIcon({ index }) {
  const paths = [
    'M3 12h4l2-6 4 12 2-6h4',
    'M4 7h16v10H4z M9 7v10',
    'M4 17l5-5 4 4 7-7',
    'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 19c0-2.5 2.2-4 5-4s5 1.5 5 4M14 19c0-1.8 1.5-3 3.5-3S21 17.2 21 19',
    'M4 6h16M4 12h12M4 18h8',
    'M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z',
    'M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z',
    'M4 6h16v9H4zM9 19h6',
  ];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="dash-side-icon" aria-hidden="true">
      <path d={paths[index % paths.length]} />
    </svg>
  );
}

export function ProductDashboard({ reducedMotion }) {
  const [range, setRange] = useState(30);
  const [dashRef, revealed] = useReveal();
  const isDrawn = revealed || reducedMotion;

  return (
    <div
      id="dash"
      ref={dashRef}
      role="region"
      aria-label={dashboard.ariaLabel}
      className={`dash-panel reveal ${revealed ? 'in' : ''}`}
    >
      <div className="dash-topbar" aria-hidden="true">
        <span className="dash-mini-logo">
          <Logo showWordmark={false} markClassName="dash-mini-mark" />
          <span>{brand.name}</span>
        </span>
        <span className="dash-breadcrumb">
          <span>{dashboard.breadcrumb[0]}</span>
          <span>/</span>
          <span className="dash-breadcrumb-current">{dashboard.breadcrumb[1]}</span>
        </span>
        <span className="dash-spacer" />
        <div className="dash-search">
          <svg viewBox="0 0 16 16" fill="none" className="dash-search-icon" stroke="currentColor" strokeWidth="1.4">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <span>{dashboard.search}</span>
          <span className="dash-search-kbd">⌘K</span>
        </div>
        <span className="ck-chip ck-chip--live">
          <span className="ck-live-dot" />
          <span>{dashboard.liveChip}</span>
        </span>
        <span className="dash-avatar">{dashboard.avatar}</span>
      </div>

      <div className="dash-body">
        <aside className="dash-sidebar" aria-hidden="true">
          <div className="dash-side-heading">{dashboard.sidebar.workspace}</div>
          {dashboard.sidebar.items.map((item, idx) => (
            <div key={item.label} className={`dash-side-item ${item.active ? 'is-active' : ''}`}>
              <SidebarIcon index={idx} />
              <span className="dash-side-label">{item.label}</span>
              {item.count && <span className="dash-side-count">{item.count}</span>}
            </div>
          ))}
          <div className="dash-side-heading dash-side-heading--lib">{dashboard.sidebar.library}</div>
          {dashboard.sidebar.libraryItems.map((item, idx) => (
            <div key={item.label} className="dash-side-item">
              <SidebarIcon index={idx + 4} />
              <span className="dash-side-label">{item.label}</span>
              {item.count && <span className="dash-side-count">{item.count}</span>}
            </div>
          ))}
        </aside>

        <div className="dash-main">
          <div className="dash-header-row">
            <h3 className="dash-title">{dashboard.title}</h3>
            <span className="ck-chip ck-chip--up dash-trend-chip">{dashboard.trend}</span>
            <div className="dash-seg" role="group" aria-label={dashboard.chartTitle}>
              {dashboard.ranges.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`dash-seg-btn ${range === r.value ? 'is-active' : ''}`}
                  aria-pressed={range === r.value}
                  onClick={() => setRange(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Link to={ROUTES.getStarted} className="dash-new-deal">
              {dashboard.newDeal}
            </Link>
          </div>

          <div className="dash-kpis" aria-hidden="true">
            {dashboard.kpis.map((kpi, idx) => (
              <div key={kpi.label} className="dash-kpi">
                <div className="dash-kpi-label">{kpi.label}</div>
                <div className="dash-kpi-row">
                  <span className="dash-kpi-val">{kpi.value}</span>
                  <span className={kpi.neutral ? 'ck-chip' : 'ck-chip ck-chip--up'}>{kpi.delta}</span>
                </div>
                <Sparkline
                  spec={KPI_SEEDS[idx]}
                  color={KPI_COLORS[idx]}
                  index={idx}
                  drawn={isDrawn}
                />
              </div>
            ))}
          </div>

          <div className="dash-charts-row">
            <DashboardChart
              range={range}
              revealed={revealed}
              reducedMotion={reducedMotion}
              title={dashboard.chartTitle}
              legend={dashboard.legend}
            />

            <div className="dash-pane" aria-hidden="true">
              <div className="dash-pane-title">{dashboard.mixTitle}</div>
              <div className="dash-mix-list">
                {dashboard.mix.map((bar, idx) => {
                  const color = MIX_COLORS[idx % MIX_COLORS.length];
                  const pct = (bar.value / 38) * 100;
                  return (
                    <div key={bar.label} className="dash-mix-row">
                      <div className="dash-mix-meta">
                        <span>{bar.label}</span>
                        <span className="dash-mix-val">{bar.value}%</span>
                      </div>
                      <div className="dash-mix-track">
                        <div
                          className="dash-mix-fill"
                          style={{
                            width: isDrawn ? `${pct}%` : '0%',
                            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="dash-table" aria-hidden="true">
            <div className="dash-tr dash-tr--head">
              <span>{dashboard.tableHead[0]}</span>
              <span>{dashboard.tableHead[1]}</span>
              <span className="dash-tr-hide-sm">{dashboard.tableHead[2]}</span>
              <span className="dash-tr-hide-sm">{dashboard.tableHead[3]}</span>
              <span>{dashboard.tableHead[4]}</span>
            </div>
            {dashboard.rows.map((row) => (
              <div key={row.name} className="dash-tr">
                <span className="dash-td-name">{row.name}</span>
                <span>{row.channel}</span>
                <span className="dash-td-mono dash-tr-hide-sm">{row.floor}</span>
                <span className="dash-td-mono dash-tr-hide-sm">{row.winRate}</span>
                <span>
                  {row.status === 'live' ? (
                    <span className="ck-chip ck-chip--live">
                      <span className="ck-live-dot" />
                      <span>{dashboard.status.live}</span>
                    </span>
                  ) : (
                    <span className="ck-chip">{dashboard.status.forecasting}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
