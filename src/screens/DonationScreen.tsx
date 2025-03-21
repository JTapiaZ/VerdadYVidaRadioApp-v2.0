import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ...
const DonationScreen = () => {
  return <WebView source={{ uri: 'https://mvv.org.co/Donar.html' }} style={{ flex: 1 }} />;
}

export default DonationScreen;