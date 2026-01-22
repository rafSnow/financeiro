import { useEffect, useState } from 'react';
import {
  FaBell,
  FaBullseye,
  FaChartBar,
  FaCog,
  FaDollarSign,
  FaExclamationCircle,
  FaFileImport,
  FaHome,
  FaMoneyBillWave,
  FaSave,
  FaTags,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteAlert,
  deleteReadAlerts,
  getAlerts,
  markAllAsRead,
  markAsRead,
} from '../services/alerts.service';
import { logout } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { runAllChecks } from '../utils/alertRules';
import AlertBadge from './AlertBadge';
import AlertList from './AlertList';
import ThemeToggle from './ThemeToggle';

/**
 * Componente de header da aplicação
 * Exibe logo, nome do usuário e botão de logout
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertList, setShowAlertList] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Carrega alertas ao montar e verifica novos alertas
  useEffect(() => {
    if (!user?.uid) return;

    loadAlerts();
    checkNewAlerts();

    // Recarregar alertas a cada 5 minutos
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const loadAlerts = async () => {
    if (!user?.uid) return;
    try {
      const data = await getAlerts(user.uid);
      setAlerts(data);
      setUnreadCount(data.filter(a => !a.isRead).length);
    } catch {
      // Silencioso
    }
  };

  const checkNewAlerts = async () => {
    if (!user?.uid) return;
    try {
      await runAllChecks(user.uid);
      await loadAlerts();
    } catch {
      // Silencioso
    }
  };

  const handleMarkAsRead = async alertId => {
    try {
      await markAsRead(alertId);
      await loadAlerts();
    } catch {
      addToast('Erro ao marcar alerta como lido', 'error');
    }
  };

  const handleDelete = async alertId => {
    try {
      await deleteAlert(alertId);
      await loadAlerts();
      addToast('Alerta excluído', 'success');
    } catch {
      addToast('Erro ao excluir alerta', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(user.uid);
      await loadAlerts();
      addToast('Todos os alertas marcados como lidos', 'success');
    } catch {
      addToast('Erro ao marcar todos como lidos', 'error');
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteReadAlerts(user.uid);
      await loadAlerts();
      addToast('Alertas lidos excluídos', 'success');
    } catch {
      addToast('Erro ao excluir alertas lidos', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleDropdown = menu => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleNavigate = path => {
    navigate(path);
    setOpenDropdown(null);
  };

  // Estrutura de menus com submenus
  const menuStructure = [
    {
      label: 'Dashboard',
      icon: FaHome,
      path: '/dashboard',
    },
    {
      label: 'Transações',
      icon: FaMoneyBillWave,
      submenu: [
        { label: 'Despesas', icon: FaMoneyBillWave, path: '/expenses' },
        { label: 'Rendas', icon: FaDollarSign, path: '/income' },
        { label: 'Categorias', icon: FaTags, path: '/categories' },
        { label: 'Importar', icon: FaFileImport, path: '/import' },
      ],
    },
    {
      label: 'Dívidas',
      icon: FaExclamationCircle,
      path: '/debts',
    },
    {
      label: 'Planejamento',
      icon: FaBullseye,
      submenu: [
        { label: 'Metas', icon: FaBullseye, path: '/goals' },
        { label: 'Relatórios', icon: FaChartBar, path: '/reports' },
      ],
    },
    {
      label: 'Configurações',
      icon: FaCog,
      submenu: [
        { label: 'Notificações', icon: FaBell, path: '/notifications' },
        { label: 'Backup', icon: FaSave, path: '/settings' },
      ],
    },
  ];

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/expenses', label: 'Despesas', icon: FaMoneyBillWave },
    { path: '/income', label: 'Rendas', icon: FaDollarSign },
    { path: '/debts', label: 'Dívidas', icon: FaExclamationCircle },
    { path: '/reports', label: 'Relatórios', icon: FaChartBar },
  ];

  const isActive = path => location.pathname === path;

  return (
    <header
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300"
      role="banner"
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <FaDollarSign className="text-2xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">FinanceiroApp</h1>
            </div>

            {/* Navegação Desktop */}
            <nav
              className="hidden lg:flex items-center gap-1"
              role="navigation"
              aria-label="Navegação principal"
            >
              {menuStructure.map(menu => {
                if (menu.submenu) {
                  // Menu com submenu (dropdown)
                  return (
                    <div key={menu.label} className="relative">
                      <button
                        onClick={() => toggleDropdown(menu.label)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          menu.submenu.some(item => isActive(item.path))
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-expanded={openDropdown === menu.label}
                        aria-haspopup="true"
                        aria-label={`Menu ${menu.label}`}
                      >
                        <span>{menu.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            openDropdown === menu.label ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      {openDropdown === menu.label && (
                        <>
                          {/* Overlay para fechar ao clicar fora */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                            {menu.submenu.map(item => (
                              <button
                                key={item.path}
                                onClick={() => handleNavigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                                  isActive(item.path)
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                } else {
                  // Menu simples (sem submenu)
                  return (
                    <button
                      key={menu.path}
                      onClick={() => handleNavigate(menu.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive(menu.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label={`Ir para ${menu.label}`}
                      aria-current={isActive(menu.path) ? 'page' : undefined}
                    >
                      <span>{menu.label}</span>
                    </button>
                  );
                }
              })}
            </nav>
          </div>

          {/* User info e logout */}
          <div className="flex items-center gap-4">
            {/* Badge de Alertas */}
            <AlertBadge count={unreadCount} onClick={() => setShowAlertList(true)} />

            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.displayName || user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Fazer logout"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Alertas */}
      {showAlertList && (
        <AlertList
          alerts={alerts}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteRead={handleDeleteRead}
          onClose={() => setShowAlertList(false)}
        />
      )}
    </header>
  );
};

export default Header;
