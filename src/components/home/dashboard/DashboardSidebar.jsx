const SIDEBAR_PATHS = [
  'M3 12h4l2-6 4 12 2-6h4',
  'M4 7h16v10H4z M9 7v10',
  'M4 17l5-5 4 4 7-7',
  'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 19c0-2.5 2.2-4 5-4s5 1.5 5 4M14 19c0-1.8 1.5-3 3.5-3S21 17.2 21 19',
  'M4 6h16M4 12h12M4 18h8',
  'M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z',
  'M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z',
  'M4 6h16v9H4zM9 19h6',
];

function SidebarIcon({ index }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="dash-side-icon"
      aria-hidden="true"
    >
      <path d={SIDEBAR_PATHS[index % SIDEBAR_PATHS.length]} />
    </svg>
  );
}

export function DashboardSidebar({ sidebar }) {
  return (
    <aside className="dash-sidebar" aria-hidden="true">
      <div className="dash-side-heading">{sidebar.workspace}</div>
      {sidebar.items.map((item, idx) => (
        <div key={item.label} className={`dash-side-item ${item.active ? 'is-active' : ''}`}>
          <SidebarIcon index={idx} />
          <span className="dash-side-label">{item.label}</span>
          {item.count && <span className="dash-side-count">{item.count}</span>}
        </div>
      ))}
      <div className="dash-side-heading dash-side-heading--lib">{sidebar.library}</div>
      {sidebar.libraryItems.map((item, idx) => (
        <div key={item.label} className="dash-side-item">
          <SidebarIcon index={idx + 4} />
          <span className="dash-side-label">{item.label}</span>
          {item.count && <span className="dash-side-count">{item.count}</span>}
        </div>
      ))}
    </aside>
  );
}
