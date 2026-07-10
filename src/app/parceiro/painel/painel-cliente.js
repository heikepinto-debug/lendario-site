'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../parceiro.module.css';

export default function PainelCliente({ inicial }) {
  const router = useRouter();
  const [dados, setDados] = useState({ parceiro: inicial, metricas: null });
  const [msg, setMsg] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/parceiro/metricas')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setDados(d); })
      .catch(() => {});
  }, []);

  const p = dados.parceiro;
  const m = dados.metricas;

  async function sair() {
    await fetch('/api/parceiro/logout', { method: 'POST' });
    router.push('/parceiro');
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    setAGuardar(true);
    setMsg('');
    const fd = new FormData(e.target);
    const payload = {
      categoria: fd.get('categoria'),
      localizacao: fd.get('localizacao'),
      link: fd.get('link'),
    };

    const file = fileRef.current?.files?.[0];
    if (file) {
      payload.logo = await ficheiroParaDataUrl(file);
    }

    try {
      const r = await fetch('/api/parceiro/perfil', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.ok) {
        setMsg(d.estado === 'activo' ? 'Guardado. O teu perfil está activo e aparece no site!' : 'Guardado.');
        const r2 = await fetch('/api/parceiro/metricas');
        const d2 = await r2.json();
        if (d2.ok) setDados(d2);
      } else {
        const erros = {
          logo_grande: 'O logótipo é demasiado grande (máx. ~400 KB).',
          tipo_invalido: 'Usa PNG, JPG, WEBP ou SVG.',
          nada_a_actualizar: 'Não mudaste nada.',
        };
        setMsg(erros[d.erro] || 'Não foi possível guardar.');
      }
    } catch {
      setMsg('Sem ligação. Tenta de novo.');
    }
    setAGuardar(false);
  }

  return (
    <main className={styles.painel}>
      <header className={styles.painelTop}>
        <div className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</div>
        <button onClick={sair} className={styles.sair}>Sair</button>
      </header>

      <div className={styles.painelWrap}>
        <div className={styles.painelHead}>
          <h1>{p.nome}</h1>
          <span className={`${styles.badge} ${p.estado === 'activo' ? styles.badgeOk : styles.badgeWarn}`}>
            {p.estado === 'activo' ? 'Activo no site' : 'Perfil incompleto'}
          </span>
        </div>

        {p.estado !== 'activo' && (
          <div className={styles.aviso}>
            Para apareceres no site e os teus vouchers funcionarem, carrega o teu
            <strong> logótipo</strong>, a categoria e a localização abaixo.
          </div>
        )}

        <section className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardN}>{m ? m.vouchers_emitidos : '—'}</div>
            <div className={styles.cardL}>Vouchers emitidos</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardN}>{m ? m.vouchers_activados : '—'}</div>
            <div className={styles.cardL}>Vouchers activados</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardN}>{m ? m.entradas_geradas : '—'}</div>
            <div className={styles.cardL}>Entradas geradas por ti</div>
          </div>
        </section>

        <section className={styles.perfil}>
          <h2>O teu perfil</h2>
          <form onSubmit={guardarPerfil}>
            <label>Logótipo</label>
            <div className={styles.logoRow}>
              <div className={styles.logoPreview}>
                {p.logo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.logo_url} alt="logótipo" />
                  : <span>sem logótipo</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
            </div>
            <p className={styles.dica}>PNG, JPG, WEBP ou SVG. De preferência com fundo transparente.</p>

            <label htmlFor="categoria">Categoria</label>
            <input id="categoria" name="categoria" type="text" defaultValue={p.categoria || ''} placeholder="Ex.: Supermercado, Oficina, Restaurante" />

            <label htmlFor="localizacao">Localização</label>
            <input id="localizacao" name="localizacao" type="text" defaultValue={p.localizacao || ''} placeholder="Ex.: Maputo" />

            <label htmlFor="link">Website ou Instagram (opcional)</label>
            <input id="link" name="link" type="text" placeholder="https://..." />

            <button className={styles.authBtn} type="submit" disabled={aGuardar}>
              {aGuardar ? 'A guardar...' : 'Guardar'}
            </button>
            {msg && <p className={styles.painelMsg}>{msg}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}

function ficheiroParaDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
