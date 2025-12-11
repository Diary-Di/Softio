import { Ionicons } from '@expo/vector-icons';
import { NavigationProp as NativeNavigationProp, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { styles } from '../styles/profileScreenStyles';

interface MenuItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

type NavigationProp = NativeNavigationProp<{
  SecurityStack: { screen: 'CreateCompany' | 'Security' };
  ProfileScreen: undefined;
}>;

const MenuItem: React.FC<MenuItemProps> = ({ 
  iconName, 
  title, 
  subtitle, 
  onPress, 
  showChevron = true 
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={22} color="#5f6368" />
      </View>
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {showChevron && <Ionicons name="chevron-forward" size={20} color="#5f6368" />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Aucun utilisateur connecté</Text>
      </SafeAreaView>
    );
  }

  // Génère les initiales à partir du nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView style={styles.scrollView}>
        
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{getInitials(user.nom)}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.nom}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

            <TouchableOpacity
              style={styles.companyButton}
              onPress={() =>
                navigation.navigate({
                name: 'SecurityStack',
                params: { screen: 'CreateCompany' },
              })
            }
              >
              <Text style={styles.companyButtonText}>Mon entreprise</Text>
            </TouchableOpacity>

          </View>

        {/* ---------- SECTION COMPTES ---------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPTES</Text>
          
          <MenuItem
            iconName="person-add-outline"
            title="Ajouter un autre compte"
            onPress={() => console.log('Ajouter compte')}
          />
          
          <MenuItem
            iconName="settings-outline"
            title="Gérer les comptes sur cet appareil"
            onPress={() => console.log('Gérer comptes')}
          />
        </View>

        {/* ---------- SECTION SÉCURITÉ ---------- */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>SÉCURITÉ</Text>

  <MenuItem
    iconName="lock-closed-outline"
    title="Email et mot de passe"
    onPress={() =>
        navigation.navigate({
        name: 'SecurityStack',
        params: { screen: 'Security' }, // ou 'CreateCompany' selon le besoin
      })
    }
  />
</View>

        {/* ---------- BOUTON DÉCONNEXION ---------- */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await logout();
            } finally {
              router.replace('/(auth)/login');
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#d93025" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>


      </ScrollView>
    </SafeAreaView>
  );
}
