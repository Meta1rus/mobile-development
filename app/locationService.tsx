import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

// Функция для расчёта расстояния между двумя координатами (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Радиус Земли в метрах

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в метрах
};

// Функция для проверки близости пользователя к маркерам
export const checkProximity = async (
  userCoords: { latitude: number; longitude: number },
  markers: { id: string; latitude: number; longitude: number }[],
  radius: number
) => {
  for (const marker of markers) {
    const distance = getDistance(
      userCoords.latitude,
      userCoords.longitude,
      marker.latitude,
      marker.longitude
    );

    if (distance < radius) {
      console.log(`Вы близко к точке ID: ${marker.id}, расстояние: ${distance} м`);
      await sendNotification(`Вы находитесь рядом с точкой ID: ${marker.id}`);
    }
  }
};

// Функция для отправки локального уведомления
const sendNotification = async (message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Уведомление',
      body: message,
    },
    trigger: null, // Уведомление сразу
  });
};

// Запрос разрешений для уведомлений (должен быть вызван в index.tsx )
export const requestNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
};
