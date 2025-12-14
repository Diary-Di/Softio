import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import CustomerCreateModal from '../components/CustomerCreateModal';
import CustomerSearchModal from '../components/customerSearchModal';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import { CartItem, cartService, PaymentMethod, SaleCreationData } from '../services/cartService';
import { Customer, customerService } from '../services/customerService';
import { buildInvoiceHtml, generateInvoicePdf } from '../services/inVoiceService';
import { validationStyles as baseStyles, proformaValidationStyles } from '../styles/CartValidationStyles';
import { PaperFormat, SaleInvoiceData } from '../types/inVoice';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Types & helpers
const formatPrice = (price: number | undefined): string => {
  const value = price || 0;
  return `ar ${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatNumberInput = (value: string): string => {
  if (!value) return '';
  const clean = value.replace(/[^0-9.]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? '' : n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
const cleanNumberValue = (value: string): string => value.replace(/[^0-9.]/g, '');
const getItemPrice = (item: CartItem): number => item.prix_unitaire || item.prix_actuel || 0;
const getCustomerDisplayName = (c: Customer): string => {
  if (c.type === 'entreprise' && c.sigle) return c.sigle;
  if (c.nom && c.prenoms) return `${c.prenoms} ${c.nom}`;
  if (c.nom) return c.nom;
  if (c.prenoms) return c.prenoms;
  return c.email || `Client #${c.identifiant}`;
};
const getPaymentMethodName = (m: PaymentMethod | null): string => {
  if (!m) return 'Non spécifié';
  return PAYMENT_METHODS.find(p => p.id === m)?.name || 'Non spécifié';
};

const PAYMENT_METHODS = [
  { id: 'cash' as PaymentMethod, name: 'Espèces', icon: 'cash-outline', color: '#34C759', description: 'Paiement en espèces' },
  { id: 'card' as PaymentMethod, name: 'Carte bancaire', icon: 'card-outline', color: '#007AFF', description: 'Paiement par carte' },
  { id: 'mobile' as PaymentMethod, name: 'Mobile', icon: 'phone-portrait-outline', color: '#5856D6', description: 'Paiement mobile' },
  { id: 'transfer' as PaymentMethod, name: 'Virement', icon: 'swap-horizontal-outline', color: '#FF9500', description: 'Virement bancaire' },
  { id: 'check' as PaymentMethod, name: 'Chèque', icon: 'document-text-outline', color: '#FF3B30', description: 'Paiement par chèque' }
];

// Cartes compactes - Remplacer ClientCompact
const ClientSection = ({ customer, onSearchPress, onAddPress, onClearPress }: any) => {
  if (customer) {
    // Affichage du client sélectionné
    return (
      <View style={stylesLocal.card}>
        <View style={stylesLocal.clientSelectedHeader}>
          <Ionicons name="person-circle" size={40} color="#34C759" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text numberOfLines={1} style={stylesLocal.cardTitle}>
              {customer.type === 'entreprise' && customer.sigle 
                ? customer.sigle 
                : `${customer.prenoms || ''} ${customer.nom || ''}`.trim()}
            </Text>
            <Text style={stylesLocal.cardSub}>{customer.email || 'Pas d\'email'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              onClearPress && onClearPress();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name="close-circle" size={24} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pas de client sélectionné : afficher deux boutons
  return (
    <View style={stylesLocal.clientButtonsContainer}>
      <TouchableOpacity 
        style={[stylesLocal.clientButton, stylesLocal.clientButtonSecondary]}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={20} color="#007AFF" />
        <Text style={stylesLocal.clientButtonText}>Rechercher</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[stylesLocal.clientButton, stylesLocal.clientButtonPrimary]}
        onPress={onAddPress}
      >
        <Ionicons name="add-circle" size={20} color="#FFF" />
        <Text style={[stylesLocal.clientButtonText, stylesLocal.clientButtonTextPrimary]}>
          Ajouter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Résumé du panier
const SummaryCart = ({ cart, discount, net, onDiscountChange, discountType, setDiscountType }: any) => (
  <View style={stylesLocal.card}>
    <Text style={stylesLocal.cardTitle}>Récapitulatif ({cart.length} article{cart.length > 1 ? 's' : ''})</Text>
    <View style={stylesLocal.sep} />
    {cart.map((i: CartItem) => (
      <View key={i.id} style={stylesLocal.itemRow}>
        <Text style={stylesLocal.itemName} numberOfLines={1}>{i.designation}</Text>
        <Text style={stylesLocal.itemQty}>×{i.quantiteAcheter}</Text>
        <Text style={stylesLocal.itemTotal}>{formatPrice(i.montant)}</Text>
      </View>
    ))}
    <View style={stylesLocal.sep} />
    <View style={stylesLocal.discountRow}>
      <Text style={stylesLocal.greyLabel}>Remise</Text>
      <View style={stylesLocal.discountRight}>
        <TogglePercentEuro value={discountType} onChange={setDiscountType} />
        <TextInput
          style={stylesLocal.discountInput}
          keyboardType="decimal-pad"
          value={discountType === 'percent' ? discount : formatNumberInput(discount)}
          onChangeText={v => onDiscountChange(cleanNumberValue(v))}
          placeholder="0"
        />
      </View>
    </View>
    <View style={stylesLocal.sep} />
    <View style={stylesLocal.totalRow}>
      <Text style={stylesLocal.totalLabel}>Net à payer</Text>
      <Text style={stylesLocal.totalAmount}>{formatPrice(net)}</Text>
    </View>
  </View>
);

const TogglePercentEuro = ({ value, onChange }: any) => (
  <View style={stylesLocal.toggle}>
    <TouchableOpacity style={[stylesLocal.toggleBtn, value === 'percent' && stylesLocal.toggleActive]} onPress={() => onChange('percent')}>
      <Text style={[stylesLocal.toggleTxt, value === 'percent' && stylesLocal.toggleTxtActive]}>%</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[stylesLocal.toggleBtn, value === 'amount' && stylesLocal.toggleActive]} onPress={() => onChange('amount')}>
      <Text style={[stylesLocal.toggleTxt, value === 'amount' && stylesLocal.toggleTxtActive]}>ar</Text>
    </TouchableOpacity>
  </View>
);

const PaymentCompact = ({ method, amountPaid, onMethod, onAmount, change, remaining, net }: any) => (
  <View style={stylesLocal.card}>
    <Text style={stylesLocal.cardTitle}>Paiement</Text>
    <TouchableOpacity style={stylesLocal.methodPicker} onPress={onMethod}>
      <Ionicons
  name={
    (method
      ? PAYMENT_METHODS.find(p => p.id === method)?.icon || 'card'
      : 'card') as IoniconsName
  }
  size={24}
  color="#007AFF"
/>
      <Text style={{ marginLeft: 8, flex: 1, fontSize: 16, fontWeight: '500' }}>
        {method ? getPaymentMethodName(method) : 'Mode de paiement'}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>

    <Text style={[stylesLocal.greyLabel, { marginTop: 12 }]}>Montant reçu</Text>
    <View style={stylesLocal.amountWrap}>
      <Text style={stylesLocal.euroSym}>ar</Text>
      <TextInput
        style={stylesLocal.amountInput}
        keyboardType="decimal-pad"
        value={formatNumberInput(amountPaid)}
        onChangeText={onAmount}
        placeholder="0,00"
      />
    </View>

    {amountPaid > 0 && (
      <View style={[stylesLocal.changeBox, amountPaid >= net ? stylesLocal.changeGreen : stylesLocal.changeRed]}>
        <Text style={stylesLocal.changeTxt}>
          {amountPaid >= net ? `Monnaie : ${formatPrice(change)}` : `Reste dû : ${formatPrice(remaining)}`}
        </Text>
      </View>
    )}
  </View>
);

const ConditionInput = ({ value, onChange }: any) => (
  <View style={stylesLocal.card}>
    <Text style={stylesLocal.cardTitle}>Conditions</Text>
    <TextInput
      style={stylesLocal.conditionInput}
      value={value}
      onChangeText={onChange}
      placeholder="Ex : Payé comptant, 30 jours, …"
      multiline
    />
  </View>
);

const ActionBar = ({ onPreview, onSubmit, loading, valid }: any) => (
  <View style={stylesLocal.actionBar}>
    <TouchableOpacity style={stylesLocal.previewBtn} onPress={onPreview} disabled={!valid}>
      <Ionicons name="document-text-outline" size={22} color="#FFF" />
    </TouchableOpacity>
    <TouchableOpacity style={[stylesLocal.submitBtn, !valid && stylesLocal.disabledBtn]} onPress={onSubmit} disabled={!valid || loading}>
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={stylesLocal.submitTxt}>Valider</Text>}
    </TouchableOpacity>
  </View>
);

// Header de navigation
const ValidationHeader = ({ onBack, onCancel, title }: any) => (
  <View style={stylesLocal.header}>
    <TouchableOpacity 
      style={stylesLocal.headerButton}
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color="#007AFF" />
    </TouchableOpacity>
    
    <Text style={stylesLocal.headerTitle}>{title}</Text>
    
    <TouchableOpacity 
      style={stylesLocal.headerButton}
      onPress={onCancel}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close" size={24} color="#DC2626" />
    </TouchableOpacity>
  </View>
);

// Liste ergonomique des formats utilisables
const PDF_FORMATS: { id: PaperFormat; label: string; desc: string; icon: IoniconsName }[] = [
  { id: 'A4',   label: 'A4',   desc: 'Format standard A4 (portrait)', icon: 'document-text' },
  { id: 'A5',   label: 'A5',   desc: 'Format A5 (plus compact)', icon: 'document-text' },
  { id: 'BL-A4',label: 'BL-A4',desc: 'Bon de livraison A4', icon: 'cube' },
  { id: 'BL-A5',label: 'BL-A5',desc: 'Bon de livraison A5', icon: 'cube' },
  { id: 'T80',  label: 'Ticket 80mm', desc: 'Ticket thermique 80mm', icon: 'receipt' },
  { id: 'T58',  label: 'Ticket 58mm', desc: 'Ticket thermique 58mm', icon: 'receipt' },
];

// Bouton affichant le format courant et ouvrant la modal
const FormatPickerButton = ({ current, onOpen }: { current: PaperFormat; onOpen: () => void }) => (
  <TouchableOpacity style={stylesLocal.formatPickerBtn} onPress={onOpen}>
    <Ionicons name={current.startsWith('T') ? 'receipt' : (current.startsWith('BL') ? 'cube' : 'document-text')} size={18} color="#FFF" />
    <Text style={stylesLocal.formatPickerText}>{current}</Text>
    <Ionicons name="chevron-down" size={16} color="#FFF" style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

// Modal ergonomique de sélection de format
const renderFormatModal = (visible: boolean, onClose: () => void, onSelect: (f: PaperFormat) => void, current: PaperFormat) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={baseStyles.modalOverlay}>
      <View style={[baseStyles.modalContent, { padding: 12 }]}>
        <Text style={baseStyles.modalTitle}>Choisir le format du document</Text>
        <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 12 }}>
          Sélectionnez le format adapté (PDF / ticket / bon de livraison)
        </Text>

        <FlatList
          data={PDF_FORMATS}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const active = item.id === current;
            return (
              <TouchableOpacity
                style={[
                  baseStyles.paymentMethodItem,
                  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
                  active && baseStyles.paymentMethodItemSelected
                ]}
                onPress={() => { onSelect(item.id); onClose(); }}
              >
                <View style={[baseStyles.paymentMethodIconContainer, { backgroundColor: active ? '#007AFF' : '#E5E7EB' }]}>
                  <Ionicons name={item.icon as any} size={20} color={active ? '#FFF' : '#111827'} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>{item.desc}</Text>
                </View>
                {active && (
                  <View style={baseStyles.paymentMethodCheckmark}>
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
            <Text style={{ color: '#6B7280' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function CartValidationScreen({ route, navigation }: any) {
  const { cart = [], totalAmount = 0, totalItems = 0, onSaleCompleted, mode = 'sale' } = route.params || {};
  const isProforma = mode === 'proforma';
  const styles = isProforma ? proformaValidationStyles : baseStyles;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [discount, setDiscount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [condition, setCondition] = useState<string>('Payé comptant');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showCustomerCreateModal, setShowCustomerCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<PaperFormat>('A4');
  const [saleCreatedPendingPreview, setSaleCreatedPendingPreview] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Key used for persisting the screen state
  const CART_VALIDATION_STATE_KEY = 'CartValidationScreenState';

  // Load persisted screen state on mount
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_VALIDATION_STATE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!mounted || !data) return;
        // restore safe subset of state (guarded)
        if (data.selectedCustomer) setSelectedCustomer(data.selectedCustomer);
        if (data.selectedPaymentMethod) setSelectedPaymentMethod(data.selectedPaymentMethod);
        if (typeof data.discount === 'string') setDiscount(data.discount);
        if (data.discountType) setDiscountType(data.discountType);
        if (typeof data.amountPaid === 'string') setAmountPaid(data.amountPaid);
        if (typeof data.condition === 'string') setCondition(data.condition);
        // If cart was persisted in params, you can rely on route params. Otherwise components reading route.params will still work.
      } catch (e) {
        console.warn('Impossible de restaurer l\'état du formulaire', e);
      }
    };
    restore();
    return () => { mounted = false; };
  }, []);

  // Persist relevant state with debounce to avoid too many writes
  useEffect(() => {
    const payload = {
      selectedCustomer,
      selectedPaymentMethod,
      discount,
      discountType,
      amountPaid,
      condition,
      // include a snapshot of the cart/amounts to be safe
      cart: Array.isArray(cart) ? cart : [],
      totalAmount,
      totalItems,
      mode,
      savedAt: Date.now(),
    };

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(CART_VALIDATION_STATE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Erreur lors de la sauvegarde de l\'état', e);
      }
    }, 400); // 400ms debounce

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer, selectedPaymentMethod, discount, discountType, amountPaid, condition, cart, totalAmount, totalItems, mode]);
  
   const safeCart: CartItem[] = Array.isArray(cart) ? cart : [];
   const subtotal = totalAmount || 0;
   const discountValue = parseFloat(discount) || 0;
   const discountAmount = discountType === 'percent' ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal);
   const netAmount = Math.max(0, subtotal - discountAmount);
   const paidAmount = parseFloat(amountPaid) || 0;
   const changeAmount = Math.max(0, paidAmount - netAmount);
   const remainingAmount = Math.max(0, netAmount - paidAmount);

   const step = selectedCustomer ? (selectedPaymentMethod ? 3 : 2) : 1;
   const readyToSubmit = selectedCustomer && selectedPaymentMethod && condition.trim() && safeCart.length > 0;

   // Invoice data (réinstallée : suppose qu'un client est présent quand on l'appelle)
   const buildSaleInvoiceData = (): SaleInvoiceData => ({
     saleId: String(Date.now()),
     date: new Date().toLocaleDateString('fr-FR'),
     customer: {
       name: getCustomerDisplayName(selectedCustomer!),
       email: selectedCustomer?.email,
       phone: selectedCustomer?.telephone,
       address: selectedCustomer?.adresse,
     },
     items: safeCart.map(i => ({
       ref: i.ref_produit || 'N/A',
       designation: i.designation || 'Produit',
       qty: i.quantiteAcheter || 0,
       unitPrice: getItemPrice(i),
       total: i.montant || 0,
     })),
     subtotal,
     discountAmount,
     netAmount,
     paidAmount,
     changeAmount,
     remainingAmount,
     paymentMethod: getPaymentMethodName(selectedPaymentMethod!),
     condition,
   });

   const openPreview = () => {
     if (!selectedCustomer || safeCart.length === 0) return;
     const html = buildInvoiceHtml(buildSaleInvoiceData(), selectedFormat);
     setPreviewHtml(html);
     setShowPreviewModal(true);
   };

   const handlePrint = async () => {
     await Print.printAsync({ html: previewHtml });
   };

   const handleSharePdf = async () => {
     const base64 = await generateInvoicePdf(buildSaleInvoiceData(), selectedFormat);
     const uri = `data:application/pdf;base64,${base64}`;
     await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
   };

   const loadCustomers = async () => {
     try {
       setIsLoadingCustomers(true);
       const all = await customerService.getCustomers();
       setCustomers(all);
     } catch (e) {
       console.error(e);
     } finally {
       setIsLoadingCustomers(false);
     }
   };

   useEffect(() => { loadCustomers(); }, []);

   useEffect(() => {
     if (selectedPaymentMethod && netAmount > 0) {
       setAmountPaid(netAmount.toFixed(2));
       setCondition(paidAmount >= netAmount ? 'Payé comptant' : 'À crédit');
     }
   }, [selectedPaymentMethod, netAmount]);

   useEffect(() => {
     setCondition(paidAmount >= netAmount ? 'Payé comptant' : 'À crédit');
   }, [paidAmount, netAmount]);

   const closeAllModals = () => {
     setShowCustomerSearchModal(false);
     setShowCustomerCreateModal(false);
     setShowPaymentModal(false);
   };

   const handleFinalSubmit = async () => {
     if (!readyToSubmit) return;
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     setIsSubmitting(true);
     try {
       const stockValidation = await cartService.validateStock(safeCart);
       if (!stockValidation.valid) {
         const msgs = stockValidation.results.filter(r => !r.valid).map(r => r.message).join('\n');
         Alert.alert('Stock insuffisant', msgs);
         setIsSubmitting(false);
         return;
       }
       const notes = [
         `Condition: ${condition}`,
         paidAmount >= netAmount ? `Monnaie: ${formatPrice(changeAmount)}` : `Reste dû: ${formatPrice(remainingAmount)}`,
       ];
       const saleData: SaleCreationData = {
         cartItems: safeCart,
         clientId: selectedCustomer!.identifiant,
         paymentInfo: {
           method: selectedPaymentMethod!,
           amount_paid: paidAmount,
           discount_amount: discountAmount,
           discount_type: discountType,
           condition,
           change_amount: changeAmount,
           remaining_amount: remainingAmount
         },
         notes: notes.join('\n'),
         subtotal,
         net_amount: netAmount
       };
      await cartService.createSale(saleData);
      // clear persisted state after successful creation
      try { await AsyncStorage.removeItem(CART_VALIDATION_STATE_KEY); } catch (e) { console.warn('Unable to clear saved state', e); }
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       const html = buildInvoiceHtml(buildSaleInvoiceData(), selectedFormat);
       setPreviewHtml(html);
       setSaleCreatedPendingPreview(true);
       setShowPreviewModal(true);
     } catch (e: any) {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
       Alert.alert('Erreur', e.message || 'Impossible d’enregistrer la vente');
     } finally {
       setIsSubmitting(false);
     }
   };

  const renderPaymentModal = () => (
    <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
      <View style={baseStyles.modalOverlay}>
        <View style={baseStyles.modalContent}>
          <View style={baseStyles.modalHeader}>
            <View style={baseStyles.modalHandle} />
            <Text style={baseStyles.modalTitle}>Mode de paiement</Text>
            <TouchableOpacity style={baseStyles.modalCloseButton} onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={PAYMENT_METHODS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[baseStyles.paymentMethodItem, selectedPaymentMethod === item.id && baseStyles.paymentMethodItemSelected]}
                onPress={() => {
                  setSelectedPaymentMethod(item.id);
                  setShowPaymentModal(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[baseStyles.paymentMethodIconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={24} color="#FFF" />
                </View>
                <View style={baseStyles.paymentMethodInfo}>
                  <Text style={baseStyles.paymentMethodName}>{item.name}</Text>
                  <Text style={baseStyles.paymentMethodDescription}>{item.description}</Text>
                </View>
                {selectedPaymentMethod === item.id && (
                  <View style={baseStyles.paymentMethodCheckmark}>
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <SafeAreaView style={styles.safeArea}>
        <ValidationHeader 
          onBack={() => navigation.goBack()}
          onCancel={() => {
            Alert.alert(
              'Annuler la validation',
              'Voulez-vous quitter et annuler la validation en cours ? Vos modifications seront sauvegardées localement.',
              [
                { text: 'Non', style: 'cancel' },
                { text: 'Oui, annuler', style: 'destructive', onPress: () => navigation.goBack() }
              ]
            );
          }}
          title={isProforma ? 'Proforma' : 'Validation de vente'}
        />

        <FlatList
          data={[]}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          ListHeaderComponent={
            <>
              <ClientSection 
                customer={selectedCustomer}
                onSearchPress={() => {
                  setShowCustomerSearchModal(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onAddPress={() => {
                  setShowCustomerCreateModal(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onClearPress={() => {
                  setSelectedCustomer(null);
                }}
              />
              <SummaryCart
                cart={safeCart}
                discount={discount}
                net={netAmount}
                onDiscountChange={setDiscount}
                discountType={discountType}
                setDiscountType={setDiscountType}
              />
            </>
          }
          ListFooterComponent={
            <>
              <PaymentCompact
                method={selectedPaymentMethod}
                amountPaid={amountPaid}
                onMethod={() => { setShowPaymentModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                onAmount={(v: string) => setAmountPaid(cleanNumberValue(v))}
                change={changeAmount}
                remaining={remainingAmount}
                net={netAmount}
              />

              <ConditionInput value={condition} onChange={setCondition} />

              {/* Format picker placé au-dessus de la barre d'action pour un accès rapide
							--- onOpen bloque si pas de client ou panier vide */}
              <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <FormatPickerButton
                  current={selectedFormat}
                  onOpen={() => {
                    if (!selectedCustomer || safeCart.length === 0) {
                      Alert.alert(
                        'Format indisponible',
                        'Sélectionnez d’abord un client et ajoutez des articles avant de changer le format.'
                      );
                      return;
                    }
                    setShowFormatModal(true);
                  }}
                />
              </View>

              {/* Barre d'actions (preview / valider) */}
              <ActionBar onPreview={openPreview} onSubmit={handleFinalSubmit} loading={isSubmitting} valid={readyToSubmit} />

              <View style={{ height: 40 }} />
            </>
          }
          keyExtractor={() => 'k'}
          renderItem={() => null}
          contentContainerStyle={{ paddingBottom: 24 }}
        />

        <CustomerSearchModal
          visible={showCustomerSearchModal}
          onClose={closeAllModals}
          onSelectCustomer={(c: Customer) => {
            setSelectedCustomer(c);
            closeAllModals();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          onSwitchToCreate={() => {
            setShowCustomerSearchModal(false);
            setShowCustomerCreateModal(true);
          }}
          initialCustomers={customers}
          isLoading={isLoadingCustomers}
        />

        <CustomerCreateModal
          visible={showCustomerCreateModal}
          onClose={closeAllModals}
          onCustomerCreated={(c: Customer) => {
            setSelectedCustomer(c);
            setCustomers(prev => [c, ...prev.filter(x => x.identifiant !== c.identifiant)]);
            closeAllModals();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Succès', 'Client créé');
          }}
          onSwitchToSearch={() => {
            setShowCustomerCreateModal(false);
            setShowCustomerSearchModal(true);
          }}
          existingCustomers={customers}
        />

        <InvoicePreviewModal
          visible={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            if (saleCreatedPendingPreview) {
              setSaleCreatedPendingPreview(false);
              if (onSaleCompleted) onSaleCompleted();
              navigation.goBack();
            }
          }}
          html={previewHtml}
          selectedFormat={selectedFormat}
          onChangeFormat={f => {
            setSelectedFormat(f);
            setPreviewHtml(buildInvoiceHtml(buildSaleInvoiceData(), f));
          }}
          onPrint={handlePrint}
          onShare={handleSharePdf}
          onDone={() => {
            setSaleCreatedPendingPreview(false);
            if (onSaleCompleted) onSaleCompleted();
            navigation.goBack();
          }}
        />

        {renderPaymentModal()}

        {/* Modal de sélection de format : wrapper onSelect empêche l'application si pas de client / panier */}
        {renderFormatModal(
          showFormatModal,
          () => setShowFormatModal(false),
          (f: PaperFormat) => {
            if (!selectedCustomer || safeCart.length === 0) {
              Alert.alert(
                'Format indisponible',
                'Sélectionnez d’abord un client et ajoutez des articles avant de changer le format.'
              );
              return;
            }
            setSelectedFormat(f);
            // Mettre à jour le preview si la preview est ouverte
            if (showPreviewModal) {
              setPreviewHtml(buildInvoiceHtml(buildSaleInvoiceData(), f));
            }
          },
          selectedFormat
        )}

        <KeyboardAccessoryView alwaysVisible={false} androidAdjustResize>
          <View />
        </KeyboardAccessoryView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* Styles supplémentaires */
const stylesLocal = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },

  clientButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  clientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  clientButtonSecondary: {
    backgroundColor: '#FFF',
  },
  clientButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  clientButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  clientButtonTextPrimary: {
    color: '#FFF',
  },
  clientSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 8 },
  cardSub: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  sep: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  itemName: { flex: 1, fontSize: 15, color: '#000' },
  itemQty: { fontSize: 14, color: '#8E8E93', marginHorizontal: 8 },
  itemTotal: { fontSize: 15, fontWeight: '600', color: '#000' },
  discountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  discountRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discountInput: { width: 70, borderWidth: 1, borderColor: '#E5EAEA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, textAlign: 'right', fontSize: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  totalAmount: { fontSize: 20, fontWeight: '700', color: '#007AFF' },
  greyLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  toggle: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleTxt: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  toggleTxtActive: { color: '#007AFF' },
  methodPicker: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  amountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4 },
  euroSym: { fontSize: 20, fontWeight: '600', color: '#007AFF', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700', textAlign: 'right' },
  changeBox: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 10, alignItems: 'center' },
  changeGreen: { backgroundColor: '#D1FAE5' },
  changeRed: { backgroundColor: '#FEE2E2' },
  changeTxt: { fontSize: 14, fontWeight: '600' },
  conditionInput: { backgroundColor: '#F8F8F8', borderRadius: 8, padding: 10, fontSize: 16, minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E5E5EA' },
  actionBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  previewBtn: { backgroundColor: '#007AFF', borderRadius: 12, padding: 12 },
  submitBtn: { flex: 1, backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#C7C7CC' },
  submitTxt: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  formatPickerBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  formatPickerText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});