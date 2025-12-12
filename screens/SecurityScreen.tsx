import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { styles } from '@/styles/registerStyles';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

/* ----------  helper  ---------- */
const getUserIdFromToken = (tok: string): string =>
  tok && /^\d+$/.test(tok) ? tok : '';

/* ----------  composant  ---------- */
const SecurityScreen = () => {
  const { user, token, updateUser } = useAuth();
  const userId = String(user?.id ?? '');

  if (!userId)
    return <Text style={styles.errorText}>ID utilisateur manquant.</Text>;

  /* ----------  champs formulaire  ---------- */
  const [fullName, setFullName] = useState(user?.nom ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  /* ----------  UI  ---------- */
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ----------  validation  ---------- */
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const emailChanged = email.trim() !== user?.email;
  const passwordChanged = !!password;
  const needsCurrentPassword = emailChanged || passwordChanged;

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    (!needsCurrentPassword || currentPassword.length >= 6) &&
    (!passwordChanged || password.length >= 6) &&
    (!passwordChanged || confirmPassword.length > 0) &&
    password === confirmPassword;

  /* ----------  soumission  ---------- */
  const handleUpdate = async () => {
    setMessage('');
    setMessageType('');

    /* 1. aucune modif */
    if (
      fullName.trim() === user?.nom &&
      !emailChanged &&
      !passwordChanged
    ) {
      setMessageType('error');
      setMessage('Aucune modification détectée.');
      return;
    }

    /* 2. email invalide */
    if (email.trim() && !isValidEmail(email)) {
      setMessageType('error');
      setMessage('Email invalide.');
      return;
    }

    /* 3. règles mot de passe */
    if (passwordChanged) {
      if (password.length < 6) {
        setMessageType('error');
        setMessage('6 caractères minimum.');
        return;
      }
      if (password !== confirmPassword) {
        setMessageType('error');
        setMessage('Mots de passe différents.');
        return;
      }
    }

    /* 4. mot de passe actuel manquant */
    if (needsCurrentPassword && !currentPassword) {
      setMessageType('error');
      setMessage('Veuillez saisir votre mot de passe actuel.');
      return;
    }

    setIsLoading(true);

    const body: any = {
      ...(fullName.trim() !== user?.nom && { nom: fullName.trim() }),
      ...(emailChanged && { email: email.trim().toLowerCase() }),
      ...(passwordChanged && { mot_de_passe: password }),
      ...(needsCurrentPassword && { currentPassword }),
    };

    const res = await authService.updateUser(userId, body);
    setIsLoading(false);

    if (res.success) {
      await updateUser({ email: body.email, password: body.mot_de_passe });
      setMessageType('success');
      setMessage('Modifications enregistrées !');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } else {
      setMessageType('error');
      setMessage(res.message || 'Échec');
    }
  };

  /* ----------  rendu  ---------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>
            Modifier vos informations de connexion
          </Text>

          {/* ----- Nom complet ----- */}
          <View style={styles.inputContainer}>
            <Image
              source={require('@/assets/icons/person.png')}
              style={styles.icon}
            />
            <TextInput
              placeholder="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isLoading}
              style={styles.input}
            />
          </View>

          {/* ----- Email ----- */}
          <View style={styles.inputContainer}>
            <Image
              source={require('@/assets/icons/mail.png')}
              style={styles.icon}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              style={styles.input}
            />
          </View>

          {/* ----- Mot de passe actuel (si besoin) ----- */}
          {needsCurrentPassword && (
            <View style={styles.inputContainer}>
              <Image
                source={require('@/assets/icons/lock.png')}
                style={styles.icon}
              />
              <TextInput
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                editable={!isLoading}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((s) => !s)}
                style={styles.eyeButton}
              >
                <Image
                  source={
                    showCurrent
                      ? require('@/assets/icons/eye-open.png')
                      : require('@/assets/icons/eye-closed.png')
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* ----- Nouveau mot de passe ----- */}
          <View style={styles.inputContainer}>
            <Image
              source={require('@/assets/icons/lock.png')}
              style={styles.icon}
            />
            <TextInput
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              style={styles.eyeButton}
            >
              <Image
                source={
                  showPassword
                    ? require('@/assets/icons/eye-open.png')
                    : require('@/assets/icons/eye-closed.png')
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* ----- Confirmer mot de passe ----- */}
          <View style={styles.inputContainer}>
            <Image
              source={require('@/assets/icons/lock.png')}
              style={styles.icon}
            />
            <TextInput
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((p) => !p)}
              style={styles.eyeButton}
            >
              <Image
                source={
                  showConfirmPassword
                    ? require('@/assets/icons/eye-open.png')
                    : require('@/assets/icons/eye-closed.png')
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* ----- Bouton ----- */}
          <TouchableOpacity
            style={[
              styles.button,
              (!isFormValid || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Enregistrer les modifications
              </Text>
            )}
          </TouchableOpacity>

          {/* ----- Message retour ----- */}
          {message ? (
            <View
              style={[
                styles.messageContainer,
                messageType === 'error'
                  ? styles.errorContainer
                  : styles.successContainer,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  messageType === 'error'
                    ? styles.errorText
                    : styles.successText,
                ]}
              >
                {message}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SecurityScreen;