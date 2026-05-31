import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import Button from '@/components/Button';
import { ROUTES } from '@/constants/routes';
import AuthScreenLayout from '../components/AuthScreenLayout';

export default function OtpVerificationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone, flow } = useLocalSearchParams<{ phone: string; flow: 'signup' | 'forgot-password' }>();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<TextInput[]>([]);

  // Start resend countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanText.length > 0) {
      // Take only the last character if pasted/entered
      const char = cleanText[cleanText.length - 1];
      newOtp[index] = char;
      setOtp(newOtp);
      setError(null);

      // Auto focus next input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
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
    if (timer > 0) return;
    setTimer(60);
    setError(null);
    alert('A new OTP has been sent successfully!');
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError(t('auth.enterOtp'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // For mock purposes: accept '123456' or any 6 digits for testing
      alert(t('auth.otpVerifiedSuccess'));

      if (flow === 'forgot-password') {
        // Reset password screen: replace so we don't go back to OTP screen
        router.replace({
          pathname: ROUTES.auth.resetPassword,
          params: { phone },
        });
      } else {
        // Signup verified: redirect to Sign In
        router.replace(ROUTES.auth.signin);
      }
    }, 1500);
  };

  return (
    <AuthScreenLayout
      title={t('auth.otpVerificationTitle')}
      subtitle={t('auth.otpVerificationSubtitle', { phone: phone || '' })}
      showBackButton
    >
      <View className="flex-row justify-center items-center mb-6 -mx-1">
        {otp.map((digit, idx) => (
          <View
            key={idx}
            className={`flex-1 aspect-square max-w-[48px] mx-1 border rounded-lg bg-white items-center justify-center ${
              digit ? 'border-primary' : 'border-gray-200'
            }`}
            style={{
              shadowColor: digit ? '#485aff' : '#000',
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
              style={{ textAlignVertical: 'center', padding: 0, includeFontPadding: false, lineHeight: undefined }}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      {error ? <Text className="text-xs font-sans-medium text-destructive mb-6 ml-1">{error}</Text> : null}

      <View className="gap-y-4">
        <Button title={t('auth.continue')} loading={loading} onPress={handleVerify} className="w-full" />

        <View className="flex-row items-center justify-center mt-2">
          {timer > 0 ? (
            <Text className="text-gray-500 font-sans-medium text-sm">{t('auth.resendCodeIn', { seconds: timer })}</Text>
          ) : (
            <Pressable onPress={handleResend} className="active:opacity-60">
              <Text className="text-primary font-sans-bold text-sm">{t('auth.resendCode')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AuthScreenLayout>
  );
}
