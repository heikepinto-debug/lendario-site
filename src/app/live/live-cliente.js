'use client';

import { useState, useEffect } from 'react';
import styles from './live.module.css';

// Quanto tempo o "a sortear..." dura antes de revelar (só efeito de palco).
const SUSPENSE_MS = 4000;

export default function LiveCliente() {
  const [s, setS] = useState(null);
  const [contador, setContador] = useState(null);
  const [revelado, setRevelado] = useState(false);
  const [aRevelar, setARevelar] = useState(false);

  // sonda o estado do sorteio
  useEffect(() => {
    let vivo = true;
    async function puxar() {
      try {
        const d = await fetch('/api/live/sorteio', { cache: 'no-store' }).then((r) => r.json());
        if (!vivo) return;
        setS((anterior) => {
          // transição para 'sorteado' → faz o suspense antes de revelar
          if (anterior && anterior.estado !== 'sorteado' && d.estado === 'sorteado') {
            setARevelar(true);
            setTimeout(() => { setARevelar(false); setRevelado(true); }, SUSPENSE_MS);
          } else if (d.estado === 'sorteado' && !anterior) {
            setRevelado(true); // já estava sorteado ao abrir a página
          }
          return d;
        });
      } catch { /* mantém o que está no ecrã */ }
    }
    puxar();
    const t = setInterval(puxar, 3000);
    return () => { vivo = false; clearInterval(t); };
  }, []);

  // contador de entradas (enquanto está aberto)
  useEffect(() => {
    if (!s || s.estado !== 'aberto') return;
    let vivo = true;
    async function puxar() {
      try {
        const d = await fetch('/api/live/contador', { cache: 'no-store' }).then((r) => r.json());
        if (vivo) setContador(d);
      } catch { /* ignora */ }
    }
    puxar();
    const t = setInterval(puxar, 10000);
    return () => { vivo = false; clearInterval(t); };
  }, [s?.estado]);

  if (!s) {
    return <main className={styles.palco}><div className={styles.aCarregar}>…</div></main>;
  }

  return (
    <main className={styles.palco}>
      <div className={styles.marca}>CANSADO <span>→</span> LENDÁRIO</div>

      {/* ---- ainda a receber entradas ---- */}
      {s.estado === 'aberto' && (
        <div className={styles.centro}>
          <div className={styles.etiqueta}>Entradas no sorteio</div>
          <div className={styles.numeroGigante}>{contador ? contador.entradas.toLocaleString('pt-PT') : '—'}</div>
          <div className={styles.legenda}>
            {contador ? `${contador.participantes.toLocaleString('pt-PT')} participantes` : ''}
          </div>
          <div className={styles.rodapeNota}>O sorteio ainda não fechou.</div>
        </div>
      )}

      {/* ---- lista fechada, à espera da extracção ---- */}
      {s.estado === 'fechado' && !aRevelar && (
        <div className={styles.centro}>
          <div className={styles.etiqueta}>Lista fechada</div>
          <div className={styles.numeroGigante}>{s.total_entradas?.toLocaleString('pt-PT')}</div>
          <div className={styles.legenda}>bilhetes em jogo</div>
          <div className={styles.compromisso}>
            <div className={styles.compTitulo}>Compromisso público</div>
            <p>
              A lista está congelada e a semente do sorteio já foi selada. Ninguém —
              nem a organização — sabe o vencedor. Depois da extracção, a semente é
              revelada e qualquer pessoa pode refazer a conta.
            </p>
            <div className={styles.hashes}>
              <div><span>Lista</span><code>{curto(s.lista_hash)}</code></div>
              <div><span>Semente selada</span><code>{curto(s.semente_hash)}</code></div>
            </div>
          </div>
        </div>
      )}

      {/* ---- suspense ---- */}
      {aRevelar && (
        <div className={styles.centro}>
          <div className={styles.aSortear}>A SORTEAR</div>
          <div className={styles.pontos}><i /><i /><i /></div>
        </div>
      )}

      {/* ---- resultado ---- */}
      {s.estado === 'sorteado' && revelado && s.resultados && (
        <div className={styles.centro}>
          <div className={styles.etiqueta}>O bilhete vencedor</div>
          <div className={styles.bilheteVencedor}>{s.resultados[0]?.bilhete}</div>
          <div className={styles.nomeVencedor}>{s.resultados[0]?.nome}</div>

          {s.resultados.length > 1 && (
            <div className={styles.suplentes}>
              <div className={styles.supTitulo}>Suplentes</div>
              <div className={styles.supLista}>
                {s.resultados.slice(1).map((r) => (
                  <div key={r.posicao} className={styles.sup}>
                    <span className={styles.supPos}>{r.posicao}.º</span>
                    <span className={styles.supBilhete}>{r.bilhete}</span>
                    <span className={styles.supNome}>{r.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.verificar}>
            Sorteio verificável · semente <code>{curto(s.semente)}</code> ·
            lista <code>{curto(s.lista_hash)}</code>
          </div>
        </div>
      )}
    </main>
  );
}

function curto(h) {
  if (!h) return '—';
  return h.slice(0, 8) + '…' + h.slice(-8);
}
