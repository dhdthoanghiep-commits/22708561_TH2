import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KtxButton from '@components/KtxButton';
import Watermark from '@components/Watermark';
import { STUDENT, VARIANT, examStamp } from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';
import { useAuthStore } from '@stores/authStore';

/** Giao diện 1 — Đăng nhập (Auth Stack). Ô nhập email HOẶC phone theo VARIANT.authField */
const LoginScreen = () => {
  const login = useAuthStore(state => state.login);
  const isEmail = VARIANT.authField === 'email';

  const [account, setAccount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validate cơ bản (Chương 5 – Bước 2): email phải có @, phone đủ 10 số bắt đầu bằng 0
  const validate = (): string | null => {
    const value = account.trim();
    if (isEmail) {
      return value.includes('@') ? null : 'Email không hợp lệ (phải chứa @)';
    }
    return /^0\d{9}$/.test(value)
      ? null
      : 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0';
  };

  const handleLogin = () => {
    const message = validate();
    setError(message);
    if (message) {
      return;
    }
    setLoading(true);
    // Giả lập gọi API rồi lưu token giả vào Zustand -> RootNavigator tự chuyển sang Main Tabs
    setTimeout(() => {
      setLoading(false);
      login(`ktxgo-${STUDENT.mssv}-${examStamp()}`, account.trim());
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Watermark position="top" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.brand}>KTXGO</Text>
        <Text style={styles.subtitle}>Giao đồ tận phòng ký túc xá</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={account}
          onChangeText={setAccount}
          placeholder={
            isEmail
              ? `Email — ${STUDENT.mssv}@iuh.edu.vn`
              : 'Số điện thoại — 09xx xxx xxx'
          }
          placeholderTextColor={COLORS.textLight}
          keyboardType={isEmail ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={isEmail ? 64 : 10}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <KtxButton
          title="Vào cửa hàng"
          onPress={handleLogin}
          isLoading={loading}
          style={styles.loginBtn}
        />

        <Text style={styles.footnote}>
          Auth Stack · chưa có token · đăng nhập bằng{' '}
          {isEmail ? 'email' : 'số điện thoại'}
        </Text>
      </KeyboardAvoidingView>
      <Watermark position="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 24,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: SIZES.body1,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.surface,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  inputError: { borderColor: COLORS.error },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.body2,
    marginTop: 6,
  },
  loginBtn: { marginTop: 20 },
  footnote: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
});

export default LoginScreen;
