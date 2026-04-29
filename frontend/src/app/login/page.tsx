import FormBackground from "../components/ui/FormBackground/FormBackground";
import LoginForm from "../components/LoginPage/LoginForm/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <FormBackground />
      <LoginForm />
    </main>
  );
}
