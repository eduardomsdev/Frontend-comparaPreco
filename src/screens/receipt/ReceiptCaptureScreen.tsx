import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReceiptCapture'>;

type Step = 'capture' | 'preview' | 'unavailable';

export function ReceiptCaptureScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('capture');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos da câmera para fotografar a nota fiscal.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setStep('preview');
    }
  }

  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às fotos para escolher a nota fiscal.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setStep('preview');
    }
  }

  function handleSend() {
    // O backend ainda não expõe upload/OCR de nota fiscal (ver API-CONTRACT.md).
    // Deixamos o fluxo pronto na interface e explicamos isso ao usuário, em vez
    // de simular um processamento que não existe de verdade.
    setStep('unavailable');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 'capture' ? (
        <Card style={styles.centeredCard}>
          <Text style={styles.icon}>🧾</Text>
          <Text style={styles.title}>Enviar nota fiscal</Text>
          <Text style={styles.description}>Tire uma foto da nota ou escolha uma imagem da galeria para registrar sua compra.</Text>
          <Button label="Tirar foto" onPress={handleTakePhoto} style={styles.fullWidthButton} />
          <Button label="Escolher da galeria" variant="secondary" onPress={handlePickFromGallery} style={styles.fullWidthButton} />
        </Card>
      ) : null}

      {step === 'preview' && photoUri ? (
        <Card style={styles.centeredCard}>
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          <Button label="Enviar" onPress={handleSend} style={styles.fullWidthButton} />
          <Button
            label="Tirar outra foto"
            variant="ghost"
            onPress={() => {
              setPhotoUri(null);
              setStep('capture');
            }}
          />
        </Card>
      ) : null}

      {step === 'unavailable' ? (
        <Card style={styles.centeredCard}>
          <Text style={styles.icon}>🚧</Text>
          <Text style={styles.title}>Leitura automática em breve</Text>
          <Text style={styles.description}>
            A leitura automática de notas fiscais ainda não está disponível. Por enquanto, você pode registrar os itens da
            compra manualmente — sua compra continua sendo salva normalmente.
          </Text>
          <Button label="Adicionar itens manualmente" onPress={() => navigation.replace('NewPurchase')} style={styles.fullWidthButton} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  centeredCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fullWidthButton: {
    alignSelf: 'stretch',
  },
  preview: {
    width: '100%',
    height: 320,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
});
