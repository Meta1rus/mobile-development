import React, { useEffect, useState } from 'react';
import MapScreen from './map';
import * as Location from 'expo-location';
import { checkProximity, requestNotificationPermission } from './locationService';
import { getMarkers } from './database';

const Index = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markers, setMarkers] = useState<{ id: string; latitude: number; longitude: number }[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const PROXIMITY_RADIUS = 100; // Радиус приближения в метрах

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Запрос разрешений на геолокацию
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Разрешение на доступ к геолокации не предоставлено.');
          return;
        }

        setHasPermission(true);

        // Запрос разрешений на уведомления
        await requestNotificationPermission();

        // Получение текущего местоположения
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        // Загрузка маркеров из базы данных
        const loadedMarkers = await getMarkers();
        setMarkers(loadedMarkers);

        // Запуск отслеживания местоположения
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10 },
          (newLocation) => {
            const userCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setLocation(userCoords);

            // Проверка близости к маркерам
            checkProximity(userCoords, loadedMarkers, PROXIMITY_RADIUS);
          }
        );
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
      }
    };

    initializeApp();
  }, []);

  if (!hasPermission || !location) {
    return null; // Пока нет разрешений или локации, ничего не рендерим
  }

  return <MapScreen />;
};

export default Index;
