import { useLogin } from "@/api/auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignIn() {
  const loginMutation = useLogin();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const canSubmit =
    email.length > 0 && password.length > 0 && !loginMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sign In</Text>

      <View style={styles.googleBlock}>
        <Pressable style={styles.googleBtn}>
          <Image
            source={require("@/assets/images/tabIcons/icons8-google.svg")}
            style={styles.icon}
          />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </Pressable>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>or sign in with</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9AA5B1"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.label}>Password</Text>
            <Link href={"/"} style={styles.link}>
              Forgot Password
            </Link>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputFlex}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9AA5B1"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#9AA5B1"
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          disabled={!canSubmit}
          onPress={() => loginMutation.mutate({ email, password })}
        >
          <Text style={styles.buttonText}>
            {loginMutation.isPending ? "Logging In…" : "Login"}
          </Text>
        </Pressable>

        <View style={styles.signUpBlock}>
          <Text>Don't have an account?</Text>
          <Link href="/sign-up" style={styles.link}>
            Sign up here
          </Link>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  googleBlock: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  googleBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F4F7FF",
  },
  icon: {
    width: 20,
    height: 20,
  },
  googleText: {
    color: "#000000",
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D3DCE6",
  },
  orText: {
    color: "#4B5768",
  },
  form: {
    width: "100%",
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#000",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2933",
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2933",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  link: {
    color: "#1443C3",
    textAlign: "center",
  },
  signUpBlock: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    gap: 2,
  },
});
