import { useState } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '../../../content/brand.js';
import { dashboard } from '../../../content/homeContent.js';
import { ROUTES } from '../../../content/routes.js';
import { useReveal } from '../../../hooks/useReveal.js';
import { Logo } from '../../icons/Logo.jsx';
import { Avatar, AvatarFallback } from '../../ui/avatar.jsx';
import { Progress } from '../../ui/progress.jsx';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group.jsx';
import { DashboardChart } from './DashboardChart.jsx';
import { DashboardSidebar } from './DashboardSidebar.jsx';
import { Sparkline } from './Sparkline.jsx';

const KPI_COLORS = ['#9b8cff', '#ff8fd8', '#7fd6ff', '#7cf0bd'];
const KPI_SEEDS = [
  [14, 3, 20, 7, 10],
  [14, 7, 18, 6, 9],
  [14, 11, 22, 6, -6],
  [14, 5, 12, 4, 14],
];
const MIX_COLORS = ['#9b8cff', '#7fd6ff', '#ff8fd8', '#ffc27a', '#7cf0bd'];

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
        <Avatar className="dash-avatar">
          <AvatarFallback>{dashboard.avatar}</AvatarFallback>
        </Avatar>
      </div>

      <div className="dash-body">
        <DashboardSidebar sidebar={dashboard.sidebar} />

        <div className="dash-main">
          <div className="dash-header-row">
            <h3 className="dash-title">{dashboard.title}</h3>
            <span className="ck-chip ck-chip--up dash-trend-chip">{dashboard.trend}</span>
            <ToggleGroup
              type="single"
              value={String(range)}
              aria-label={dashboard.chartTitle}
              onValueChange={(val) => {
                if (val) setRange(Number(val));
              }}
            >
              {dashboard.ranges.map((r) => (
                <ToggleGroupItem key={r.value} value={String(r.value)}>
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
                <Sparkline spec={KPI_SEEDS[idx]} color={KPI_COLORS[idx]} index={idx} drawn={isDrawn} />
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
                      <Progress
                        value={Math.round(pct)}
                        indicatorStyle={{
                          width: isDrawn ? `${pct}%` : '0%',
                          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                        }}
                      />
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
