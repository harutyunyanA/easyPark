import { useRegister } from "@/api/auth";
import { isStrongPassword, PASSWORD_RULES } from "@/lib/password";
import { CreateUser } from "@/types/user.types";
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

export default function SignUp() {
  const [user, setUser] = useState<CreateUser>({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const registerMutation = useRegister();

  // Валидности считаем производно — не держим отдельный state, чтобы не рассинхронить.
  const passwordStrong = isStrongPassword(user.password);
  const passwordsMatch =
    user.password.length > 0 && user.password === confirmPassword;
  const showConfirmFeedback = confirmPassword.length > 0;
  const canSubmit =
    user.name.length > 0 &&
    user.email.length > 0 &&
    passwordStrong &&
    passwordsMatch &&
    !registerMutation.isPending;

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
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.googleBlock}>
          <Pressable style={styles.googleBtn}>
            <Image
              source={require("@/assets/images/tabIcons/icons8-google.svg")}
              style={styles.icon}
            />
            <Text style={styles.googleText}>Sign up with Google</Text>
          </Pressable>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
              placeholder="John Doe"
              placeholderTextColor="#9AA5B1"
              inputMode="text"
              autoComplete="name"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={user.email}
              onChangeText={(value) => setUser({ ...user, email: value })}
              placeholder="you@example.com"
              placeholderTextColor="#9AA5B1"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputFlex}
                value={user.password}
                onChangeText={(value) => setUser({ ...user, password: value })}
                placeholder="••••••••"
                placeholderTextColor="#9AA5B1"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
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
            {user.password.length > 0 && (
              <View style={styles.rulesList}>
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(user.password);
                  return (
                    <View key={rule.label} style={styles.ruleRow}>
                      <Ionicons
                        name={passed ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={passed ? "#16A34A" : "#9AA5B1"}
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          passed && styles.rulePassedText,
                        ]}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                showConfirmFeedback &&
                  (passwordsMatch ? styles.inputOk : styles.inputError),
              ]}
            >
              <TextInput
                style={styles.inputFlex}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#9AA5B1"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
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
            {showConfirmFeedback && (
              <Text
                style={passwordsMatch ? styles.successText : styles.errorText}
              >
                {passwordsMatch ? "Passwords match" : "Passwords don't match"}
              </Text>
            )}
          </View>

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            disabled={!canSubmit}
            onPress={() => registerMutation.mutate(user)}
          >
            <Text style={styles.buttonText}>
              {registerMutation.isPending ? "Signing Up…" : "Sign Up"}
            </Text>
          </Pressable>

          <View style={styles.signUpBlock}>
            <Text>Already have an account?</Text>
            <Link href="/sign-in" style={styles.link}>
              Sign in here
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
    gap: 16,
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
  rulesList: {
    gap: 4,
    marginTop: 2,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ruleText: {
    color: "#9AA5B1",
    fontSize: 13,
  },
  rulePassedText: {
    color: "#16A34A",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  inputOk: {
    borderColor: "#16A34A",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  successText: {
    color: "#16A34A",
    fontSize: 13,
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
