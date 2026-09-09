import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Asegúrate de que estas variables estén configuradas en Vercel también
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Faltan credenciales de Supabase' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Consulta ligera para evitar que la base de datos se suspenda
    const { data, error } = await supabase
      .from('figuras')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Ping Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ 
      status: 'ok', 
      message: 'Supabase ping exitoso',
      data: data 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
