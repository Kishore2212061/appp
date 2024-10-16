import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase'; // Ensure this points to your Firebase config

const UserTrack = () => {
  const [location, setLocation] = useState(null);
  const [shareId, setShareId] = useState('');
  const [path, setPath] = useState([]); // Store the path of the bus as an array of coordinates

  const handleTrack = () => {
    if (!shareId) {
      Alert.alert('Error', 'Please enter a Share ID to track.');
      return;
    }

    const locationRef = ref(database, `drivers/${shareId}/location`);
    
    // Listen for changes to the driver's location in real time
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Update the current location
        setLocation(data);

        // Update the path with the new location
        setPath((prevPath) => [
          ...prevPath,
          { latitude: data.latitude, longitude: data.longitude },
        ]);
      } else {
        Alert.alert('Error', 'No location data found for this Share ID.');
      }
    });
  };

  useEffect(() => {
    if (location) {
      console.log('Driver location:', location);
    }
  }, [location]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Driver's Location</Text>
      <TextInput
        placeholder="Enter Share ID"
        value={shareId}
        onChangeText={setShareId}
        style={styles.input}
      />
      <Button title="Track Location" onPress={handleTrack} />

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true} // Optional: show user's location
          showsMyLocationButton={true} // Optional: show a button to center on user's location
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Driver's Location"
          />

          {/* Draw a polyline based on the path */}
          {path.length > 1 && (
            <Polyline
              coordinates={path}
              strokeColor="#0000FF" // Blue line for the path
              strokeWidth={3}
            />
          )}
        </MapView>
      )}
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
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});

export default UserTrack;
