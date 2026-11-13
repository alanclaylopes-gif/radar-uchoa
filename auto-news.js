import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

// Configurações do seu Supabase
const SUPABASE_URL = "https://bgpomhmchmpiseeeqgap.supabase.co";
const SUPABASE_SERVICE_KEY = "SUA_CHAVE_SERVICE_ROLE_DO_SUPABASE"; // Chave secreta com permissão de escrita
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const parser = new Parser();

// Exemplo: Feed RSS de notícias da região (ex: G1 Rio Preto ou outro portal)
const RSS_URL = "https://g1.globo.com/rs/rio-grande-do-sul/rss2.xml"; // Substitua pelo feed da sua região desejada

async function atualizarNoticiasRegionais() {
  console.log("Buscando novas notícias da região...");
  
  try {
    const feed = await parser.parseURL(RSS_URL);
    
    for (let item of feed.items.slice(0, 5)) { // Pega as 5 mais recentes
      // Verifica se a notícia já existe pelo link externo
      const { data: existente } = await supabase
        .from('publicacoes')
        .select('id')
        .eq('link_externo', item.link)
        .single();

      if (!existente) {
        // Insere a nova notícia automaticamente na tabela
        const { error } = await supabase.from('publicacoes').insert([{
          titulo: item.title,
          categoria: 'Notícias',
          resumo: item.contentSnippet || item.title,
          conteudo: item.content || item.contentSnippet || '',
          link_externo: item.link,
          destaque: false
        }]);

        if (error) {
          console.error("Erro ao inserir notícia:", error.message);
        } else {
          console.log(`Nova notícia adicionada: ${item.title}`);
        }
      }
    }
    console.log("Atualização concluída com sucesso!");
  } catch (err) {
    console.error("Erro ao processar RSS:", err);
  }
}

atualizarNoticiasRegionais();
