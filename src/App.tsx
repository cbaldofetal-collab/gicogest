import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { ResetPassword } from './components/ResetPassword';
import { Dashboard } from './components/Dashboard';
import { GlucoseForm } from './components/GlucoseForm';
import { ReportGenerator } from './components/ReportGenerator';
import { Settings } from './components/Settings';
import { Home, Plus, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';

type Tab = 'dashboard' | 'register' | 'report' | 'settings';

function App() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    // Verificar se a URL contém o hash de recuperação de senha
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      setShowResetPassword(true);
    }
  }, []);

  // Mostrar tela de login se não estiver autenticado
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar página de reset de senha se houver hash de recuperação
  if (showResetPassword) {
    return <ResetPassword />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'register' as Tab, label: 'Registrar', icon: Plus },
    { id: 'report' as Tab, label: 'Relatório', icon: FileText },
    { id: 'settings' as Tab, label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">GlicoGest</h1>
              <p className="text-sm text-gray-600">Monitoramento de Glicemia</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, <span className="font-medium text-gray-900">{user?.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <GlucoseForm />
          </div>
        )}
        {activeTab === 'report' && (
          <div className="max-w-2xl mx-auto">
            <ReportGenerator />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <Settings />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            GlicoGest - Monitoramento Inteligente para Diabetes Gestacional
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
