'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function PainelAdmin() {
  const router = useRouter();
  const [dados, setDados] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [participantes, setParticipantes] = useState(null);
  const [sorteio, setSorteio] = useState(null);
  const [aSortear, setASortear] = useState(false);
  const [msgSorteio, setMsgSorteio] = useState('');
  const [aDar, setADar] = useState(null); // id do parceiro a receber lote
  const [msgLote, setMsgLote] = useState('');

  async function carregar() {
    const [r1, r2, r3, r4, r5] = await Promise.all([
      fetch('/api/admin/resumo').then((r) => r.json()),
      fetch('/api/admin/alertas').then((r) => r.json()),
      fetch('/api/admin/lotes').then((r) => r.json()),
      fetch('/api/admin/participantes').then((r) => r.json()),
      fetch('/api/admin/sorteio').then((r) => r.json()),
    ]);
    if (r1.ok) setDados(r1);
    if (r2.ok) setAlertas(r2.alertas);
    if (r3.ok) setLotes(r3.parceiros);
    if (r4.ok) setParticipantes(r4);
    if (r5.ok) setSorteio(r5.sorteio);
  }

  // Acções do sorteio. São irreversíveis — por isso pedem confirmação escrita.
  async function accaoSorteio(accao) {
    const perguntas = {
      fechar: 'FECHAR o sorteio?\n\nA lista de bilhetes fica congelada e não entram mais registos neste sorteio. Escreve FECHAR para confirmar:',
      sortear: 'CORRER O SORTEIO?\n\nIsto extrai o vencedor e os suplentes. Não tem volta atrás. Escreve SORTEAR para confirmar:',
    };
    const esperado = accao.toUpperCase();
    const resposta = window.prompt(perguntas[accao]);
    if (resposta !== esperado) { setMsgSorteio('Cancelado.'); return; }

    setASortear(true);
    setMsgSorteio('');
    try {
      const r = await fetch('/api/admin/sorteio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accao }),
      });
      const d = await r.json();
      if (d.ok) {
        setMsgSorteio(accao === 'fechar'
          ? `✓ Sorteio fechado com ${d.total_entradas} bilhetes. O compromisso está publicado em /live.`
          : `✓ Sorteio realizado. Vencedor: ${d.resultados[0].bilhete}`);
        await carregar();
      } else {
        const erros = {
          ja_fechado: 'O sorteio já está fechado.',
          nao_fechado: 'Tens de fechar o sorteio antes de o correr.',
          sem_entradas: 'Não há entradas para sortear.',
          lista_alterada: 'ATENÇÃO: a lista de bilhetes mudou desde o fecho. O sorteio não corre. Contacta o suporte.',
        };
        setMsgSorteio(erros[d.erro] || 'Não foi possível.');
      }
    } catch {
      setMsgSorteio('Sem ligação.');
    }
    setASortear(false);
  }

  useEffect(() => { carregar(); }, []);

  async function darLote(parceiroId, quantidade) {
    setADar(parceiroId);
    setMsgLote('');
    try {
      const r = await fetch('/api/admin/lotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parceiroId, quantidade }),
      });
      const d = await r.json();
      if (d.ok) {
        setMsgLote(`✓ ${d.criados} vouchers dados.`);
        const r3 = await fetch('/api/admin/lotes').then((x) => x.json());
        if (r3.ok) setLotes(r3.parceiros);
      } else {
        setMsgLote('Não foi possível criar o lote.');
      }
    } catch {
      setMsgLote('Sem ligação.');
    }
    setADar(null);
  }

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

        {/* o sorteio */}
        <section className={styles.bloco}>
          <h2>O sorteio</h2>
          {!sorteio || sorteio.estado === 'aberto' ? (
            <>
              <p className={styles.nota}>
                O sorteio está <strong>aberto</strong> — ainda entram registos. Quando
                fechares, a lista de bilhetes congela e publica-se o compromisso público
                (ninguém, nem tu, consegue saber o vencedor antes da extracção).
                <br />Fecha só quando o período de participação terminar.
              </p>
              <button onClick={() => accaoSorteio('fechar')} disabled={aSortear} className={styles.btnPerigo}>
                Fechar o sorteio
              </button>
            </>
          ) : sorteio.estado === 'fechado' ? (
            <>
              <p className={styles.nota}>
                Lista <strong>fechada</strong> com {sorteio.total_entradas} bilhetes. O
                compromisso está publicado em <a href="/live" target="_blank" rel="noreferrer">/live</a>.
                Corre o sorteio no momento da cerimónia — a página /live revela sozinha.
              </p>
              <div className={styles.hashesAdmin}>
                <div><span>Lista</span><code>{sorteio.lista_hash?.slice(0, 16)}…</code></div>
                <div><span>Semente selada</span><code>{sorteio.semente_hash?.slice(0, 16)}…</code></div>
              </div>
              <button onClick={() => accaoSorteio('sortear')} disabled={aSortear} className={styles.btnSortear}>
                {aSortear ? 'A sortear…' : 'CORRER O SORTEIO'}
              </button>
            </>
          ) : (
            <>
              <p className={styles.nota}>
                Sorteio <strong>realizado</strong> em {new Date(sorteio.sorteado_em).toLocaleString('pt-PT')}.
                O resultado e a semente estão públicos em <a href="/live" target="_blank" rel="noreferrer">/live</a>.
              </p>
              <table className={styles.tabela}>
                <thead><tr><th>Posição</th><th>Bilhete</th><th>Nome</th></tr></thead>
                <tbody>
                  {sorteio.resultados?.map((r) => (
                    <tr key={r.posicao}>
                      <td>{r.posicao === 0 ? <strong>Vencedor</strong> : `${r.posicao}.º suplente`}</td>
                      <td>{r.bilhete}</td>
                      <td>{r.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {msgSorteio && <p className={styles.painelMsg}>{msgSorteio}</p>}
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

        {/* dar vouchers a parceiros */}
        <section className={styles.bloco}>
          <h2>Dar vouchers a parceiros</h2>
          <p className={styles.nota}>
            Aprova um lote de vouchers para um parceiro. Ele emite-os no balcão à
            medida das vendas. Quando o lote esgotar, dás mais.
          </p>
          {msgLote && <p className={styles.painelMsg} style={{ color: 'var(--olive-d)' }}>{msgLote}</p>}
          <table className={styles.tabela}>
            <thead>
              <tr><th>Parceiro</th><th>Total dado</th><th>Por emitir</th><th>Dar mais</th></tr>
            </thead>
            <tbody>
              {lotes.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome} {p.estado !== 'activo' && <em className={styles.inativo}>({p.estado})</em>}</td>
                  <td>{p.total_aprovado}</td>
                  <td><strong>{p.por_emitir}</strong></td>
                  <td>
                    <div className={styles.darBotoes}>
                      {[50, 100, 200].map((q) => (
                        <button key={q} onClick={() => darLote(p.id, q)} disabled={aDar === p.id} className={styles.darBtn}>
                          +{q}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

        {/* registos por parceiro (de onde vêm) */}
        {participantes && participantes.por_parceiro.length > 0 && (
          <section className={styles.bloco}>
            <h2>Registos por parceiro</h2>
            <p className={styles.nota}>
              De onde vêm os participantes: quantas entradas e quantas pessoas
              distintas cada loja gerou. {participantes.consentimento && (
                <>Do total de {participantes.consentimento.total} participantes,{' '}
                {participantes.consentimento.com_marketing} aceitaram receber novidades.</>
              )}
            </p>
            <table className={styles.tabela}>
              <thead><tr><th>Parceiro</th><th>Entradas</th><th>Pessoas</th></tr></thead>
              <tbody>
                {participantes.por_parceiro.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.entradas}</td>
                    <td>{p.pessoas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

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
