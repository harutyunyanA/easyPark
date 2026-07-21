import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "error" | "success" | "info";

type ToastState = {
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  // type по умолчанию 'error' — тостим им в основном серверные ошибки.
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_HIDE_MS = 4000;

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);

  // Анимируем обычным Animated из react-native, а не reanimated — тостеру
  // хватает fade+slide, worklet-инфраструктуру ради этого поднимать незачем.
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -16,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, type });
      opacity.setValue(0);
      translateY.setValue(-16);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      hideTimer.current = setTimeout(hide, AUTO_HIDE_MS);
    },
    [opacity, translateY, hide],
  );

  // Не оставляем висящий таймер, если провайдер размонтируют во время показа.
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext value={value}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.container,
            { top: insets.top + 8, opacity, transform: [{ translateY }] },
          ]}
        >
          <Pressable
            onPress={hide}
            style={[styles.toast, TYPE_STYLES[toast.type]]}
          >
            <Text style={styles.text}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext>
  );
}

export function useToast() {
  const value = use(ToastContext);
  if (!value) {
    throw new Error("useToast must be wrapped in a <ToastProvider />");
  }
  return value;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

const TYPE_STYLES: Record<ToastType, { backgroundColor: string }> = {
  error: { backgroundColor: "#DC2626" },
  success: { backgroundColor: "#16A34A" },
  info: { backgroundColor: "#208AEF" },
};
