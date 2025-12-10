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

const getUserIdFromToken = (tok: string): string =>
  tok && /^\d+$/.test(tok) ? tok : '';

const SecurityScreen = () => {

  const { user, token, updateUser } = useAuth();
const userId = String(user?.id ?? '');
if (!userId) return <Text style={styles.errorText}>ID utilisateur manquant.</Text>;

  /* ----------  Champs  ---------- */
  const [fullName, setFullName] = useState(user?.nom ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* ----------  UI  ---------- */
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ----------  Validation  ---------- */
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  /* ----------  Submit  ---------- */
  const handleUpdate = async () => {
    setMessage(''); setMessageType('');

    if (!fullName.trim() && !email.trim() && !password && !confirmPassword) {
      setMessageType('error'); setMessage('Aucune modification détectée.'); return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setMessageType('error'); setMessage('Email invalide.'); return;
    }
    if (password || confirmPassword) {
      if (password.length < 6) {
        setMessageType('error'); setMessage('6 caractères minimum.'); return;
      }
      if (password !== confirmPassword) {
        setMessageType('error'); setMessage('Mots de passe différents.'); return;
      }
    }

    setIsLoading(true);
    const body = {
      ...(fullName.trim() !== user?.nom && { nom: fullName.trim() }),
      ...(email.trim() !== user?.email && { email: email.trim().toLowerCase() }),
      ...(password && { mot_de_passe: password }),
    };

    const res = await authService.updateUser(userId, body);
    setIsLoading(false);

    if (res.success) {
      await updateUser({ email: body.email, password: body.mot_de_passe });
      setMessageType('success'); setMessage('Modifications enregistrées !');
      setPassword(''); setConfirmPassword('');
    } else {
      setMessageType('error'); setMessage(res.message || 'Échec');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>Modifier vos informations de connexion</Text>

          {/* Nom complet */}
          <View style={styles.inputContainer}>
            <Image source={require('@/assets/icons/person.png')} style={styles.icon} />
            <TextInput
              placeholder="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isLoading}
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Image source={require('@/assets/icons/mail.png')} style={styles.icon} />
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

          {/* Mot de passe */}
          <View style={styles.inputContainer}>
            <Image source={require('@/assets/icons/lock.png')} style={styles.icon} />
            <TextInput
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeButton}>
              <Image source={showPassword ? require('@/assets/icons/eye-open.png') : require('@/assets/icons/eye-closed.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {/* Confirmer mot de passe */}
          <View style={styles.inputContainer}>
            <Image source={require('@/assets/icons/lock.png')} style={styles.icon} />
            <TextInput
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)} style={styles.eyeButton}>
              <Image source={showConfirmPassword ? require('@/assets/icons/eye-open.png') : require('@/assets/icons/eye-closed.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          {/* Bouton */}
          <TouchableOpacity style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]} onPress={handleUpdate} disabled={!isFormValid || isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer les modifications</Text>}
          </TouchableOpacity>

          {/* Message */}
          {message ? (
            <View style={[styles.messageContainer, messageType === 'error' ? styles.errorContainer : styles.successContainer]}>
              <Text style={[styles.messageText, messageType === 'error' ? styles.errorText : styles.successText]}>{message}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SecurityScreen;