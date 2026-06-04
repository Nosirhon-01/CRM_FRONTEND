import najotcoinLogo from '../assets/najotcoin-logo.png';

const Sidebar = ({ isCollapsed, onToggle, activeItem, onItemClick, isDarkMode = false, menuItems }) => {
  const defaultMenuItems = [
    { id: 'home', label: 'Asosiy' },
    { id: 'teachers', label: 'O\'qituvchilar' },
    { id: 'groups', label: 'Guruhlar' },
    { id: 'students', label: 'Talabalar' },
    { id: 'gifts', label: 'Sovg\'alar' },
    { id: 'finance', label: 'Moliya' },
    { id: 'manage', label: 'Boshqarish' },
  ];

  const itemsToRender = menuItems || defaultMenuItems;

  const getIcon = (id, isActive) => {
    const color = isActive ? '#FFFFFF' : isDarkMode ? '#94a3b8' : '#4B5563';
    switch (id) {
      case 'home':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case 'teachers':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case 'groups':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
      case 'students':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
      case 'gifts':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>;
      case 'finance':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
      case 'manage':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
      case 'profile':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
      default:
        return null;
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[80px]' : 'w-[250px]'
      } ${
        isDarkMode
          ? 'border-gray-700 bg-[#1e293b]'
          : 'border-gray-100 bg-white'
      }`}
    >
      {/* Logo Section */}
      <div className={`relative flex h-20 items-center ${isCollapsed ? 'justify-center' : 'px-6'}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-yellow-500/50 bg-black shadow-sm">
            <img src={najotcoinLogo} alt="Najotcoin" className="h-full w-full object-cover" />
          </div>
          {!isCollapsed && (
            <span
              className={`text-xl font-bold italic tracking-tight ${
                isDarkMode ? 'text-indigo-200' : 'text-indigo-900'
              }`}
            >
              NAJOTCOIN
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
        >
          {isCollapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {itemsToRender.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item.id)}
              className={`group flex w-full items-center gap-4 rounded-xl p-3 transition-all duration-200 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-[#334155]'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-white' : isDarkMode ? 'text-gray-400 group-hover:text-indigo-300' : 'text-gray-400 group-hover:text-indigo-500'}`}>
                {getIcon(item.id, isActive)}
              </div>
              {!isCollapsed && (
                <span className="overflow-hidden whitespace-nowrap text-[15px] font-medium transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              {!isCollapsed && item.id === 'finance' && (
                <div className="ml-auto">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="none"><path d="m12 15 5 5V5l-5 5-5-5v15l5-5Z"/></svg>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subscription Card */}
      <div className={`mb-4 mt-auto p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div
          className={`rounded-2xl border p-4 ${
            isDarkMode
              ? 'border-gray-700 bg-[#0f172a]'
              : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="mb-3 flex items-start gap-3">
            <div
              className={`rounded-lg p-2 shadow-sm ${
                isDarkMode ? 'bg-[#1e293b]' : 'bg-white'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </div>
            <div>
              <p className={`text-[14px] font-bold ${isDarkMode ? 'text-gray-100' : 'text-indigo-950'}`}>
                Obuna
              </p>
              <p className="text-[12px] font-medium text-red-400">Obunangiz tugagan</p>
            </div>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m13 2-2 2.5h3L12 13h3L11 22"/></svg>
            Obunani yangilash
          </button>
        </div>
      </div>

      {/* Minimized Subscription Indicator */}
      {isCollapsed && (
        <div
          className={`mb-4 mt-auto flex flex-col items-center gap-2 border-t p-3 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-50'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m13 2-2 2.5h3L12 13h3L11 22"/></svg>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
