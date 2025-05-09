import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { initDatabase, getMarkers, saveMarker, deleteAllMarkers } from './database';

// Типы
type Photo = { uri: string };

type MarkerData = {
    id: string;
    latitude: number;
    longitude: number;
    photos: Photo[];
};

const MapScreen = () => {
    const router = useRouter();
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Инициализация базы данных и загрузка маркеров
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Инициализация базы данных
                await initDatabase();
                console.log('База данных успешно инициализирована.');

                // Загрузка маркеров из базы данных
                const loadedMarkers = (await getMarkers()).map((marker) => ({
                    ...marker,
                    photos: [],
                }));
                setMarkers(loadedMarkers);
                console.log('Загруженные маркеры:', loadedMarkers);

                // Запрос разрешений на геолокацию и получение текущей локации
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Ошибка', 'Разрешение на доступ к геолокации не предоставлено.');
                    return;
                }

                const currentLocation = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                });
            } catch (error) {
                Alert.alert('Ошибка', 'Не удалось загрузить данные.');
                console.error('Ошибка инициализации:', error);
            }
        };

        initializeApp();
    }, []);

    // Добавление нового маркера
    const handleAddMarker = async (latitude: number, longitude: number) => {
        try {
            const newMarker: MarkerData = {
                id: Date.now().toString(),
                latitude,
                longitude,
                photos: [],
            };

            // Сохранение маркера в базе данных
            await saveMarker(newMarker.id, newMarker.latitude, newMarker.longitude);
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
            console.log('Маркер добавлен:', newMarker);
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось сохранить маркер в БД.');
            console.error('Ошибка добавления маркера:', error);
        }
    };

    // Обработка нажатия на карту
    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        handleAddMarker(latitude, longitude);
    };
    
    const handleLongPress = async () => {
        Alert.alert(
            'Удалить все маркеры',
            'Вы уверены, что хотите удалить все маркеры?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAllMarkers(); // Удаляем маркеры из базы данных
                            setMarkers([]); // Очищаем состояние маркеров
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить маркеры.');
                            console.error(error);
                        }
                    },
                },
            ]
        );
    };
    // Обработка нажатия на маркер
    const handleMarkerPress = (marker: MarkerData) => {
        router.push({
            pathname: '/markerDetails',
            params: {
                id: marker.id,
                latitude: marker.latitude,
                longitude: marker.longitude,
            },
        });
    };

    if (!location) {
        return null; // Пока локация загружается, ничего не рендерим
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onPress={handleMapPress}
                showsUserLocation={true} // Показываем текущую локацию
                followsUserLocation={true} // Следим за местоположением пользователя
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        onPress={() => handleMarkerPress(marker)}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapScreen;
