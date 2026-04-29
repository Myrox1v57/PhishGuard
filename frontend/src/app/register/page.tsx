import FormBackground from "../components/ui/FormBackground/FormBackground";
import RegisterForm from "../components/LoginPage/RegisterForm/RegisterForm";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <FormBackground />
      <RegisterForm />
    </main>
  );
}
