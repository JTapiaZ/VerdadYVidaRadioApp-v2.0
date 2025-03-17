import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  // 🔥 Manejo cuando el usuario detiene manualmente el reproductor
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  });

  // 🔥 Manejo cuando la cola de reproducción termina
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  });
}

TrackPlayer.addEventListener(Event.PlaybackState, async (state) => {
  if (state === TrackPlayer.STATE_STOPPED) {
    await TrackPlayer.reset();
  }
});

TrackPlayer.addEventListener(Event.RemoteDuck, async (data) => {
  if (data.paused) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
});