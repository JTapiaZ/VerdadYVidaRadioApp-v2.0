import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Dimensions, Share, TouchableWithoutFeedback, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { setupPlayer } from '../utils/trackPlayerSetup'; // Asumo que tienes esta función
import Netinfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

const tracks = [
    {
        id: 0,
        url: 'https://stream.zeno.fm/zznllllp06cuv',
        title: 'Verdad y Vida Radio 870 AM',
        artist: 'Verdad y Vida Radio',
        artwork: require('../../assets/img/870.jpg'),
        duration: 999999,
    },
    {
        id: 1,
        url: 'https://stream.zeno.fm/vvon5xkmvhwvv',
        title: 'Verdad y Vida Radio Aguadas Caldas',
        artist: 'Verdad y Vida Radio',
        artwork: require('../../assets/img/Aguadas.jpg'),
        duration: 999999,
    },
    {
        id: 2,
        url: 'https://stream.zeno.fm/n590rdbh62uuv',
        title: 'Verdad y Vida Radio Online',
        artist: 'Verdad y Vida Radio',
        artwork: require('../../assets/img/online.jpg'),
        duration: 999999,
    },
];

const AudioPlayer = () => {
    const [isReady, setIsReady] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const currentTrack = tracks[currentTrackIndex];
    const [isPlaying, setIsPlaying] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const progress = useProgress();
    const retryCount = useRef(0);
    const maxRetries = 5;
    const retryDelayBase = 10000;
    const userInitiatedPause = useRef(false);
    const bufferingTimeout = useRef(null);
    const wasConnected = useRef(true);

    // --- CAMBIO 1: Modificamos resetPlayer para que acepte un modo "silencioso" ---
    const resetPlayer = async (isSilent = false) => {
        try {
            console.log('🔄 Reiniciando el reproductor...');
            userInitiatedPause.current = false;
            await TrackPlayer.reset(); // Usar reset en lugar de stop, es más completo
            await TrackPlayer.add(tracks);
            // Al resetear, saltamos a la pista actual que el usuario estaba escuchando
            await TrackPlayer.skip(tracks[currentTrackIndex].id);
            setMenuVisible(false);
            retryCount.current = 0;
            if (!isSilent) {
                Alert.alert('Reproductor reiniciado', 'Se ha reiniciado el reproductor de radio.');
            }
        } catch (error) {
            console.error('❌ Error al resetear el reproductor:', error);
            if (!isSilent) {
                Alert.alert('Error', 'Ocurrió un error al intentar reiniciar el reproductor.');
            }
        }
    };

    const handleRetry = () => {
        if (retryCount.current < maxRetries) {
            const delay = retryDelayBase * Math.pow(2, retryCount.current);
            console.log(`⚠️ Conexión perdida, reintentando en ${delay / 1000} segundos...`);
            Alert.alert('Reintentando conexión', `Se perdió la conexión. Intentando reconectar...`);
            setTimeout(() => {
                TrackPlayer.play();
                retryCount.current += 1;
            }, delay);
        } else {
            console.log('🛑 Demasiados reintentos, deteniendo la reproducción.');
            Alert.alert('❌ Error de conexión', 'No se pudo reanudar la reproducción. Por favor, verifica tu conexión.');
        }
    };

    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], (event) => {
        if (event.type === Event.PlaybackState) {
            const state = event.state;
            setIsLoading(state === State.Buffering || state === State.Connecting);
            setIsPlaying(state === State.Playing);

            if (state === State.Playing || state === State.Paused || state === State.Stopped) {
                if (bufferingTimeout.current) {
                    clearTimeout(bufferingTimeout.current);
                    bufferingTimeout.current = null;
                }
                if (state === State.Playing) {
                    retryCount.current = 0;
                }
            }
            if (state === State.Buffering || state === State.Connecting) {
                if (bufferingTimeout.current) return;
                bufferingTimeout.current = setTimeout(() => {
                    TrackPlayer.getState().then(currentState => {
                        if (currentState === State.Buffering || currentState === State.Connecting) {
                            handleRetry();
                        }
                    });
                }, 15000);
            }
            if (state === State.Paused && userInitiatedPause.current) {
                console.log('⏸️ Pausa intencional del usuario.');
                userInitiatedPause.current = false;
            }
        } else if (event.type === Event.PlaybackError) {
            console.error('❌ Error de reproducción:', event.error);
            handleRetry();
        }
    });

    useEffect(() => {
        const initialize = async () => {
            try {
                const isSetup = await TrackPlayer.isServiceRunning();
                if (!isSetup) {
                    await setupPlayer();
                }
                await TrackPlayer.reset();
                await TrackPlayer.add(tracks);
                setIsReady(true);
                const netInfoState = await Netinfo.fetch();
                wasConnected.current = netInfoState.isConnected;
            } catch (error) {
                console.error('❌ Error al configurar el reproductor:', error);
            }
        };
        initialize();

        // --- CAMBIO 2: La lógica de reconexión ahora resetea el reproductor ---
        const unsubscribeNetInfo = Netinfo.addEventListener(state => {
            const isNowConnected = state.isConnected;
            if (!wasConnected.current && isNowConnected) {
                console.log('✅ La conexión a internet ha vuelto.');
                Alert.alert("Conexión Restaurada", "Reiniciando la radio para reconectar...");
                
                setTimeout(async () => {
                    const currentState = await TrackPlayer.getState();
                    if (currentState !== State.Playing && !userInitiatedPause.current) {
                        console.log('🔄 Reiniciando y reanudando la reproducción automáticamente...');
                        await resetPlayer(true); // Reset silencioso
                        await TrackPlayer.play(); // Iniciar reproducción después del reset
                    }
                }, 2000); // Un pequeño retraso para que la red se estabilice
            }
            wasConnected.current = isNowConnected;
        });

        return () => {
            unsubscribeNetInfo();
            TrackPlayer.reset();
        };
    }, []);


    const togglePlayback = async () => {
        const currentState = await TrackPlayer.getState();
        try {
            if (currentState === State.Playing) {
                userInitiatedPause.current = true;
                await TrackPlayer.pause();
            } else {
                userInitiatedPause.current = false;
                setIsLoading(true);
                retryCount.current = 0;
                await TrackPlayer.play();
            }
        } catch (error) {
            console.error('❌ Error al controlar la reproducción:', error);
        }
    };

    const playNext = async () => {
        if (currentTrackIndex < tracks.length - 1) {
            try {
                userInitiatedPause.current = false;
                const nextIndex = currentTrackIndex + 1;
                await resetPlayer(true); // Reseteamos para asegurar una carga limpia
                await TrackPlayer.skip(tracks[nextIndex].id);
                await TrackPlayer.play();
                setCurrentTrackIndex(nextIndex); // Actualizamos el índice después del skip
                retryCount.current = 0;
            } catch (error) {
                console.error('❌ Error al ir a la siguiente emisora:', error);
            }
        }
    };

    const playPrevious = async () => {
        if (currentTrackIndex > 0) {
            try {
                userInitiatedPause.current = false;
                const prevIndex = currentTrackIndex - 1;
                await resetPlayer(true); // Reseteamos para asegurar una carga limpia
                await TrackPlayer.skip(tracks[prevIndex].id);
                await TrackPlayer.play();
                setCurrentTrackIndex(prevIndex); // Actualizamos el índice después del skip
                retryCount.current = 0;
            } catch (error) {
                console.error('❌ Error al ir a la emisora anterior:', error);
            }
        }
    };

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
            Alert.alert('Error al compartir', 'Ocurrió un error al intentar compartir la aplicación.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#164b7f' }}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <LinearGradient
                colors={['#164b7f', '#fff']}
                style={styles.gradientBackground}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        paddingVertical: 70, // puedes ajustar el padding
                    }}
                    showsVerticalScrollIndicator={false}
                >
                <View pointerEvents="box-none">
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

                    <View style={styles.controls}>
                        <TouchableOpacity onPress={playPrevious} disabled={currentTrackIndex === 0} style={styles.controlButton}>
                            <Icon name="play-skip-back-circle-outline" size={40} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Icon name={isPlaying ? "pause" : "play"} size={35} color="white" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={playNext} disabled={currentTrackIndex === tracks.length - 1} style={styles.controlButton}>
                            <Icon name="play-skip-forward-circle-outline" size={40} />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity
                            style={[
                                styles.liveButton,
                                { opacity: isPlaying ? 1 : 0 },
                            ]}
                        >
                            <View style={styles.liveButtonContainer}>
                                <Text style={styles.liveText}>🔵 En Vivo</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            setMenuVisible(!menuVisible);
                        }}
                    >
                        <Icon name="ellipsis-horizontal" size={24} color="white" />
                    </TouchableOpacity>

                    {menuVisible && (
                        <View style={styles.dropdownMenu}>
                            <TouchableOpacity onPress={resetPlayer} style={styles.menuItem}>
                                <Text style={styles.menuText}>Reiniciar Reproductor</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                </ScrollView>
            </LinearGradient>
        </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    albumArt: {
        marginTop: 65,
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
        alignSelf: "center",
    },
    title: {
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    progressContainer: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    slider: {
        width: 330,
        height: 40,
        color: '#000',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    controls: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
        zIndex: 10,
    },
    share: {
        alignSelf: 'center',
        zIndex: 10,
    },
    playButton: {
        backgroundColor: '#000',
        borderRadius: 50,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
    },
    description: {
        alignSelf: 'center',
        fontSize: 13,
        color: '#5c5c5c',
        marginBottom: 20,
    },
    liveButtonContainer: {
        marginTop: 10,
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
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    menuButton: {
        margin: 10,
        position: "absolute",
        right: 15,
        zIndex: 10,
    },
    dropdownMenu: {
        position: "absolute",
        marginTop: 50,
        right: 20,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 20,
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