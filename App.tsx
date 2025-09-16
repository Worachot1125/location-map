import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, FlatList, TextInput, Modal, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<{ id: string; latitude: number; longitude: number; title: string; description: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const mapRef = useRef<MapView>(null);

  // ขอ permission ตอนเริ่มต้น
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

  // ฟังก์ชันหาตำแหน่งปัจจุบัน
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

  // ฟังก์ชันบันทึกสถานที่
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

  // ฟังก์ชันไปยังสถานที่ที่เลือก
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
        <Button title="ตำแหน่งปัจจุบัน" onPress={goToCurrentLocation} />
        <Button title="บันทึกสถานที่" onPress={() => setModalVisible(true)} />
      </View>

      <FlatList
        style={styles.list}
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => goToPlace(item)}>
            <Text style={styles.listItem}>📍 {item.title} - {item.description}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal กรอกชื่อ/คำบรรยาย */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>ชื่อสถานที่:</Text>
            <TextInput style={styles.input} value={placeName} onChangeText={setPlaceName} />
            <Text>คำบรรยาย:</Text>
            <TextInput style={styles.input} value={placeDesc} onChangeText={setPlaceDesc} />
            <Button title="บันทึก" onPress={savePlace} />
            <Button title="ยกเลิก" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "60%" },
  buttons: { flexDirection: "row", justifyContent: "space-around", padding: 10 },
  list: { flex: 1, backgroundColor: "#f0f0f0" },
  listItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 5, borderRadius: 5 },
});
