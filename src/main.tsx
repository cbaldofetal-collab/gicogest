import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Handler global para erros de Promise não tratados
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Não prevenir o comportamento padrão para ver o erro completo
});

// Handler global para erros JavaScript
window.addEventListener('error', (event) => {
  console.error('Erro JavaScript:', event.error);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento root não encontrado!');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
