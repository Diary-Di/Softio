// /components/ResetPasswordScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { styles } from '../../styles/forgotPasswordStyles';

type FormData = {
  email: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = ({ email }: FormData) => {
    // TODO: brancher le backend plus tard
    Alert.alert('Lien envoyé', `Un lien de réinitialisation a été envoyé à ${email}`);
    router.back();
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icons/softio-Dark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Titre */}
        <Text style={styles.title}>Réinitialiser le mot de passe</Text>
        <Text style={styles.subtitle}>
          Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Text>

        {/* Champ Email */}
        <TouchableWithoutFeedback onPress={focusInput}>
          <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
            <Image
              source={require('../../assets/icons/mail.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email requis',
                pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={value}
                  onChangeText={onChange}
                  onBlur={() => {
                    onBlur();
                    setFocused(false);
                  }}
                  onFocus={() => setFocused(true)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor="#007bff"
                  cursorColor="#007bff"
                />
              )}
            />
          </View>
        </TouchableWithoutFeedback>
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        {/* Bouton Envoyer */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Envoyer le lien</Text>
        </TouchableOpacity>

        {/* Lien retour */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backContainer}>
          <Text style={styles.backText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}