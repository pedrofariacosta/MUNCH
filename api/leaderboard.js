import { kv } from '@vercel/kv';

// ============================================================================
// CONFIGURAÇÕES DE SEGURANÇA E RATE LIMITING
// ============================================================================
const ALLOWED_EXACT_HOSTS = new Set([
  'munch.bytecodegroup.com.br',
  'www.munch.bytecodegroup.com.br',
  'localhost',
  '127.0.0.1'
]);

function getValidatedOrigin(originHeader) {
  if (!originHeader) return null;
  try {
    const parsed = new URL(originHeader);
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_EXACT_HOSTS.has(host) || host.endsWith('.vercel.app')) {
      return originHeader;
    }
  } catch (e) { }
  return null;
}

// Fallback in-memory para Rate Limiting quando KV estiver offline/local
const memoryRateLimits = new Map();

function checkMemoryRateLimit(ip, maxRequests, windowMs) {
  const now = Date.now();
  let records = memoryRateLimits.get(ip) || [];
  records = records.filter(ts => now - ts < windowMs);
  if (records.length >= maxRequests) {
    memoryRateLimits.set(ip, records);
    return true; // Bloqueado
  }
  records.push(now);
  memoryRateLimits.set(ip, records);
  return false;
}

export default async function handler(req, res) {
  const originHeader = req.headers.origin || '';
  const refererHeader = req.headers.referer || '';
  const validatedOrigin = getValidatedOrigin(originHeader);

  // Aplicação estrita de CORS — Nunca utilize wildcard '*' em endpoints com escrita
  if (validatedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', validatedOrigin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    if (originHeader && !validatedOrigin) {
      return res.status(403).end();
    }
    return res.status(200).end();
  }

  // ==========================================================================
  // GET: Retorna o Top 5 da Stake solicitada (?stake=white|red|gold)
  // ==========================================================================
  if (req.method === 'GET') {
    try {
      const stake = (req.query.stake || 'white').toLowerCase();
      const validStakes = ['white', 'red', 'gold'];
      const targetStake = validStakes.includes(stake) ? stake : 'white';

      const key = `munch_leaderboard_${targetStake}`;
      const rawScores = await kv.zrange(key, 0, 4, { rev: true });

      const topScores = rawScores.map(entry => (typeof entry === 'string' ? JSON.parse(entry) : entry));
      return res.status(200).json(topScores);
    } catch (err) {
      console.error('Erro ao buscar recordes no Redis:', err);
      return res.status(500).json({ error: 'Falha ao buscar leaderboard' });
    }
  }

  // ==========================================================================
  // POST: Validação e Registro de Novo Recorde com Anti-Cheat Serverless
  // ==========================================================================
  if (req.method === 'POST') {
    // 1. Validação de Origem / Referer do jogo
    if (originHeader && !validatedOrigin) {
      return res.status(403).json({ error: 'Acesso não autorizado: Origem externa não permitida' });
    }
    if (!originHeader && refererHeader) {
      const refererValidated = getValidatedOrigin(refererHeader);
      if (!refererValidated) {
        return res.status(403).json({ error: 'Acesso não autorizado: Referer não reconhecido' });
      }
    }

    // 2. Rate Limiting por IP (Máximo 5 submissões por minuto por IP)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket?.remoteAddress || '127.0.0.1').trim();
    const RATE_LIMIT_MAX = 5;
    const RATE_LIMIT_WINDOW_SEC = 60;
    let isRateLimited = false;

    try {
      const rlKey = `munch_rl_${ip}`;
      const count = await kv.incr(rlKey);
      if (count === 1) {
        await kv.expire(rlKey, RATE_LIMIT_WINDOW_SEC);
      }
      if (count > RATE_LIMIT_MAX) {
        isRateLimited = true;
      }
    } catch (kvErr) {
      isRateLimited = checkMemoryRateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SEC * 1000);
    }

    if (isRateLimited) {
      return res.status(429).json({ error: 'Muitas tentativas de envio. Aguarde 1 minuto.' });
    }

    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const { name, score, ante, stake, cleared, durationMs, itemsEaten } = body;

      // 3. Validação Básica de Tipos e Limites
      if (!name || typeof score !== 'number' || isNaN(score) || score < 0) {
        return res.status(400).json({ error: 'Dados de pontuação inválidos' });
      }

      // Se a pontuação for 0 (ex.: neutralizada pelo anti-cheat do frontend), confirma silenciosamente sem gravar
      if (score === 0) {
        return res.status(200).json({ success: true, silent: true });
      }

      const validDuration = Number(durationMs) || 0;
      const validItems = Number(itemsEaten) || 0;

      // 4. Validação de Plausibilidade Temporal (Duração mínima)
      // Nenhuma partida genuína com pontuação válida pode durar menos de 3 segundos
      if (validDuration < 3000) {
        return res.status(400).json({ error: 'Duração da partida implausível' });
      }

      // Partida concluída (Ante 8) exige atravessar 24 estágios com pausas de transição
      if (cleared && validDuration < 40000) {
        return res.status(400).json({ error: 'Tempo de vitória total insuficiente' });
      }

      // 5. Validação da Razão Pontuação / Tempo (Taxa máxima de geração de pontos)
      // Teto generoso de até 75 pontos por milissegundo de média (75.000 pontos/segundo)
      const scoreRate = score / validDuration;
      if (score > 50000 && scoreRate > 75) {
        return res.status(400).json({ error: 'Taxa de pontuação fisicamente impossível' });
      }

      // 6. Validação de Ações (Não é possível ter pontuação expressiva sem comer pastilhas/fantasmas)
      if (score > 5000 && validItems < 3) {
        return res.status(400).json({ error: 'Ações registradas insuficientes para a pontuação obtida' });
      }

      const cleanStake = ['white', 'red', 'gold'].includes(stake) ? stake : 'white';
      const cleanName = String(name).trim().toUpperCase().slice(0, 12) || 'SLIME_ANONIMO';

      const entry = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        score: Math.round(score),
        ante: ante || 1,
        stake: cleanStake,
        cleared: !!cleared,
        date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      const key = `munch_leaderboard_${cleanStake}`;

      // Salva no Sorted Set com o score numérico como peso de ordenação
      await kv.zadd(key, {
        score: entry.score,
        member: JSON.stringify(entry)
      });

      return res.status(200).json({ success: true, entry });
    } catch (err) {
      console.error('Erro ao salvar recorde no Redis:', err);
      return res.status(500).json({ error: 'Falha ao gravar pontuação' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
