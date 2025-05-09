import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

const Layout = () => {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
