import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IMG } from '../utils';
import React from 'react';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Image 
        source={{
          uri:IMG.LOGO
        }}
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Mifania</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View>
          <Text style={styles.buttonText}>GO TO PROFILE SCREEN</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <View>
          <Text style={styles.buttonText}>Log In</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebd5d5',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonText: {
    fontSize: 16,
    color: '#007BFF',
    backgroundColor: '#fefefe',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default HomeScreen;