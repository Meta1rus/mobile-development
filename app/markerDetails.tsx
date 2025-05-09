import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getPhotosByMarker, savePhoto, deleteMarker } from './database';

type Photo = {
    id: string;
    uri: string;
};

const MarkerDetails = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params as { id: string };

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                if (id) {
                    const loadedPhotos = await getPhotosByMarker(id);
                    setPhotos(loadedPhotos);
                }
            } catch (error) {
                Alert.alert('Ошибка', 'Не удалось загрузить фотографии.');
                console.error('Ошибка загрузки фотографий:', error);
            }
        };

        loadPhotos();
    }, [id]);

    const handleAddPhotoFromCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            try {
                const uri = result.assets[0].uri;
                await savePhoto(id, uri);
                const updatedPhotos = await getPhotosByMarker(id);
                setPhotos(updatedPhotos);
            } catch (error) {
                Alert.alert('Ошибка', 'Не удалось сохранить фото.');
                console.error('Ошибка сохранения фото:', error);
            }
        } else {
            Alert.alert('Ошибка', 'Не удалось сделать фото.');
        }
    };

    const handleAddPhotoFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            try {
                const uri = result.assets[0].uri;
                await savePhoto(id, uri);
                const updatedPhotos = await getPhotosByMarker(id);
                setPhotos(updatedPhotos);
            } catch (error) {
                Alert.alert('Ошибка', 'Не удалось сохранить фото.');
                console.error('Ошибка сохранения фото:', error);
            }
        } else {
            Alert.alert('Ошибка', 'Не удалось выбрать фото.');
        }
    };

    const handlePhotoPress = (uri: string) => {
        setSelectedPhoto(uri);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setSelectedPhoto(null);
        setModalVisible(false);
    };

    const handleDeleteMarker = async () => {
        Alert.alert(
            'Удалить маркер',
            'Вы уверены, что хотите удалить этот маркер?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMarker(id);
                            Alert.alert('Успех', 'Маркер успешно удалён.');
                            router.push('/');
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить маркер.');
                            console.error('Ошибка удаления маркера:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Детали маркера</Text>
            <Button title="Добавить фото с камеры" onPress={handleAddPhotoFromCamera} />
            <Button title="Добавить фото из галереи" onPress={handleAddPhotoFromGallery} />

            <ScrollView contentContainerStyle={styles.photoContainer}>
                {photos.map((photo) => (
                    <TouchableOpacity key={photo.id} onPress={() => handlePhotoPress(photo.uri)}>
                        <Image source={{ uri: photo.uri }} style={styles.image} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
                        <Text style={styles.modalCloseText}>Закрыть</Text>
                    </TouchableOpacity>
                    {selectedPhoto && (
                        <Image source={{ uri: selectedPhoto }} style={styles.fullscreenImage} />
                    )}
                </View>
            </Modal>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMarker}>
                <Text style={styles.deleteButtonText}>Удалить маркер</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    fullscreenImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
        borderRadius: 10,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MarkerDetails;
