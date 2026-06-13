import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las variables de entorno, el juego funciona igual
// pero el ranking mundial queda deshabilitado (muestra aviso).
export const supabase = url && key ? createClient(url, key) : null;
export default supabase;
