'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function PainelAdmin() {
  const router = useRouter();
  const [dados, setDados] = useState(null);
  const [alertas, setAlertas] = useState([]);

  async function carregar() {
    const [r1, r2] = await Promise.all([
      fetch('/api/admin/resumo').then((r) => r.json()),
      fetch('/api/admin/alertas').then((r) => r.json()),
    ]);
    if (r1.ok) setDados(r1);
    if (r2.ok) setAlertas(r2.alertas);
  }

  useEffect(() => { carregar(); }, []);

  async function sair() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function resolverAlerta(id) {
    await fetch('/api/admin/alertas', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setAlertas((a) => a.filter((x) => x.id !== id));
  }

  if (!dados) {
    return <main className={styles.painel}><div className={styles.painelWrap}><p>A carregar…</p></div></main>;
  }

  const t = dados.totais;

  return (
    <main className={styles.painel}>
      <header className={styles.painelTop}>
        <div>
          <span className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</span>
          <span className={styles.adminTag} style={{ marginLeft: 12 }}>ADMIN</span>
        </div>
        <button onClick={sair} className={styles.sair}>Sair</button>
      </header>

      <div className={styles.painelWrap}>
        {/* totais */}
        <section className={styles.cards}>
          <div className={styles.card}><div className={styles.cardN}>{t.entradas}</div><div className={styles.cardL}>Entradas no sorteio</div></div>
          <div className={styles.card}><div className={styles.cardN}>{t.participantes}</div><div className={styles.cardL}>Participantes</div></div>
          <div className={styles.card}><div className={styles.cardN}>{t.parceiros_activos}</div><div className={styles.cardL}>Parceiros activos</div></div>
          <div className={`${styles.card} ${t.alertas_abertos > 0 ? styles.cardAlerta : ''}`}>
            <div className={styles.cardN}>{t.alertas_abertos}</div><div className={styles.cardL}>Alertas por rever</div>
          </div>
        </section>

        {/* exportar */}
        <section className={styles.bloco}>
          <div className={styles.blocoHead}>
            <h2>Salvaguarda do sorteio</h2>
            <a href="/api/admin/exportar" className={styles.btnExport}>Descarregar entradas (CSV)</a>
          </div>
          <p className={styles.nota}>
            Descarrega todas as entradas. Guarda este ficheiro antes do sorteio — com ele,
            o sorteio pode correr mesmo sem internet no dia.
          </p>
        </section>

        {/* alertas */}
        {alertas.length > 0 && (
          <section className={styles.bloco}>
            <h2>Alertas por rever</h2>
            <div className={styles.alertas}>
              {alertas.map((al) => (
                <div key={al.id} className={styles.alerta}>
                  <div>
                    <span className={styles.alertaTipo}>{rotuloTipo(al.tipo)}</span>
                    <span className={styles.alertaNome}>{al.nome || al.entidade_id}</span>
                    {al.detalhe?.entradas && <span className={styles.alertaDet}>{al.detalhe.entradas} entradas</span>}
                  </div>
                  <button onClick={() => resolverAlerta(al.id)} className={styles.resolver}>Marcar visto</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* parceiros com métricas de fraude */}
        <section className={styles.bloco}>
          <h2>Parceiros</h2>
          <p className={styles.nota}>
            A <strong>taxa de activação</strong> é a percentagem de vouchers emitidos que
            foram mesmo registados por pessoas. Uma taxa muito baixa com muitos vouchers
            emitidos pode indicar vouchers distribuídos sem venda real.
          </p>
          <table className={styles.tabela}>
            <thead>
              <tr><th>Parceiro</th><th>Emitidos</th><th>Activados</th><th>Entradas</th><th>Taxa</th></tr>
            </thead>
            <tbody>
              {dados.parceiros.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome} {p.estado !== 'activo' && <em className={styles.inativo}>({p.estado})</em>}</td>
                  <td>{p.emitidos}</td>
                  <td>{p.activados}</td>
                  <td>{p.entradas}</td>
                  <td>
                    {p.taxa_activacao === null ? '—' : (
                      <span className={p.emitidos >= 50 && p.taxa_activacao < 15 ? styles.taxaMa : ''}>
                        {p.taxa_activacao}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* top pessoas */}
        {dados.top_pessoas.length > 0 && (
          <section className={styles.bloco}>
            <h2>Quem tem mais entradas</h2>
            <table className={styles.tabela}>
              <thead><tr><th>Pessoa</th><th>Telefone</th><th>Entradas</th></tr></thead>
              <tbody>
                {dados.top_pessoas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>···{p.tel_fim}</td>
                    <td><strong>{p.entradas}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}

function rotuloTipo(tipo) {
  const m = {
    tecto_pessoa: 'Muitas entradas',
    baixa_activacao: 'Activação baixa',
    emissao_rapida: 'Emissão rápida',
  };
  return m[tipo] || tipo;
}
