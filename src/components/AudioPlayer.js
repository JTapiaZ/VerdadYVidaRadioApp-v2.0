import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Dimensions, Share, TouchableWithoutFeedback, ActivityIndicator  } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider'; // 📏 Slider para la barra de progreso
import TrackPlayer, { State, useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { setupPlayer } from '../utils/trackPlayerSetup';

const { width, height } = Dimensions.get('window'); // 📏 Obtiene tamaño de la pantalla

// 🎵 Lista de pistas
const tracks = [
  {
    id: 0,
    url: 'https://stream.zeno.fm/zznllllp06cuv',
    title: 'Verdad y Vida Radio 870 AM',
    artist: 'Verdad y Vida Radio',
    artwork: require('../../assets/img/870.jpg'), // 📌 Imagen local
    duration: 999999, // 📌 Duración en segundos
  },
  {
    id: 1,
    url: 'https://stream.zeno.fm/vvon5xkmvhwvv',
    title: 'Verdad y Vida Radio 100.1 FM',
    artist: 'Verdad y Vida Radio',
    artwork: require('../../assets/img/1001.jpg'), // 📌 Otra imagen
    duration: 999999, // 📌 Duración en segundos
  },
  {
    id: 2,
    url: 'https://stream.zeno.fm/n590rdbh62uuv',
    title: 'Verdad y Vida Radio Online',
    artist: 'Verdad y Vida Radio',
    artwork: require('../../assets/img/online.jpg'), // 📌 Otra imagen
    duration: 999999, // 📌 Duración en segundos
  },
];

const AudioPlayer = () => {
  const [playbackState, setPlaybackState] = useState(State.Stopped);
  const [isReady, setIsReady] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = tracks[currentTrackIndex];
  const [isPlaying, setIsPlaying] = useState(false); // 📌 Nuevo estado para "EN VIVO"
  const [menuVisible, setMenuVisible] = useState(false); // 📌 Estado para mostrar/ocultar el menú
  const [isLoading, setIsLoading] = useState(false); // 📌 Nuevo estado para mostrar carga


  const progress = useProgress(); // 📊 Obtiene la posición y duración en tiempo real

  // 📌 Escuchar eventos del reproductor
  useTrackPlayerEvents([Event.PlaybackState], (event) => {
    setIsLoading(event.state === State.Buffering || event.state === State.Connecting);
    if (event.state === State.Playing) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  });

  const resetPlayer = async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks); // Agregar nuevamente las pistas
    setMenuVisible(false); // Oculta el menú después de reiniciar
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const isSetup = await TrackPlayer.isServiceRunning();
        if (!isSetup) {
          console.log('🎵 Configurando TrackPlayer...');
          await setupPlayer();
        } else {
          console.log('✅ TrackPlayer ya estaba configurado.');
        }
  
        console.log('🎵 Agregando pista:', tracks);
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        setIsReady(true);
        console.log('✅ Pista añadida con éxito.');
      } catch (error) {
        console.error('❌ Error al configurar TrackPlayer:', error);
      }
    };
  
    setup();
  
    return () => {
      console.log('⛔ App cerrada: Deteniendo TrackPlayer...');
      TrackPlayer.stop();
      TrackPlayer.reset(); // 🔥 Limpia las pistas y libera recursos correctamente
    };
  }, []);

  // 📌 Manejar reproducción y pausa
const togglePlayback = async () => {
  const currentState = await TrackPlayer.getState();
  if (currentState === State.Playing) {
    await TrackPlayer.pause();
  } else {
    setIsLoading(true);
    await TrackPlayer.play();
  }
};

  const playNext = async () => {
    if (currentTrackIndex < tracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      await TrackPlayer.skip(tracks[nextIndex].id);
      await TrackPlayer.play();
    }
  };

  const playPrevious = async () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      await TrackPlayer.skip(tracks[prevIndex].id);
      await TrackPlayer.play();
    }
  };

  // 🔢 Formatea los segundos a mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const shareDataPlayStore = async () => { 
    try { 
        await Share.share({ 
            title: 'Verdad y Vida Radio APP',  
            message: 'Descarga e instala la aplicación de Verdad y Vida Radio, https://play.google.com/store/apps/details?id=com.verdadyvidaradio&hl=es_CO', 
            url: 'https://play.google.com/store/apps/details?id=com.verdadyvidaradio&hl=es_CO', 
        }); 
    } catch (error) { 
        alert('❌ Error al compartir, intente nuevamente'); 
    } 
}; 

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
    <LinearGradient
      colors={['#164b7f', '#fff']}
      style={styles.gradientBackground}
    >
      <View style={{ flex: 1, position: "relative" }} pointerEvents="box-none">
        {/* 📌 Imagen del artista */}
        <Image source={currentTrack.artwork} style={styles.albumArt} />
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.description}>La radio que llena tu vida</Text>

        <View style={styles.share}>
          <TouchableOpacity onPress={shareDataPlayStore}>
            <Icon name="share-outline" size={26} color={'#000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={300}
          value={progress.position}
          onSlidingComplete={async (value) => {
            if (progress.duration > 0) await TrackPlayer.seekTo(value);
          }}
          minimumTrackTintColor="#333"
          maximumTrackTintColor="#333"
          thumbTintColor="#333"
          trackStyle={{ height: 5, borderRadius: 5 }}
          thumbStyle={{ width: 15, height: 15, borderRadius: 10 }}
        />
      </View>

      {/* 🔴 Botón "En Vivo" con espacio fijo */}
      <View>
        <TouchableOpacity
          style={[
            styles.liveButton,
            { opacity: isPlaying ? 1 : 0 }, // 📌 Opacidad si no está en vivo
          ]}
        >
          <View style={styles.liveButtonContainer}>
          <Text style={styles.liveText}>🔵 En Vivo</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
          <TouchableOpacity onPress={playPrevious} disabled={currentTrackIndex === 0} style={styles.controlButton}>
            <Icon name="play-skip-back-circle-outline" size={40} />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" /> // 🎬 Icono de carga
          ) : (
            <Icon name={isPlaying ? "pause" : "play"} size={35} color="white" />
          )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} disabled={currentTrackIndex === tracks.length - 1} style={styles.controlButton}>
            <Icon name="play-skip-forward-circle-outline" size={40} />
          </TouchableOpacity>
      </View> 

        {/* 📌 Botón de menú en la parte superior derecha */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={(e) => {
            e.stopPropagation(); // Evita que se cierre inmediatamente
            setMenuVisible(!menuVisible);
          }}
        >
          <Icon name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>

        {/* 📌 Menú colapsable con posición absoluta */}
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={resetPlayer} style={styles.menuItem}>
              <Text style={styles.menuText}>Reiniciar Reproductor</Text>
            </TouchableOpacity>
          </View>
        )}
      </View> 

    </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    height: '50%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArt: {
    top: 75,
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    alignSelf: 'center',
    top: 80,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressContainer: {
    top: 70,
    width: '100%', // 📌 Ocupará todo el ancho
    paddingHorizontal: 20, // 📌 Espaciado en los lados
    alignItems: 'center',
  },
  slider: {
    marginTop: 5,
    width: 330, // 📌 Ocupa todo el ancho disponible
    height: 40,
    color: '#000', // 📌 Asegura que se vea bien
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  controls: {
    top: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30, // 📌 Espaciado entre botones
  },
  share: {
    alignSelf: 'center',
    top: 70,
    zIndex: 10,
  },
  playButton: {
    backgroundColor: '#000',
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // 📌 Ajusta la posición si está desviado
    zIndex: 10, // 📌 Asegura que esté sobre otros elementos
  },
  description: {
    top: 70,
    alignSelf: 'center',
    fontSize: 13,
    color: '#5c5c5c',
    marginBottom: 20,
  },
  liveButtonContainer: {
    top: 80,
    width: 120,
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#164b7f',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  
  liveText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 10,
    zIndex: 10, // 📌 Asegura que el botón esté por encima de otros elementos
  },
  dropdownMenu: {
    position: "absolute",
    top: 50, // 📌 Ajusta la posición debajo del botón
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    elevation: 5, // 📌 Sombra en Android
    shadowColor: "#000", // 📌 Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 20, // 📌 Asegura que el menú esté encima de todo
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 13,
    color: "#333",
  },
});

export default AudioPlayer;
