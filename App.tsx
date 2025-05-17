import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        return;
      }
      subscribe();
    })();
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = () => {
    Accelerometer.setUpdateInterval(500);
    Accelerometer.addListener(accelerometerData => {
      checkForFall(accelerometerData);
    });
  };

  const checkForFall = async ({ x, y, z }: AccelerometerMeasurement) => {
    const limit = 1.5; // Limite de aceleração para detecção de queda
    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        alertFall(location);
      } catch (error) {
        setErrorMsg('Erro ao obter localização');
      }
    }
  };

  const unsubscribe = () => {
    Accelerometer.removeAllListeners();
  };

  const alertFall = (location: Location.LocationObject) => {
    Alert.alert(
      "Queda Detectada",
      `Uma queda foi detectada. Localização: ${location.coords.latitude}, ${location.coords.longitude}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detector de Quedas</Text>
      <Text style={styles.text}>
        {errorMsg
          ? errorMsg
          : `Latitude: ${location ? location.coords.latitude : ''}, Longitude: ${location ? location.coords.longitude : ''}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5FCFF',
},
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
});