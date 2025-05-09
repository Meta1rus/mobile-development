import * as SQLite from 'expo-sqlite';

// Инициализация базы данных
let db: any = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('markers.db');

    // Применяем настройки и создаём таблицы с помощью execAsync
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS markers (
        id TEXT PRIMARY KEY NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY NOT NULL,
        uri TEXT NOT NULL,
        markerId TEXT NOT NULL,
        FOREIGN KEY(markerId) REFERENCES markers(id)
      );
    `);

    console.log('База данных успешно инициализирована.');
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
  }
};

// Сохранение нового маркера
export const saveMarker = async (id: string, latitude: number, longitude: number) => {
  if (!db) {
    console.error('База данных не инициализирована');
    return;
  }

  try {
    // Используем runAsync для INSERT
    await db.runAsync('INSERT INTO markers (id, latitude, longitude) VALUES (?, ?, ?)', id, latitude, longitude);
    console.log('Маркер добавлен');
  } catch (error) {
    console.error('Ошибка добавления маркера:', error);
  }
};

// Получение всех маркеров
export const getMarkers = async (): Promise<{ id: string; latitude: number; longitude: number }[]> => {
  if (!db) {
    console.error('База данных не инициализирована');
    return [];
  }

  try {
    // Используем getAllAsync для SELECT
    const allRows = await db.getAllAsync('SELECT * FROM markers');
    return allRows as { id: string; latitude: number; longitude: number }[];
  } catch (error) {
    console.error('Ошибка получения маркеров:', error);
    return [];
  }
};

// Получение фотографий для маркера
export const getPhotosByMarker = async (markerId: string): Promise<{ id: string; uri: string }[]> => {
  if (!db) {
    console.error('База данных не инициализирована');
    return [];
  }

  try {
    const rows = await db.getAllAsync('SELECT id, uri FROM photos WHERE markerId = ?', markerId);
    return rows as { id: string; uri: string }[];
  } catch (error) {
    console.error('Ошибка загрузки фотографий:', error);
    return [];
  }
};

// Сохранение фотографии
export const savePhoto = async (markerId: string, uri: string) => {
  if (!db) {
    console.error('База данных не инициализирована');
    return;
  }

  try {
    const id = Date.now().toString();
    await db.runAsync('INSERT INTO photos (id, uri, markerId) VALUES (?, ?, ?)', id, uri, markerId);
    console.log('Фотография сохранена');
  } catch (error) {
    console.error('Ошибка сохранения фотографии:', error);
  }
};

// Удаление маркера
export const deleteMarker = async (id: string) => {
  if (!db) {
    console.error('База данных не инициализирована');
    return;
  }

  try {
    await db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
    console.log(`Маркер с ID ${id} успешно удалён`);
  } catch (error) {
    console.error('Ошибка удаления маркера:', error);
  }
};
// Удаление всех маркеров
export const deleteAllMarkers = async () => {
  if (!db) {
    console.error('База данных не инициализирована');
    return;
  }

  try {
    await db.runAsync('DELETE FROM markers', []);
    console.log('Все маркеры успешно удалены');
  } catch (error) {
    console.error('Ошибка удаления всех маркеров:', error);
  }
};