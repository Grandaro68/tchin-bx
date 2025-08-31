import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function isAdult(birthdateStr) {
  const d = new Date(birthdateStr);
  const now = new Date();
  const eighteen = new Date(now.getFullYear()-18, now.getMonth(), now.getDate());
  return d <= eighteen;
}

async function signUpEmail({
  email, password, passwordConfirm,
  username, first_name, last_name, birthdate,
  certify
}) {
  if (!certify) throw new Error("Veuillez certifier l'exactitude des informations.");
  if (password !== passwordConfirm) throw new Error("Les mots de passe ne correspondent pas.");
  if (!isAdult(birthdate)) throw new Error("Vous devez avoir 18 ans ou plus.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, first_name, last_name, birthdate } // -> handled by trigger handle_new_user()
    }
  });
  if (error) throw error;
  // Optionnel: si email confirmation activée, un mail est envoyé ici.
  return data;
}