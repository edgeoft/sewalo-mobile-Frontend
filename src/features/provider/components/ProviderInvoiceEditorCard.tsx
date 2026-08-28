import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useUpdateInvoiceItems } from '@/api';
import type { Booking, InvoiceItem } from '@/types';
import { formatDate } from '@/utils/time';

interface ProviderInvoiceEditorCardProps {
  booking: Booking;
  isEditing: boolean;
  onToggleEdit: (editing: boolean) => void;
  onTotalCalculated: (total: number) => void;
}

interface FormInvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_amount: number;
  is_primary_item: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProviderInvoiceEditorCard({
  booking,
  isEditing,
  onToggleEdit,
  onTotalCalculated,
}: ProviderInvoiceEditorCardProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const updateInvoiceMutation = useUpdateInvoiceItems();

  const invoice = booking.invoice;
  const invoiceId = invoice?.invoice_id || (invoice?.id ? `#${invoice.id.slice(0, 8).toUpperCase()}` : '#INV-001');
  const serviceDate = formatDate(booking.service_date || '');
  const originalServiceTitle = booking.service?.name || t('provider.service');
  const initialBasePrice = invoice ? Number(invoice.sub_total) || 0 : 0;

  const originalItems: InvoiceItem[] = useMemo(() => {
    if (invoice?.invoice_items && invoice.invoice_items.length > 0) {
      return invoice.invoice_items;
    }
    return [
      {
        id: 'primary-service-item',
        name: originalServiceTitle,
        quantity: 1,
        unit_price: initialBasePrice,
        total_amount: initialBasePrice,
        is_primary_item: true,
      },
    ];
  }, [invoice, originalServiceTitle, initialBasePrice]);

  const [items, setItems] = useState<FormInvoiceItem[]>(() =>
    originalItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity || 1,
      unit_price: (Number(item.unit_price) || 0).toString(),
      total_amount: Number(item.total_amount) || 0,
      is_primary_item: item.is_primary_item ?? false,
    })),
  );
  const [notes, setNotes] = useState<string>(() => invoice?.additional_note || '');

  // Compute live subtotal and total
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      const qty = item.quantity || 1;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const total = subtotal;

  // Inform parent of current calculated total whenever it changes
  useEffect(() => {
    onTotalCalculated(total);
  }, [total, onTotalCalculated]);

  const handleAddItem = useCallback(() => {
    const newItem: FormInvoiceItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: '',
      quantity: 1,
      unit_price: '',
      total_amount: 0,
      is_primary_item: false,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleItemNameChange = useCallback((text: string, index: number) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, name: text };
      }),
    );
  }, []);

  const handleItemPriceChange = useCallback((text: string, index: number) => {
    // Clean input to allow only digits and at most one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const price = parseFloat(cleanedText) || 0;
        return {
          ...item,
          unit_price: cleanedText,
          total_amount: (item.quantity || 1) * price,
        };
      }),
    );
  }, []);

  const handleCancelEdit = useCallback(() => {
    // Reset to original values and exit edit mode
    setItems(
      originalItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        unit_price: (Number(item.unit_price) || 0).toString(),
        total_amount: Number(item.total_amount) || 0,
        is_primary_item: item.is_primary_item ?? false,
      })),
    );
    setNotes(invoice?.additional_note || '');
    onToggleEdit(false);
  }, [originalItems, invoice?.additional_note, onToggleEdit]);

  const handleSaveInvoice = useCallback(() => {
    if (!invoice?.id) {
      showSnackbar({ message: t('errors.generic', 'Invoice ID not found.'), type: 'error' });
      return;
    }

    // Validate that all items have a name and valid price
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        showSnackbar({
          message: t('provider.invoiceNameRequired', 'Please enter a description for all items.'),
          type: 'error',
        });
        return;
      }
      const price = parseFloat(item.unit_price);
      if (isNaN(price) || price < 0) {
        showSnackbar({
          message: t('provider.validInvoiceAmount', 'Please enter a valid price for all items.'),
          type: 'error',
        });
        return;
      }
    }

    const itemsToAdd = items
      .filter((item) => !UUID_REGEX.test(item.id))
      .map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    const itemsToUpdate = items
      .filter((item) => UUID_REGEX.test(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    const itemsToDelete = (invoice?.invoice_items || [])
      .filter((orig) => UUID_REGEX.test(orig.id) && !items.some((item) => item.id === orig.id))
      .map((orig) => orig.id);

    updateInvoiceMutation.mutate(
      {
        bookingId: booking.id,
        payload: {
          id: invoice.id,
          additional_note: notes.trim(),
          discount_amount: 0,
          items_to_add: itemsToAdd,
          items_to_update: itemsToUpdate,
          items_to_delete: itemsToDelete,
        },
      },
      {
        onSuccess: () => {
          showSnackbar({ message: t('provider.invoiceUpdateSuccess'), type: 'success' });
          onToggleEdit(false);
        },
        onError: (err) => {
          showSnackbar({ message: err.message || t('errors.generic'), type: 'error' });
        },
      },
    );
  }, [invoice, items, notes, booking.id, updateInvoiceMutation, showSnackbar, t, onToggleEdit]);

  return (
    <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-x-2">
            <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-bold text-gray-900">
              {isEditing ? t('provider.editInvoiceDetails') : t('provider.invoiceItemizedCharges')}
            </Text>
          </View>
          <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
            {t('provider.invoiceNumber')} {invoiceId} {serviceDate ? `• ${serviceDate}` : ''}
          </Text>
        </View>

        {!isEditing ? (
          <Pressable
            onPress={() => onToggleEdit(true)}
            accessibilityRole="button"
            accessibilityLabel={t('provider.editInvoice')}
            hitSlop={8}
            className="flex-row items-center gap-x-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 active:bg-primary/10"
          >
            <Feather name="edit-3" size={13} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-semibold text-primary">{t('provider.editInvoice')}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleCancelEdit}
            accessibilityRole="button"
            accessibilityLabel={t('provider.invoiceCancel')}
            hitSlop={8}
            className="px-2.5 py-1.5 rounded-lg active:bg-gray-100"
          >
            <Text className="text-xs font-sans-medium text-gray-500">{t('provider.invoiceCancel')}</Text>
          </Pressable>
        )}
      </View>

      {/* Item List / Edit Fields */}
      {!isEditing ? (
        /* VIEW MODE: Clean, comfortable item rows */
        <View className="mt-3 gap-y-2.5">
          {items.map((item, idx) => {
            const price = parseFloat(item.unit_price) || 0;
            return (
              <View key={item.id || idx} className="flex-row items-center justify-between py-1">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center flex-wrap gap-1.5">
                    <Text className="text-xs font-sans-medium text-gray-700 leading-tight">
                      {item.name || originalServiceTitle}
                    </Text>
                    {item.is_primary_item && (
                      <View className="bg-blue-50 border border-blue-100 rounded px-1.5 py-0.2">
                        <Text className="text-[10px] font-sans-semibold text-primary">
                          {t('provider.primaryService')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text className="text-xs font-sans-semibold text-gray-900">Rs. {price.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        /* EDIT MODE: Mobile-native item cards with touch-friendly inputs */
        <View className="mt-3.5 gap-y-3">
          {items.map((item, index) => {
            const isPrimary = item.is_primary_item;
            return (
              <View
                key={item.id || index}
                className={`rounded-lg border p-3 ${
                  isPrimary ? 'bg-gray-50/70 border-gray-200/80' : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-sans-bold text-gray-800">
                      {isPrimary ? t('provider.primaryService') : `${t('provider.additionalItem')} #${index}`}
                    </Text>
                    {isPrimary && (
                      <View className="bg-blue-50 border border-blue-100 rounded px-1.5 py-0.2">
                        <Text className="text-[9px] font-sans-bold text-primary">{t('provider.service')}</Text>
                      </View>
                    )}
                  </View>

                  {!isPrimary && (
                    <Pressable
                      onPress={() => handleRemoveItem(index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('provider.removeItem')}
                      hitSlop={10}
                      className="p-1 rounded active:bg-red-50"
                    >
                      <Feather name="trash-2" size={14} color={THEME_COLORS.dangerRed} />
                    </Pressable>
                  )}
                </View>

                {/* Description Input */}
                <View className="mb-2.5">
                  <Text className="text-xs font-sans-medium text-gray-600 mb-1">{t('provider.invoiceName')}</Text>
                  {isPrimary ? (
                    <View className="h-10 px-3 justify-center bg-gray-100/70 rounded-lg border border-gray-200">
                      <Text className="text-xs font-sans-medium text-gray-700" numberOfLines={1}>
                        {item.name || originalServiceTitle}
                      </Text>
                    </View>
                  ) : (
                    <View className="h-10 px-3 flex-row items-center bg-white rounded-lg border border-gray-200">
                      <TextInput
                        value={item.name}
                        onChangeText={(text) => handleItemNameChange(text, index)}
                        placeholder={t('provider.invoiceNamePlaceholder')}
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-xs font-sans-medium text-gray-900 p-0"
                      />
                    </View>
                  )}
                </View>

                {/* Price Input */}
                <View>
                  <Text className="text-xs font-sans-medium text-gray-600 mb-1">{t('provider.invoicePrice')}</Text>
                  <View className="h-10 px-3 flex-row items-center bg-white rounded-lg border border-gray-200">
                    <Text className="text-xs font-sans-semibold text-gray-500 mr-2">Rs.</Text>
                    <TextInput
                      value={item.unit_price}
                      onChangeText={(text) => handleItemPriceChange(text, index)}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      className="flex-1 text-xs font-sans-semibold text-gray-900 p-0"
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Add Item Button */}
          <Pressable
            onPress={handleAddItem}
            accessibilityRole="button"
            accessibilityLabel={t('provider.invoiceAddItem')}
            className="flex-row items-center justify-center py-2.5 px-4 rounded-lg border border-dashed border-primary/40 bg-surface-indigo-subtle/50 active:bg-surface-indigo-subtle gap-x-2"
          >
            <Feather name="plus-circle" size={15} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-bold text-primary">{t('provider.invoiceAddItem')}</Text>
          </Pressable>

          {/* Notes Input in Edit Mode */}
          <View className="mt-1">
            <Text className="text-xs font-sans-medium text-gray-600 mb-1">{t('provider.invoiceNotes')}</Text>
            <View className="p-3 bg-white rounded-lg border border-gray-200">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={t('provider.invoiceNotesPlaceholder')}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={{ minHeight: 60, textAlignVertical: 'top', padding: 0 }}
                className="text-xs font-sans-medium text-gray-900"
              />
            </View>
          </View>
        </View>
      )}

      {/* Notes Display in View Mode (if any) */}
      {!isEditing && notes ? (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs font-sans-medium text-gray-500 mb-1">{t('provider.invoiceNotes')}</Text>
          <Text className="text-xs font-sans-medium text-gray-700 leading-5">{notes}</Text>
        </View>
      ) : null}

      {/* Summary Breakdown */}
      <View className="mt-4 pt-3 border-t border-gray-100 gap-y-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs font-sans-medium text-gray-500">{t('provider.invoiceSubtotal')}</Text>
          <Text className="text-xs font-sans-semibold text-gray-800">Rs. {subtotal.toLocaleString()}</Text>
        </View>

        <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
          <Text className="text-sm font-sans-bold text-gray-900">{t('provider.invoiceTotal')}</Text>
          <Text className="text-base font-sans-extrabold text-primary">Rs. {total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Edit Mode Footer Action Buttons */}
      {isEditing && (
        <View className="mt-4 pt-3 border-t border-gray-100 flex-row gap-3">
          <Button
            title={t('provider.invoiceCancel')}
            variant="outline"
            size="sm"
            onPress={handleCancelEdit}
            disabled={updateInvoiceMutation.isPending}
            className="flex-1 border-gray-300 bg-white"
            textClassName="text-gray-700"
          />
          <Button
            title={t('provider.invoiceSave')}
            variant="primary"
            size="sm"
            onPress={handleSaveInvoice}
            loading={updateInvoiceMutation.isPending}
            className="flex-1"
            leftIcon={!updateInvoiceMutation.isPending ? <Feather name="save" size={14} color="#ffffff" /> : null}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 0,
  },
});
