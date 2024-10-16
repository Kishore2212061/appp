import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { ref, set } from 'firebase/database';
import { database } from '../../firebase'; // Ensure this points to your Firebase config
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';

const DriverShare = () => {
  const [shareId, setShareId] = useState('');
  const [sharePass, setSharePass] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleStartShare = async () => {
    // Validate inputs
    if (!shareId || !sharePass || !secretKey) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to share your location.');
        return;
      }

      // Store share ID and password securely
      await AsyncStorage.setItem('shareId', shareId);
      await AsyncStorage.setItem('sharePass', sharePass);
      await AsyncStorage.setItem('secretKey', secretKey);

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Location Sharing',
          notificationBody: 'Your location is being shared.',
        },
      });

      setIsSharing(true);
      Alert.alert('Success', 'You are now sharing your location.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    // Monitor changes in shareId for location updates.
    let unsubscribe;
    if (isSharing) {
      unsubscribe = Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (location) => {
          const { latitude, longitude } = location.coords;
          const locationRef = ref(database, `drivers/${shareId}/location`);
          set(locationRef, {
            latitude,
            longitude,
            timestamp: Date.now(),
          });
        }
      );
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe.then(() => console.log('Unsubscribed from location updates'));
      }
    };
  }, [shareId, isSharing]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Location</Text>
      <TextInput
        placeholder="Enter Share ID"
        value={shareId}
        onChangeText={setShareId}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Share Password"
        value={sharePass}
        onChangeText={setSharePass}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Secret Key"
        value={secretKey}
        onChangeText={setSecretKey}
        secureTextEntry
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleStartShare}>
        <Text style={styles.buttonText}>Start Sharing</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

// Define the task to handle location updates in the background
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const { locations } = data;
    const [location] = locations;
    const { latitude, longitude } = location.coords;

    // Retrieve shareId from AsyncStorage to update the correct location reference in the database
    const shareId = await AsyncStorage.getItem('shareId');
    if (shareId) {
      const locationRef = ref(database, `drivers/${shareId}/location`);
      await set(locationRef, {
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    }
  }
});

export default DriverShare;
