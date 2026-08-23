import React, { useEffect, useRef, useState } from 'react';
import { NativeSyntheticEvent, Pressable, Text, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SheetContainer from '@/components/ui/SheetContainer';
import Button from '@/components/ui/Button';
import { useRequestPhoneChange, useVerifyPhoneChange } from '@/api';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/components/ui/Snackbar';
import { THEME_COLORS } from '@/constants/colors';
import { unformatPhone } from '@/features/auth/utils/phone';

export interface ChangePhoneSheetProps {
  visible: boolean;
  onClose: () => void;
  newPhone: string;
}

export default function ChangePhoneSheet({ visible, onClose, newPhone }: ChangePhoneSheetProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);

  const handleClose = () => {
    setOtp(Array(6).fill(''));
    setTimer(60);
    onClose();
  };

  useEffect(() => {
    if (!visible || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, timer]);

  const requestPhoneOtpMutation = useRequestPhoneChange(() => {
    setTimer(60);
  });

  const verifyPhoneChangeMutation = useVerifyPhoneChange(async () => {
    handleClose();
    await logout();
  });

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanText.length > 0) {
      const char = cleanText[cleanText.length - 1];
      newOtp[index] = char;
      setOtp(newOtp);

      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResend = () => {
    if (timer > 0 || !newPhone) return;
    requestPhoneOtpMutation.mutate({
      new_phone: newPhone,
    });
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      showSnackbar({ message: t('auth.enterOtp'), type: 'error' });
      return;
    }

    verifyPhoneChangeMutation.mutate({
      new_phone: newPhone,
      otp: code,
    });
  };

  const rawPhone = unformatPhone(newPhone);

  return (
    <SheetContainer
      visible={visible}
      onClose={handleClose}
      title={t('customer.verifyNewPhoneTitle') || 'Verify Mobile Number'}
      description={
        t('customer.verifyNewPhoneDesc', { phone: rawPhone }) ||
        `Enter the 6-digit verification code sent to +977 ${rawPhone}`
      }
    >
      <View className="py-2">
        <View className="flex-row items-center w-full gap-x-2 mb-6">
          {otp.map((digit, idx) => (
            <View
              key={idx}
              className={`flex-1 aspect-square border rounded-lg bg-white items-center justify-center ${
                digit ? 'border-primary' : 'border-gray-200'
              }`}
              style={{
                shadowColor: digit ? THEME_COLORS.primary : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: digit ? 0.05 : 0.015,
                shadowRadius: digit ? 4 : 2,
                elevation: digit ? 1 : 0,
              }}
            >
              <TextInput
                ref={(ref) => {
                  if (ref) inputRefs.current[idx] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChangeText(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={6}
                className="w-full h-full text-center text-xl font-sans-bold text-gray-900 m-0 p-0"
                style={{ textAlignVertical: 'center', padding: 0, includeFontPadding: false }}
                selectTextOnFocus
              />
            </View>
          ))}
        </View>

        <View className="gap-y-4">
          <Button
            title={t('customer.verifyAndChange') || 'Verify & Change'}
            loading={verifyPhoneChangeMutation.isPending}
            onPress={handleVerify}
            className="w-full bg-primary"
          />

          <View className="flex-row items-center justify-center mt-1">
            {timer > 0 ? (
              <Text className="text-gray-500 font-sans-medium text-sm">
                {t('auth.resendCodeIn', { seconds: timer })}
              </Text>
            ) : (
              <Pressable
                onPress={handleResend}
                disabled={requestPhoneOtpMutation.isPending}
                className="active:opacity-60"
                accessibilityRole="button"
              >
                <Text className="text-primary font-sans-bold text-sm">
                  {requestPhoneOtpMutation.isPending ? t('common.loading') : t('auth.resendCode')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SheetContainer>
  );
}
