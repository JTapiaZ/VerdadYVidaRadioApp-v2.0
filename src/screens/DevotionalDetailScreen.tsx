import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const DevotionalDetailScreen = ({ route }) => {
  const { devotionalId } = route.params;
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devotionalRef = doc(db, 'devotionals', devotionalId);
    
    const unsubscribe = onSnapshot(devotionalRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setDevotional(docSnapshot.data());
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [devotionalId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ed573" />
      </View>
    );
  }

  if (!devotional) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Devocional no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {devotional.videoUrl && (
        <Video
          source={{ uri: devotional.videoUrl }}
          style={styles.video}
          controls
          resizeMode="contain"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{devotional.title}</Text>
        <Text style={styles.text}>{devotional.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  content: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#57606f',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DevotionalDetailScreen;