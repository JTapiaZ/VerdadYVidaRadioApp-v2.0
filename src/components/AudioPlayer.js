import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Dimensions, Share, TouchableWithoutFeedback, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import TrackPlayer, { State, useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { setupPlayer } from '../utils/trackPlayerSetup'; // Asumo que tienes esta función
import Netinform from '@react-native-community/netinfo';

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
    const [playbackState, setPlaybackState] = useState(State.Stopped);
    const [isReady, setIsReady] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const currentTrack = tracks[currentTrackIndex];
    const [isPlaying, setIsPlaying] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const progress = useProgress();
    const retryCount = useRef(0); // 📌 Contador de reintentos
    const maxRetries = 5; // 📌 Número máximo de reintentos
    const retryDelayBase = 10000; // 📌 Tiempo base para el primer reintento (ms)
    const autoRetryEnabled = useRef(true); // 📌 Controla si los reintentos automáticos están habilitados

    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], (event) => {
        if (event.type === Event.PlaybackState) {
            setIsLoading(event.state === State.Buffering || event.state === State.Connecting);
            setIsPlaying(event.state === State.Playing);
            setPlaybackState(event.state);

            // 📌 Lógica de reintento automático
            if (autoRetryEnabled.current) {
                if (event.state === State.Buffering || event.state === State.Connecting) {
                    // Si se está cargando, reiniciamos el contador de reintentos
                    retryCount.current = 0;
                } else if (event.state === State.Paused && isPlaying) {
                    // Si se pausa inesperadamente mientras estaba reproduciendo, intentamos reanudar
                    if (retryCount.current < maxRetries) {
                        const delay = retryDelayBase * Math.pow(2, retryCount.current);
                        console.log(`⚠️ Pausa inesperada, reintentando en ${delay / 1000} segundos...`);
                        setTimeout(() => {
                            TrackPlayer.play();
                            retryCount.current += 1;
                            Alert.alert(
                                'Reintentando conexión',
                                `La reproducción se detuvo inesperadamente. Intentando reconectar...`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            autoRetryEnabled.current = false;
                                            console.log('🛑 Reintentos automáticos desactivados por el usuario.');
                                        },
                                    },
                                ],
                            );
                        }, delay);
                    } else {
                        console.log('🛑 Demasiados reintentos, deteniendo la reproducción.');
                        Alert.alert(
                            '❌ Error de conexión',
                            'La reproducción no se pudo reanudar después de varios intentos. Por favor, verifica tu conexión a internet o reinicia la aplicación.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        autoRetryEnabled.current = false;
                                        console.log('🛑 Reintentos automáticos desactivados por el usuario.');
                                    },
                                },
                            ],
                        );
                        // Aquí podrías detener la reproducción o mostrar un estado de error
                    }
                }
            }
        } else if (event.type === Event.PlaybackError) {
            console.error('❌ Error de reproducción:', event.error);
            

            if (autoRetryEnabled.current) {
              Netinform.fetch().then((state) => {
                if (!state.isConnected) {
                    Alert.alert(
                        '❌ Error de conexión',
                        'Hubo un problema con la conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo. Reintentando en 10 segundos...',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    autoRetryEnabled.current = false;
                                    console.log('🛑 Reintentos automáticos desactivados por el usuario.');
                                },
                            },
                        ],
                    );
                } else {
                    Alert.alert(
                        'Error de reproducción',
                        `Ocurrió un error al intentar reproducir la radio. Intentando reconectar...`,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    autoRetryEnabled.current = false;
                                    console.log('🛑 Reintentos automáticos desactivados por el usuario.');
                                },
                            },
                        ],
                    );
                }
              })

                if (retryCount.current < maxRetries && autoRetryEnabled.current) {
                    const delay = retryDelayBase * Math.pow(2, retryCount.current);
                    console.log(`⚠️ Error de reproducción, reintentando en ${delay / 1000} segundos (intento <span class="math-inline">\{retryCount\.current \+ 1\}/</span>{maxRetries})...`);
                    setTimeout(() => {
                        TrackPlayer.play();
                        retryCount.current += 1;
                    }, delay);
                } else if (!autoRetryEnabled.current) {
                    console.log('🛑 Reintento automático desactivado, no se intentará de nuevo.');
                } else {
                    console.log('🛑 Demasiados errores, deteniendo la reproducción.');
                    Alert.alert(
                        'Error persistente',
                        'La reproducción no se pudo iniciar debido a múltiples errores. Por favor, verifica tu conexión a internet o intenta más tarde.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    autoRetryEnabled.current = false;
                                    console.log('🛑 Reintentos automáticos desactivados por el usuario.');
                                },
                            },
                        ],
                    );
                    // Aquí podrías detener la reproducción o mostrar un estado de error
                }
            }
        }
    });

    const resetPlayer = async () => {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            setMenuVisible(false);
            retryCount.current = 0; // Reiniciar contador de reintentos al resetear
            autoRetryEnabled.current = true; // Volver a habilitar los reintentos al resetear
            Alert.alert('Reproductor reiniciado', 'Se ha reiniciado el reproductor de radio.');
        } catch (error) {
            console.error('❌ Error al resetear el reproductor:', error);
            Alert.alert('Error', 'Ocurrió un error al intentar reiniciar el reproductor.');
        }
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
                Alert.alert('Error de configuración', 'Ocurrió un error al configurar el reproductor de radio.');
            }
        };

        setup();

        return () => {
            console.log('⛔ App cerrada: Deteniendo TrackPlayer...');
            TrackPlayer.stop();
            TrackPlayer.reset();
            autoRetryEnabled.current = true; // Asegurar que se reinicie al desmontar
        };
    }, []);

    const togglePlayback = async () => {
        const currentState = await TrackPlayer.getState();
        try {
            if (currentState === State.Playing) {
                await TrackPlayer.pause();
            } else {
                setIsLoading(true);
                await TrackPlayer.play();
            }
            retryCount.current = 0; // Reiniciar contador al interactuar manualmente
            autoRetryEnabled.current = true; // Volver a habilitar los reintentos al interactuar
        } catch (error) {
            console.error('❌ Error al controlar la reproducción:', error);
            Alert.alert('Error de reproducción', 'Ocurrió un error al intentar pausar o reproducir la radio.');
        }
    };

    const playNext = async () => {
        if (currentTrackIndex < tracks.length - 1) {
            try {
                const nextIndex = currentTrackIndex + 1;
                setCurrentTrackIndex(nextIndex);
                await TrackPlayer.skip(tracks[nextIndex].id);
                await TrackPlayer.play();
                retryCount.current = 0; // Reiniciar contador al cambiar de pista
                autoRetryEnabled.current = true; // Volver a habilitar los reintentos al interactuar
            } catch (error) {
                console.error('❌ Error al ir a la siguiente emisora:', error);
                Alert.alert('Error', 'Ocurrió un error al intentar cambiar a la siguiente emisora.');
            }
        }
    };

    const playPrevious = async () => {
        if (currentTrackIndex > 0) {
            try {
                const prevIndex = currentTrackIndex - 1;
                setCurrentTrackIndex(prevIndex);
                await TrackPlayer.skip(tracks[prevIndex].id);
                await TrackPlayer.play();
                retryCount.current = 0; // Reiniciar contador al cambiar de pista
                autoRetryEnabled.current = true; // Volver a habilitar los reintentos al interactuar
            } catch (error) {
                console.error('❌ Error al ir a la emisora anterior:', error);
                Alert.alert('Error', 'Ocurrió un error al intentar cambiar a la emisora anterior.');
            }
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `<span class="math-inline">\{String\(mins\)\.padStart\(2, '0'\)\}\:</span>{String(secs).padStart(2, '0')}`;
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
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 24, // puedes ajustar el padding
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
        marginTop: 55,
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