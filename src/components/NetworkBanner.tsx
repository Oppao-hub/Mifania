import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      Animated.timing(slideAnim, {
        toValue: insets.top || 40,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, slideAnim, insets.top]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Icon name="cloud-offline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
      <Text style={styles.text}>No Connection. You are offline.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#DC3545',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },
});

export default NetworkBanner;
