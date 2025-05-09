import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMarkers, saveMarker } from './database';

// Типы для фотографий и маркеров
type Photo = {
    id: string;
    uri: string;
};

type Marker = {
    id: string;
    latitude: number;
    longitude: number;
    photos: Photo[];
};

type MarkerContextType = {
    markers: Marker[];
    setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
    addMarker: (latitude: number, longitude: number) => Promise<void>;
};

// Создаём контекст
const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export const MarkerProvider = ({ children }: { children: React.ReactNode }) => {
    const [markers, setMarkers] = useState<Marker[]>([]);

    // Загружаем маркеры из базы данных при монтировании компонента
    useEffect(() => {
        const loadMarkers = async () => {
            try {
                const loadedMarkers = await getMarkers();

                // Добавляем поле `photos` (пустой массив), так как база данных возвращает только координаты
                const enrichedMarkers = loadedMarkers.map((marker) => ({
                    ...marker,
                    photos: [], // Пока оставляем пустым, если не загружаем фото из БД
                }));
                setMarkers(enrichedMarkers);
            } catch (error) {
                console.error('Ошибка загрузки маркеров из базы данных:', error);
            }
        };

        loadMarkers();
    }, []);

    // Метод для добавления нового маркера
    const addMarker = async (latitude: number, longitude: number) => {
        const newMarker: Marker = {
            id: Date.now().toString(),
            latitude,
            longitude,
            photos: [], // Пока фотографии не добавляем
        };

        try {
            // Сохраняем маркер в базе данных
            await saveMarker(newMarker.id, newMarker.latitude, newMarker.longitude);

            // Обновляем локальное состояние
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        } catch (error) {
            console.error('Ошибка добавления маркера в базу данных:', error);
        }
    };

    return (
        <MarkerContext.Provider value={{ markers, setMarkers, addMarker }}>
            {children}
        </MarkerContext.Provider>
    );
};

// Хук для доступа к контексту
export const useMarkerContext = () => {
    const context = useContext(MarkerContext);
    if (!context) {
        throw new Error('useMarkerContext должен использоваться внутри MarkerProvider');
    }
    return context;
};
