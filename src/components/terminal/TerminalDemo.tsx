import { Terminal } from './Terminal';
import type { V86Controller } from '../v86-wrapper/V86Controller';

/**
 * Demo do Terminal com callbacks funcionais
 * Necessario porque funcoes inline em .astro nao podem ser serializadas
 * para componentes React com client:only
 */
export function TerminalDemo() {
  const handleReady = (controller: V86Controller) => {
    console.log('Terminal pronto!', controller);
    // Expor controller globalmente para debug
    (window as unknown as { terminalController: V86Controller }).terminalController = controller;
  };

  const handleStarted = () => {
    console.log('Emulador iniciado');
  };

  const handleStopped = () => {
    console.log('Emulador parado');
  };

  const handleDownloadProgress = (progress: {
    file_name: string;
    loaded: number;
    total: number;
  }) => {
    console.log(
      `Download: ${progress.file_name} - ${Math.round((progress.loaded / progress.total) * 100)}%`
    );
  };

  const handleScreenSetSize = (data: [number, number, number]) => {
    console.log(`Tamanho da tela: ${data[0]}x${data[1]} cols/rows`);
  };

  return (
    <Terminal
      preset="buildroot"
      memoryMB={256}
      display={{
        width: 720,
        height: 400,
        borderRadius: 8,
      }}
      onReady={handleReady}
      onStarted={handleStarted}
      onStopped={handleStopped}
      onDownloadProgress={handleDownloadProgress}
      onScreenSetSize={handleScreenSetSize}
    />
  );
}

export default TerminalDemo;
