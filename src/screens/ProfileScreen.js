import { View, Text, Alert, Image, StyleSheet, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import IMG from '../utils/image';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const handleEdit = () =>{
    Alert.alert('Edit Profile');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?',[
      { text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes',
          onPress: () => {
            navigation.navigate('Home');
          }
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:IMG.LOGO,
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.email}>john.doe@email.com</Text>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#121212',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 30,
  },
  editButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  editText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4d4d',
    fontWeight: '600',
  },
})

export default ProfileScreen