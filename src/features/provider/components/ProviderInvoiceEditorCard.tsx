import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useUpdateInvoiceItems } from '@/api';
import { BOOKING_STATUSES, type Booking, type InvoiceItem } from '@/types';
import { formatDate } from '@/utils/time';

interface ProviderInvoiceEditorCardProps {
  booking: Booking;
  isEditing: boolean;
  canEdit?: boolean;
  onToggleEdit: (editing: boolean) => void;
  onTotalCalculated: (total: number) => void;
  onDownloadInvoice?: () => void;
  isDownloadingInvoice?: boolean;
}

interface FormInvoiceItem {
  id: string;
  name: string;
  quantity: string;
  unit_price: string;
  total_amount: number;
  is_primary_item: boolean;
}

export default function ProviderInvoiceEditorCard({
  booking,
  isEditing,
  canEdit = booking.status === BOOKING_STATUSES.Completed,
  onToggleEdit,
  onTotalCalculated,
  onDownloadInvoice,
  isDownloadingInvoice = false,
}: ProviderInvoiceEditorCardProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const updateInvoiceMutation = useUpdateInvoiceItems();

  const invoice = booking.invoice;
  const invoiceId = invoice?.invoice_id || (invoice?.id ? `#${invoice.id.slice(0, 8).toUpperCase()}` : '#INV-001');
  const serviceDate = formatDate(booking.service_date || '');
  const originalServiceTitle = booking.service?.name || t('provider.service');
  const initialBasePrice = invoice ? Number(invoice.sub_total) || 0 : 0;

  const matchingOffering = booking.service?.service_offerings?.find(
    (offering) =>
      offering?.sub_category?.name &&
      booking.service?.name?.toLowerCase().includes(offering.sub_category.name.toLowerCase()),
  );
  const primaryBillingOpt = matchingOffering?.billing_option || booking.service?.service_offerings?.[0]?.billing_option;
  const billingOptionTooltip = primaryBillingOpt?.name || primaryBillingOpt?.label?.replace(/[()]/g, '') || '';

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
      quantity: (item.quantity ?? 1).toString(),
      unit_price: (Number(item.unit_price) || 0).toString(),
      total_amount: Number(item.total_amount) || 0,
      is_primary_item: item.is_primary_item ?? false,
    })),
  );
  const [notes, setNotes] = useState<string>(() => invoice?.additional_note || '');

  const primaryItems = useMemo(() => items.filter((item) => item.is_primary_item), [items]);
  const mainItems = useMemo(
    () => (primaryItems.length > 0 ? primaryItems : items.length > 0 ? [items[0]] : []),
    [primaryItems, items],
  );
  const mainIdSet = useMemo(() => new Set(mainItems.map((item) => item.id)), [mainItems]);
  const additionalItems = useMemo(() => items.filter((item) => !mainIdSet.has(item.id)), [items, mainIdSet]);

  // Compute live subtotal and total
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      const qty = parseInt(item.quantity, 10) || 0;
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
      quantity: '1',
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

  const handleItemQuantityChange = useCallback((text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const qty = parseInt(cleanedText, 10) || 0;
        const price = parseFloat(item.unit_price) || 0;
        return {
          ...item,
          quantity: cleanedText,
          total_amount: qty * price,
        };
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
        const qty = parseInt(item.quantity, 10) || 0;
        return {
          ...item,
          unit_price: cleanedText,
          total_amount: qty * price,
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
        quantity: (item.quantity ?? 1).toString(),
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
      .filter((item) => item.id.startsWith('new-'))
      .map((item) => ({
        name: item.name.trim(),
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    const itemsToUpdate = items
      .filter((item) => !item.id.startsWith('new-'))
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    const itemsToDelete = (invoice?.invoice_items || [])
      .filter((orig) => !items.some((item) => item.id === orig.id))
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
          <View className="flex-row items-center gap-x-2 flex-wrap">
            <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-bold text-gray-900">
              {isEditing ? t('provider.editInvoiceDetails') : t('provider.invoiceItemizedCharges')}
            </Text>
            {invoiceId ? (
              <View className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
                <Text className="text-[11px] font-sans-bold text-gray-600 font-mono">
                  #{invoiceId.replace(/^#/, '')}
                </Text>
              </View>
            ) : null}
          </View>
          {serviceDate ? <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">{serviceDate}</Text> : null}
        </View>

        {canEdit &&
          (!isEditing ? (
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
          ))}
      </View>

      {/* Item List / Edit Fields */}
      {!isEditing ? (
        /* VIEW MODE: Flat layout matching app sections */
        <View className="mt-4">
          {/* Section 1: Service Charges */}
          <View>
            <View className="flex-row items-center mb-3">
              <Feather name="briefcase" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                {t('provider.invoiceServiceCharges', 'Service Charges')}
              </Text>
            </View>

            {mainItems.map((item) => {
              const price = parseFloat(item.unit_price) || 0;
              const qty = parseInt(item.quantity, 10) || 1;

              return (
                <View key={item.id} className="py-1">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-sm font-sans-bold text-gray-900 leading-snug">
                        {item.name || originalServiceTitle}
                      </Text>
                      {billingOptionTooltip ? (
                        <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{billingOptionTooltip}</Text>
                      ) : null}
                      <Text className="text-xs font-sans-medium text-gray-400 mt-1">
                        {t('provider.invoiceDurationUnits', 'Duration / Units')}: {qty} × Rs. {price.toLocaleString()}
                      </Text>
                    </View>
                    <Text className="text-sm font-sans-bold text-gray-900">Rs. {(qty * price).toLocaleString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Section Divider */}
          <View className="h-px bg-gray-200 my-5" />

          {/* Section 2: Additional Charges */}
          <View>
            <View className="flex-row items-center mb-3">
              <Feather name="plus-circle" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                {t('provider.invoiceAdditionalCharges', 'Additional Charges')}
              </Text>
            </View>

            {additionalItems.length === 0 ? (
              <Text className="text-xs font-sans-medium text-gray-400 py-1 italic">
                {t('provider.invoiceNoAdditionalCharges', 'No additional charges added.')}
              </Text>
            ) : (
              <View className="gap-y-2">
                {additionalItems.map((item) => {
                  const price = parseFloat(item.unit_price) || 0;
                  const qty = parseInt(item.quantity, 10) || 1;

                  return (
                    <View key={item.id} className="flex-row items-center justify-between py-1">
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-sans-medium text-gray-800 leading-tight">{item.name}</Text>
                        <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                          {t('provider.invoiceQty', 'Qty')}: {qty} × Rs. {price.toLocaleString()}
                        </Text>
                      </View>
                      <Text className="text-sm font-sans-semibold text-gray-900">
                        Rs. {(qty * price).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      ) : (
        /* EDIT MODE: Flat rows without nested cards */
        <View className="mt-4 gap-y-4">
          {/* Section 1: Service Charges */}
          <View className="space-y-3">
            <View className="flex-row items-center mb-1">
              <Feather name="briefcase" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                {t('provider.invoiceServiceCharges', 'Service Charges')}
              </Text>
            </View>

            {mainItems.map((item) => {
              const originalIndex = items.findIndex((it) => it.id === item.id);

              return (
                <View key={item.id} className="space-y-3">
                  {/* Service Title and Billing Basis Subtext */}
                  <View>
                    <Text className="text-sm font-sans-bold text-gray-900">{item.name || originalServiceTitle}</Text>
                    {billingOptionTooltip ? (
                      <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{billingOptionTooltip}</Text>
                    ) : null}
                  </View>

                  {/* Duration / Units and Price Inputs Side-by-Side */}
                  <View className="flex-row gap-3">
                    {/* Duration / Units Input */}
                    <View className="flex-1">
                      <Text className="text-xs font-sans-medium text-gray-600 mb-1">
                        {t('provider.invoiceDurationUnits', 'Duration / Units')}
                      </Text>
                      <View className="h-10 px-3 flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                        <TextInput
                          value={item.quantity}
                          onChangeText={(text) => handleItemQuantityChange(text, originalIndex)}
                          placeholder="1"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          className="flex-1 text-xs font-sans-semibold text-gray-900 p-0 text-center"
                        />
                      </View>
                    </View>

                    {/* Price Input */}
                    <View className="flex-1">
                      <Text className="text-xs font-sans-medium text-gray-600 mb-1">{t('provider.invoicePrice')}</Text>
                      <View className="h-10 px-3 flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                        <Text className="text-xs font-sans-semibold text-gray-500 mr-2">Rs.</Text>
                        <TextInput
                          value={item.unit_price}
                          onChangeText={(text) => handleItemPriceChange(text, originalIndex)}
                          placeholder="0"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          className="flex-1 text-xs font-sans-semibold text-gray-900 p-0"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Line Total */}
                  <View className="pt-2 flex-row justify-between items-center">
                    <Text className="text-[10px] font-sans-medium text-gray-400">
                      {t('provider.itemTotal', 'Item Total')}
                    </Text>
                    <Text className="text-xs font-sans-bold text-gray-800">
                      Rs. {((parseInt(item.quantity, 10) || 0) * (parseFloat(item.unit_price) || 0)).toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Section Divider */}
          <View className="h-px bg-gray-200 my-4" />

          {/* Section 2: Additional Charges */}
          <View className="space-y-3">
            <View className="flex-row items-center mb-1">
              <Feather name="plus-circle" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                {t('provider.invoiceAdditionalCharges', 'Additional Charges')}
              </Text>
            </View>

            {additionalItems.length === 0 ? (
              <View className="py-2.5 items-center justify-center">
                <Text className="text-xs font-sans-medium text-gray-400 text-center italic">
                  {t('provider.invoiceNoAdditionalCharges', 'No additional charges added.')}
                </Text>
              </View>
            ) : (
              additionalItems.map((item) => {
                const originalIndex = items.findIndex((it) => it.id === item.id);

                return (
                  <View key={item.id} className="py-2.5 border-b border-gray-100 space-y-2.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-sans-bold text-gray-800">
                        {item.name || t('provider.invoiceNamePlaceholder')}
                      </Text>
                      <Pressable
                        onPress={() => handleRemoveItem(originalIndex)}
                        accessibilityRole="button"
                        accessibilityLabel={t('provider.removeItem')}
                        hitSlop={10}
                        className="p-1 rounded active:bg-red-50"
                      >
                        <Feather name="trash-2" size={14} color={THEME_COLORS.dangerRed} />
                      </Pressable>
                    </View>

                    {/* Description Input for Additional Item */}
                    <View>
                      <Text className="text-xs font-sans-medium text-gray-600 mb-1">{t('provider.invoiceName')}</Text>
                      <View className="h-10 px-3 flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                        <TextInput
                          value={item.name}
                          onChangeText={(text) => handleItemNameChange(text, originalIndex)}
                          placeholder={t('provider.invoiceNamePlaceholder')}
                          placeholderTextColor="#94a3b8"
                          className="flex-1 text-xs font-sans-medium text-gray-900 p-0"
                        />
                      </View>
                    </View>

                    {/* Quantity and Price Inputs Side-by-Side */}
                    <View className="flex-row gap-3">
                      <View className="w-24">
                        <Text className="text-xs font-sans-medium text-gray-600 mb-1">
                          {t('provider.invoiceQty', 'Qty')}
                        </Text>
                        <View className="h-10 px-3 flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                          <TextInput
                            value={item.quantity}
                            onChangeText={(text) => handleItemQuantityChange(text, originalIndex)}
                            placeholder="1"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            className="flex-1 text-xs font-sans-semibold text-gray-900 p-0 text-center"
                          />
                        </View>
                      </View>

                      <View className="flex-1">
                        <Text className="text-xs font-sans-medium text-gray-600 mb-1">
                          {t('provider.invoicePrice')}
                        </Text>
                        <View className="h-10 px-3 flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                          <Text className="text-xs font-sans-semibold text-gray-500 mr-2">Rs.</Text>
                          <TextInput
                            value={item.unit_price}
                            onChangeText={(text) => handleItemPriceChange(text, originalIndex)}
                            placeholder="0"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                            className="flex-1 text-xs font-sans-semibold text-gray-900 p-0"
                          />
                        </View>
                      </View>
                    </View>

                    {/* Line Total */}
                    <View className="pt-1.5 flex-row justify-between items-center">
                      <Text className="text-[10px] font-sans-medium text-gray-400">
                        {t('provider.itemTotal', 'Item Total')}
                      </Text>
                      <Text className="text-xs font-sans-bold text-gray-800">
                        Rs. {((parseInt(item.quantity, 10) || 0) * (parseFloat(item.unit_price) || 0)).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Add Additional Charge Button */}
            <Pressable
              onPress={handleAddItem}
              accessibilityRole="button"
              accessibilityLabel={t('provider.invoiceAddAdditionalCharge', 'Add Additional Charge')}
              className="flex-row items-center justify-center py-2.5 px-4 rounded-lg border border-dashed border-primary/40 bg-surface-indigo-subtle/50 active:bg-surface-indigo-subtle gap-x-2 mt-1"
            >
              <Feather name="plus-circle" size={15} color={THEME_COLORS.primary} />
              <Text className="text-xs font-sans-bold text-primary">
                {t('provider.invoiceAddAdditionalCharge', 'Add Additional Charge')}
              </Text>
            </Pressable>
          </View>

          {/* Section Divider */}
          <View className="h-px bg-gray-200 my-4" />

          {/* Notes Input in Edit Mode */}
          <View>
            <View className="flex-row items-center mb-2">
              <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                {t('provider.invoiceNotes', 'Notes for Customer')}
              </Text>
            </View>
            <View className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
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
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row items-center mb-1.5">
            <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-bold text-gray-900 ml-2">
              {t('provider.invoiceNotes', 'Notes for Customer')}
            </Text>
          </View>
          <Text className="text-xs font-sans-medium text-gray-600 leading-5">{notes}</Text>
        </View>
      ) : null}

      {/* Summary Breakdown */}
      <View className="mt-4 pt-4 border-t border-gray-100 gap-y-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs font-sans-medium text-gray-500">{t('provider.invoiceSubtotal')}</Text>
          <Text className="text-xs font-sans-semibold text-gray-800">Rs. {subtotal.toLocaleString()}</Text>
        </View>

        <View className="flex-row justify-between items-center pt-1">
          <Text className="text-sm font-sans-bold text-gray-900">{t('provider.invoiceTotal')}</Text>
          <Text className="text-base font-sans-extrabold text-primary">Rs. {total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Download Invoice Button (View Mode) */}
      {!isEditing && onDownloadInvoice ? (
        <View className="mt-4 pt-3 border-t border-gray-100">
          <Pressable
            onPress={onDownloadInvoice}
            disabled={isDownloadingInvoice}
            accessibilityRole="button"
            className="w-full flex-row items-center justify-center py-3 px-4 rounded-lg border border-primary bg-white active:bg-primary/5 min-h-[44px] gap-x-2 disabled:opacity-50"
          >
            {isDownloadingInvoice ? (
              <ActivityIndicator size="small" color={THEME_COLORS.primary} />
            ) : (
              <>
                <Feather name="download" size={15} color={THEME_COLORS.primary} />
                <Text className="text-xs font-sans-bold text-primary">
                  {t('provider.downloadInvoice', 'Download Invoice')}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : null}

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
