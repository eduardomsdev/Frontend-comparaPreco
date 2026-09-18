import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, TextField } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequestSchema } from '../../schemas/api';
import { friendlyMessage, toApiError } from '../../services/api/errors';
import { colors, spacing, typography } from '../../theme';
import { collectFieldErrors } from '../../utils/validation';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const payload = { name: name.trim(), email: email.trim(), password };
    const errors = collectFieldErrors(RegisterRequestSchema, payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signUp(payload);
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
        setFieldErrors(apiError.details);
      } else if (apiError.code === 'EMAIL_ALREADY_EXISTS') {
        setFieldErrors({ email: 'Este e-mail já está cadastrado' });
      } else {
        setFormError(friendlyMessage(apiError));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Leva menos de um minuto</Text>
        </View>

        <View style={styles.form}>
          <TextField label="Nome" value={name} onChangeText={setName} textContentType="name" errorMessage={fieldErrors.name} />
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            errorMessage={fieldErrors.email}
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            errorMessage={fieldErrors.password}
          />
          <Text style={styles.hint}>Mínimo de 8 caracteres</Text>

          {formError ? (
            <Text style={styles.formError} accessibilityRole="alert">
              {formError}
            </Text>
          ) : null}

          <Button label="Criar conta" onPress={handleSubmit} loading={isSubmitting} style={styles.submitButton} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Button label="Entrar" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.displayTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  formError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
