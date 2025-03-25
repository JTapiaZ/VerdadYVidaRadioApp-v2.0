import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { setupPlayer } from '../utils/trackPlayerSetup';
import { SafeAreaView } from 'react-native-safe-area-context';

const track = [
  {
    id: '1',
    url: 'https://stream.zeno.fm/zznllllp06cuv', // URL del audio
    title: 'Verdad y Vida Radio 870',
    artist: 'Verdad y Vida Radio',
    artwork: `${require('../../assets/img/870.jpg')}`, // URL de la imagen
  },
  {
    id: '2',
    url: 'https://stream.zeno.fm/n590rdbh62uuv', // URL del audio
    title: 'Verdad y Vida Radio Online',
    artist: 'Verdad y Vida Radio',
    artwork: `${require('../../assets/img/online.jpg')}`, // URL de la imagen
  },
];

const PlayerScreen = () => {

  useEffect(() => {
    const startPlayer = async () => {
      await setupPlayer();
    };
    startPlayer();
  }, []);
  

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AudioPlayer track={track} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerScreen;
