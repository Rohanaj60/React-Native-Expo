// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import * as Location from 'expo-location';

// const DashboardScreen = () => {
//   const [isTracking, setIsTracking] = useState(false);
//   const [coordinates, setCoordinates] = useState([]); // Array to hold coordinates
//   const [area, setArea] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [locationStatus, setLocationStatus] = useState('');

//   // Request permission to access location when the component mounts
//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         setLocationStatus('Location permission denied');
//       } else {
//         setLocationStatus('Permission granted');
//         setCoordinates([1,1])
//       }
//     })();
//   }, []);

//   // Function to start tracking coordinates
//   const startTracking = async () => {
//     setIsTracking(true);
//     setCoordinates([]); // Reset coordinates
//     setArea(null); // Reset area calculation
//     setLocationStatus('Fetching location...');

//     // Start watching the location
//     Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.High, // Set the accuracy level
//         distanceInterval: 10, // Update location every 10 meters
//         timeInterval: 10000, // Update location every 10 seconds
//       },
//       (location) => {
//         // Only update coordinates if tracking is true
//         if (isTracking && location.coords) {
//           setCoordinates((prevCoordinates) => [
//             ...prevCoordinates,
//             { lat: location.coords.latitude, long: location.coords.longitude },
//           ]);
//         }
//       },
//       (error) => {
//         setErrorMsg(`Error fetching location: ${error.message}`);
//         setLocationStatus(`Error: ${error.message}`);
//       }
//     );
//   };

//   // Function to stop tracking and calculate the area
//   const stopTracking = () => {
//     setIsTracking(false);

//     if (coordinates.length >= 2) {
//       const length = Math.abs(coordinates[0].lat - coordinates[1].lat); // Length of the rectangle
//       const width = Math.abs(coordinates[0].long - coordinates[1].long); // Width of the rectangle
//       const calculatedArea = length * width; // Rectangle area formula
//       setArea(calculatedArea);
//     } else {
//       setErrorMsg('Not enough coordinates to calculate area');
//       setLocationStatus('Not enough data to calculate area');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Dashboard Screen</Text>
//       <Text>{locationStatus}</Text>
//       <Text>{errorMsg && errorMsg}</Text>

//       {/* Start or Stop Walk button */}
//       {isTracking ? (
//         <Button title="Stop Walk" onPress={stopTracking} />
//       ) : (
//         <Button title="Start Walk" onPress={startTracking} />
//       )}

//       {/* Show coordinates */}
//       <Text>Coordinates: {JSON.stringify(coordinates)}</Text>

//       {/* Display area if calculated */}
//       {area !== null && (
//         <Text style={styles.areaText}>Calculated Area: {area} square meters</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   header: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   areaText: {
//     fontSize: 18,
//     marginTop: 20,
//     fontWeight: 'bold',
//   },
// });

// export default DashboardScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const DashboardScreen = () => {
  const [coordinates, setCoordinates] = useState([]); // Store the current coordinates as an array
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [area, setArea] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationWatcher, setLocationWatcher] = useState(null); // State for the location watcher
  const isTrackingRef = useRef(isTracking); // Use useRef to track the latest isTracking value

  // Update isTrackingRef when isTracking state changes
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Request permission and get current location on initial render
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLocationStatus('Location permission denied');
        return;
      }

      setLocationStatus('Permission granted');
      try {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCoordinates([{
          lat: coords.latitude,
          long: coords.longitude,
        }]);
        setLocationStatus('Location fetched');
      } catch (error) {
        setErrorMsg(`Error fetching location: ${error.message}`);
        setLocationStatus(`Error: ${error.message}`);
      }
    };

    getLocation();
  }, []);

  // Function to start tracking coordinates
  const startTracking = async () => {
    setIsTracking(true);
    setCoordinates([]); // Reset coordinates for new walk
    setArea(null); // Reset area calculation
    setLocationStatus('Fetching location...');

    // Start watching the location
    const watcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High, // Set the accuracy level
        distanceInterval: 1, // Update location every 1 meter
        timeInterval: 1000, // Update location every 1 second
      },
      (location) => {
        if (isTrackingRef.current && location.coords) {
          setCoordinates((prevCoordinates) => [
            ...prevCoordinates,
            { lat: location.coords.latitude, long: location.coords.longitude },
          ]);
        }
      },
      (error) => {
        setErrorMsg(`Error fetching location: ${error.message}`);
        setLocationStatus(`Error: ${error.message}`);
      }
    );

    // Store the location watcher to stop it later
    setLocationWatcher(watcher);
  };

  // Function to stop tracking and calculate the area
  const stopTracking = () => {
    if (locationWatcher) {
      locationWatcher.remove(); // Stop watching location
    }
    setIsTracking(false);

    if (coordinates.length >= 2) {
      const length = Math.abs(coordinates[0].lat - coordinates[1].lat); // Length of the rectangle
      const width = Math.abs(coordinates[0].long - coordinates[1].long); // Width of the rectangle
      const calculatedArea = length * width; // Rectangle area formula
      setArea(calculatedArea);
    } else {
      setErrorMsg('Not enough coordinates to calculate area');
      setLocationStatus('Not enough data to calculate area');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Location Dashboard</Text>
      <Text style={styles.status}>{locationStatus}</Text>
      <Text style={styles.error}>{errorMsg && errorMsg}</Text>

      {/* Show the current coordinates */}
      {coordinates.length > 0 ? (
        <Text style={styles.coordinatesText}>
          Current Coordinates: {`Lat: ${coordinates[coordinates.length - 1].lat}, Long: ${coordinates[coordinates.length - 1].long}`}
        </Text>
      ) : (
        <ActivityIndicator size="large" color="#13a6eb" />
      )}

      {/* Start or Stop Walk button */}
      <TouchableOpacity
        style={styles.button}
        onPress={isTracking ? stopTracking : startTracking}
      >
        <Text style={styles.buttonText}>{isTracking ? 'Stop Walk' : 'Start Walk'}</Text>
      </TouchableOpacity>

      {/* Display area if calculated */}
      {area !== null && (
        <Text style={styles.areaText}>Calculated Area: {area.toFixed(2)} square meters</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    // color: '#4CAF50',
    color: '#13a6eb',

    
    marginTop: 10,
  },
  error: {
    fontSize: 16,
    color: '#E53935',
    marginTop: 10,
  },
  coordinatesText: {
    fontSize: 16,
    color: '#333',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#13a6eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  areaText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen;
