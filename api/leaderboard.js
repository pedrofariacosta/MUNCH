import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Retorna o Top 5 da Stake solicitada (?stake=white|red|gold)
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

  // POST: Registra um novo recorde na Stake correspondente
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const { name, score, ante, stake } = body;

      if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Dados inválidos' });
      }

      const cleanStake = ['white', 'red', 'gold'].includes(stake) ? stake : 'white';
      const cleanName = String(name).trim().toUpperCase().slice(0, 12) || 'SLIME_ANONIMO';

      const entry = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        score: Math.round(score),
        ante: ante || 1,
        stake: cleanStake,
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
