import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

const SUPABASE_URL = "https://bgpomhmchmpiseeeqgap.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const parser = new Parser();

const RSS_URL = "https://news.google.com/rss/search?q=Uchoa+OR+%22S%C3%A3o+Jos%C3%A9+do+Rio+Preto%22+SP&hl=pt-BR&gl=BR&ceid=BR:pt-419";

async function atualizarNoticiasRegionais() {
  try {
    const feed = await parser.parseURL(RSS_URL);
    for (let item of feed.items.slice(0, 6)) {
      const partes = item.title.split(" - ");
      const tituloLimpo = partes[0];
      const fonte = partes.slice(1).join(" - ") || "Imprensa Regional";

      const { data: existente } = await supabase
        .from('publicacoes')
        .select('id')
        .eq('link_externo', item.link)
        .maybeSingle();

      if (!existente) {
        await supabase.from('publicacoes').insert([{
          titulo: tituloLimpo,
          categoria: 'Notícias',
          resumo: `Publicação regional via ${fonte}. Clique em ver detalhes para ler a matéria completa.`,
          conteudo: `Notícia capturada automaticamente da fonte: ${fonte}.\n\nAcesse o link externo abaixo para ler a reportagem completa no portal original.`,
          link_externo: item.link,
          destaque: false
        }]);
      }
    }
    console.log("Atualização concluída!");
  } catch (err) {
    console.error("Erro:", err);
  }
}

atualizarNoticiasRegionais();