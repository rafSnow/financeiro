import { useEffect, useState } from 'react';
import Button from './Button';

/**
 * Componente que exibe um botão para instalar o app como PWA
 * Usa a API beforeinstallprompt do navegador
 */
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = e => {
      // Prevenir o mini-infobar do Chrome
      e.preventDefault();
      // Guardar o evento para usar depois
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar o app`);

    // Limpar o prompt
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-4">
      <Button
        onClick={handleInstall}
        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow bg-blue-500 hover:bg-blue-600"
      >
        <span className="text-xl">📱</span>
        <span>Instalar App</span>
      </Button>
    </div>
  );
};

export default InstallPWA;
