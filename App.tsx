import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Modal } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<{ id: string; latitude: number; longitude: number; title: string; description: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const goToCurrentLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const savePlace = () => {
    if (!location) return;
    const newPlace = {
      id: Date.now().toString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      title: placeName || "สถานที่ที่บันทึก",
      description: placeDesc || "ไม่มีคำบรรยาย",
    };
    setPlaces([...places, newPlace]);
    setPlaceName("");
    setPlaceDesc("");
    setModalVisible(false);
  };

  const goToPlace = (place: any) => {
    mapRef.current?.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const initialRegion: Region = {
    latitude: location?.coords.latitude || 17.803266,
    longitude: location?.coords.longitude || 102.747888,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        style={styles.map}
        mapType="mutedStandard"
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.title}
            description={place.description}
          />
        ))}
      </MapView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={goToCurrentLocation}>
          <Text style={styles.buttonText}>📍 ตำแหน่งปัจจุบัน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>💾 บันทึกสถานที่</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => goToPlace(item)}>
            <Text style={styles.cardTitle}>📍 {item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มสถานที่ใหม่</Text>
            <TextInput style={styles.input} placeholder="ชื่อสถานที่" value={placeName} onChangeText={setPlaceName} />
            <TextInput style={styles.input} placeholder="คำบรรยาย" value={placeDesc} onChangeText={setPlaceDesc} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={savePlace}>
                <Text style={styles.buttonText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  map: { width: "100%", height: "55%" },
  buttons: { flexDirection: "row", justifyContent: "space-around", padding: 10 },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: { backgroundColor: "#2196F3" },
  cancelButton: { backgroundColor: "#f44336" },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  list: { flex: 1, marginHorizontal: 10, marginTop: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  cardDesc: { color: "#555", marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "85%", backgroundColor: "white", padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 10, borderRadius: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});
