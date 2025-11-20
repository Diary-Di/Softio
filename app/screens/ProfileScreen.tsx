import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/profileScreenStyles';

interface User {
  name: string;
  email: string;
  avatar: string;
  accountType: string;
}

interface MenuItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

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
  const [user] = useState<User>({
    name: 'Jean Dupont',
    email: 'jean.dupont@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&size=200&background=4285F4&color=fff',
    accountType: 'Personnel'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header avec avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <TouchableOpacity style={styles.manageAccountButton}>
            <Text style={styles.manageAccountText}>Gérer votre compte Google</Text>
          </TouchableOpacity>
        </View>

        {/* Section Comptes */}
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

        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARAMÈTRES</Text>
          
          <MenuItem
            iconName="settings-outline"
            title="Paramètres généraux"
            subtitle="Notifications, mode sombre"
            onPress={() => console.log('Paramètres généraux')}
          />
          
          <MenuItem
            iconName="shield-checkmark-outline"
            title="Confidentialité et sécurité"
            subtitle="Contrôles de confidentialité"
            onPress={() => console.log('Confidentialité')}
          />
        </View>

        {/* Section Aide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AIDE ET COMMENTAIRES</Text>
          
          <MenuItem
            iconName="help-circle-outline"
            title="Aide"
            onPress={() => console.log('Aide')}
          />
          
          <MenuItem
            iconName="chatbubble-outline"
            title="Envoyer des commentaires"
            onPress={() => console.log('Commentaires')}
          />
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#d93025" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidentialité • Conditions d'utilisation</Text>
          <Text style={styles.footerVersion}>Version 2024.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}