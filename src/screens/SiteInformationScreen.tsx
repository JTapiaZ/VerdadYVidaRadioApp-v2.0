import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ...
const SiteInformationScreen = () => {
  return <WebView source={{ uri: 'https://mvv.org.co/belen.html' }} style={{ flex: 1 }} />;
}

export default SiteInformationScreen;