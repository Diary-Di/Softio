import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { newSalesStyles } from '../styles/NewSalesStyles';

// Types
type SaleForm = {
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  date: string;
  notes: string;
};

type FormErrors = {
  [key in keyof SaleForm]?: string;
};

// Mock data
const MOCK_PRODUCTS = [
  'Bouquet de Roses',
  'Pain Complet',
  'Laptop Dell XPS 13',
  'iPhone 14 Pro',
  'Samsung Galaxy S23',
  'Autre',
];

const MOCK_CUSTOMERS = [
  'Marie Dupont',
  'Paul Martin',
  'Sophie Bernard',
  'Jean Leclerc',
  'Nouveau client',
];

export default function NewSalesScreen({ navigation }: any) {
  const [formData, setFormData] = useState<SaleForm>({
    customerName: '',
    customerPhone: '',
    productName: '',
    quantity: '1',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Handle input changes
  const handleInputChange = useCallback((field: keyof SaleForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Mark field as touched
  const handleBlur = useCallback((field: keyof SaleForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  }, [formData]);

  // Validate individual field
  const validateField = useCallback((field: keyof SaleForm, value: any) => {
    let error = '';

    switch (field) {
      case 'customerName':
        if (!value.trim()) error = 'Le nom du client est obligatoire';
        else if (value.trim().length < 2) error = 'Le nom doit contenir au moins 2 caractères';
        break;

      case 'customerPhone':
        if (value && !value.trim().match(/^[\d\s\-\+()]+$/)) 
          error = 'Numéro de téléphone invalide';
        break;

      case 'productName':
        if (!value.trim()) error = 'Le produit est obligatoire';
        break;

      case 'quantity':
        if (!value.trim()) error = 'La quantité est obligatoire';
        else if (isNaN(parseInt(value)) || parseInt(value) <= 0) 
          error = 'La quantité doit être un nombre positif';
        break;

      case 'unitPrice':
        if (!value.trim()) error = 'Le prix unitaire est obligatoire';
        else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) 
          error = 'Le prix doit être un nombre positif';
        break;

      case 'date':
        if (!value.trim()) error = 'La date est obligatoire';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let isValid = true;

    const requiredFields: (keyof SaleForm)[] = [
      'customerName',
      'productName',
      'quantity',
      'unitPrice',
      'date',
    ];

    requiredFields.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });

    return isValid;
  }, [formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setTouched(allTouched);

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Replace with actual API call:
      // const response = await api.post('/sales', {
      //   ...formData,
      //   quantity: parseInt(formData.quantity),
      //   unitPrice: parseFloat(formData.unitPrice),
      //   totalPrice: parseInt(formData.quantity) * parseFloat(formData.unitPrice)
      // });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Succès',
        'Vente enregistrée avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la vente');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // Calculate total
  const quantity = parseInt(formData.quantity) || 0;
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const total = quantity * unitPrice;

  const isFormValid =
    formData.customerName.trim() &&
    formData.productName.trim() &&
    formData.quantity.trim() &&
    formData.unitPrice.trim() &&
    formData.date.trim() &&
    !Object.values(errors).some(error => error);

  return (
    <SafeAreaView style={newSalesStyles.safeArea}>
      {/* Header */}
      <View style={newSalesStyles.header}>
        <TouchableOpacity
          style={newSalesStyles.cancelButton}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={newSalesStyles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <Text style={newSalesStyles.headerTitle}>Nouvelle Vente</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* Form */}
      <ScrollView
        style={newSalesStyles.formContainer}
        contentContainerStyle={newSalesStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CUSTOMER SECTION */}
        <Text style={newSalesStyles.sectionTitle}>Client</Text>

        {/* Customer Name */}
        <View style={newSalesStyles.inputGroup}>
          <Text style={newSalesStyles.label}>
            Nom du Client <Text style={newSalesStyles.required}>*</Text>
          </Text>
          <View style={newSalesStyles.picker}>
            <Picker
              selectedValue={formData.customerName}
              onValueChange={(value) => handleInputChange('customerName', value)}
              enabled={!isSubmitting}
              style={
                Platform.OS === 'ios'
                  ? newSalesStyles.pickerIOS
                  : newSalesStyles.pickerAndroid
              }
            >
              <Picker.Item label="Sélectionnez ou créez un client" value="" />
              {MOCK_CUSTOMERS.map((customer) => (
                <Picker.Item key={customer} label={customer} value={customer} />
              ))}
            </Picker>
          </View>
          {touched.customerName && errors.customerName && (
            <Text style={newSalesStyles.errorText}>{errors.customerName}</Text>
          )}
        </View>

        {/* Customer Phone */}
        <View style={newSalesStyles.inputGroup}>
          <Text style={newSalesStyles.label}>Téléphone (optionnel)</Text>
          <TextInput
            style={[
              newSalesStyles.textInput,
              touched.customerPhone && errors.customerPhone && newSalesStyles.errorInput
            ]}
            value={formData.customerPhone}
            onChangeText={(value) => handleInputChange('customerPhone', value)}
            onBlur={() => handleBlur('customerPhone')}
            placeholder="+33 1 23 45 67 89"
            placeholderTextColor="#999"
            editable={!isSubmitting}
            keyboardType="phone-pad"
          />
          {touched.customerPhone && errors.customerPhone && (
            <Text style={newSalesStyles.errorText}>{errors.customerPhone}</Text>
          )}
        </View>

        {/* PRODUCT SECTION */}
        <Text style={newSalesStyles.sectionTitle}>Produit</Text>

        {/* Product Name */}
        <View style={newSalesStyles.inputGroup}>
          <Text style={newSalesStyles.label}>
            Produit <Text style={newSalesStyles.required}>*</Text>
          </Text>
          <View style={newSalesStyles.picker}>
            <Picker
              selectedValue={formData.productName}
              onValueChange={(value) => handleInputChange('productName', value)}
              enabled={!isSubmitting}
              style={
                Platform.OS === 'ios'
                  ? newSalesStyles.pickerIOS
                  : newSalesStyles.pickerAndroid
              }
            >
              <Picker.Item label="Sélectionnez un produit" value="" />
              {MOCK_PRODUCTS.map((product) => (
                <Picker.Item key={product} label={product} value={product} />
              ))}
            </Picker>
          </View>
          {touched.productName && errors.productName && (
            <Text style={newSalesStyles.errorText}>{errors.productName}</Text>
          )}
        </View>

        {/* Quantity and Unit Price Row */}
        <View style={newSalesStyles.rowContainer}>
          {/* Quantity */}
          <View style={[newSalesStyles.inputGroup, newSalesStyles.halfInput]}>
            <Text style={newSalesStyles.label}>
              Quantité <Text style={newSalesStyles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                newSalesStyles.textInput,
                touched.quantity && errors.quantity && newSalesStyles.errorInput
              ]}
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value.replace(/[^0-9]/g, ''))}
              onBlur={() => handleBlur('quantity')}
              placeholder="1"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              editable={!isSubmitting}
            />
            {touched.quantity && errors.quantity && (
              <Text style={newSalesStyles.errorText}>{errors.quantity}</Text>
            )}
          </View>

          {/* Unit Price */}
          <View style={[newSalesStyles.inputGroup, newSalesStyles.halfInput]}>
            <Text style={newSalesStyles.label}>
              Prix Unitaire (€) <Text style={newSalesStyles.required}>*</Text>
            </Text>
            <View style={newSalesStyles.priceContainer}>
              <Text style={newSalesStyles.currencySymbol}>€</Text>
              <TextInput
                style={[
                  newSalesStyles.textInput,
                  newSalesStyles.priceInput,
                  touched.unitPrice && errors.unitPrice && newSalesStyles.errorInput
                ]}
                value={formData.unitPrice}
                onChangeText={(value) =>
                  handleInputChange('unitPrice', value.replace(',', '.'))
                }
                onBlur={() => handleBlur('unitPrice')}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                editable={!isSubmitting}
              />
            </View>
            {touched.unitPrice && errors.unitPrice && (
              <Text style={newSalesStyles.errorText}>{errors.unitPrice}</Text>
            )}
          </View>
        </View>

        {/* Summary Card */}
        {quantity > 0 && unitPrice > 0 && (
          <View style={newSalesStyles.summaryCard}>
            <View style={newSalesStyles.summaryRow}>
              <Text style={newSalesStyles.summaryLabel}>Quantité</Text>
              <Text style={newSalesStyles.summaryValue}>{quantity}</Text>
            </View>
            <View style={newSalesStyles.summaryRow}>
              <Text style={newSalesStyles.summaryLabel}>Prix Unitaire</Text>
              <Text style={newSalesStyles.summaryValue}>€ {unitPrice.toFixed(2)}</Text>
            </View>
            <View style={[newSalesStyles.summaryRow, newSalesStyles.totalRow]}>
              <Text style={[newSalesStyles.summaryLabel, { fontWeight: '700', fontSize: 16 }]}>
                TOTAL
              </Text>
              <Text style={newSalesStyles.totalValue}>€ {total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* SALE DETAILS SECTION */}
        <Text style={newSalesStyles.sectionTitle}>Détails</Text>

        {/* Date */}
        <View style={newSalesStyles.inputGroup}>
          <Text style={newSalesStyles.label}>
            Date <Text style={newSalesStyles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              newSalesStyles.textInput,
              touched.date && errors.date && newSalesStyles.errorInput
            ]}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            onBlur={() => handleBlur('date')}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            editable={!isSubmitting}
          />
          {touched.date && errors.date && (
            <Text style={newSalesStyles.errorText}>{errors.date}</Text>
          )}
        </View>

        {/* Notes */}
        <View style={newSalesStyles.inputGroup}>
          <Text style={newSalesStyles.label}>Notes (optionnel)</Text>
          <TextInput
            style={[
              newSalesStyles.textInput,
              { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }
            ]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Ajouter des notes sur cette vente..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
            maxLength={500}
          />
        </View>
      </ScrollView>

      {/* Footer with Submit Button */}
      <View style={newSalesStyles.footer}>
        <TouchableOpacity
          style={newSalesStyles.cancelButtonFooter}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={newSalesStyles.cancelButtonFooterText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            newSalesStyles.submitButton,
            (!isFormValid || isSubmitting) && newSalesStyles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text
              style={[
                newSalesStyles.submitButtonText,
                (!isFormValid || isSubmitting) && newSalesStyles.submitButtonTextDisabled
              ]}
            >
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={newSalesStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ color: 'white', marginTop: 12, fontSize: 16 }}>
            Enregistrement en cours...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
