import TrackPlayer, { Capability } from 'react-native-track-player';

let isInitialized = false; // ✅ Variable para evitar múltiples inicializaciones

export async function setupPlayer() {
  if (isInitialized) {
    console.log('⚠️ TrackPlayer ya está inicializado.');
    return;
  }

  try {
    console.log('🔧 Inicializando TrackPlayer...');
    await TrackPlayer.setupPlayer();

    await TrackPlayer.updateOptions({
      stopWithApp: true, // 🔥 Esto hace que el reproductor se detenga al cerrar la app
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });

    isInitialized = true; // ✅ Marca el reproductor como inicializado
    console.log('✅ TrackPlayer listo.');
  } catch (error) {
    console.error('❌ Error al inicializar TrackPlayer:', error);
  }
}
