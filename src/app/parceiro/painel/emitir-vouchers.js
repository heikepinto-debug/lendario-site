'use client';

import { useState } from 'react';
import styles from '../parceiro.module.css';

export default function EmitirVouchers({ onEmitido }) {
  const [valor, setValor] = useState('');
  const [factura, setFactura] = useState('');
  const [atendente, setAtendente] = useState('');
  const [previsao, setPrevisao] = useState(null);
  const [aEmitir, setAEmitir] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState(null);

  // calculadora ao vivo: quando muda o valor, pergunta ao servidor quantos vouchers
  async function calcular(v) {
    setValor(v);
    setResultado(null);
    setErro('');
    const n = Number(v);
    if (!n || n < 2500) { setPrevisao(null); return; }
    try {
      const r = await fetch(`/api/parceiro/emitir?valor=${n}`);
      const d = await r.json();
      if (d.ok) setPrevisao(d.vouchers);
    } catch { setPrevisao(null); }
  }

  async function emitir() {
    setAEmitir(true);
    setErro('');
    setResultado(null);
    try {
      const r = await fetch('/api/parceiro/emitir', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ valorFactura: Number(valor), facturaRef: factura, atendente }),
      });
      const d = await r.json();
      if (d.ok) {
        setResultado(d);
        setValor(''); setFactura(''); setPrevisao(null);
        if (onEmitido) onEmitido();
      } else {
        const erros = {
          abaixo_minimo: 'A compra tem de ser de pelo menos 2.500 MZN.',
          lote_esgotado: `Só restam ${d.disponiveis} vouchers no teu lote (precisas de ${d.pedidos}). Fala com a organização para receberes mais.`,
          valor_invalido: 'Valor inválido.',
        };
        setErro(erros[d.erro] || 'Não foi possível emitir.');
      }
    } catch {
      setErro('Sem ligação. Tenta de novo.');
    }
    setAEmitir(false);
  }

  function descarregarPdf() {
    if (!resultado?.pdf_base64) return;
    const bytes = atob(resultado.pdf_base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-lendario-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={styles.emitir}>
      <h2>Emitir vouchers</h2>
      <p className={styles.emitirSub}>
        Mete o valor da compra. O sistema calcula quantos vouchers dar e gera-os
        em PDF para imprimires ou enviares ao cliente.
      </p>

      {!resultado && (
        <>
          <label htmlFor="valor">Valor da compra (MZN)</label>
          <input
            id="valor" type="number" inputMode="numeric" value={valor}
            onChange={(e) => calcular(e.target.value)} placeholder="Ex.: 12000"
          />
          {previsao !== null && (
            <div className={styles.previsao}>
              Esta compra dá <strong>{previsao} {previsao === 1 ? 'voucher' : 'vouchers'}</strong>
            </div>
          )}

          <label htmlFor="factura">Nº de factura ou descrição do serviço</label>
          <input
            id="factura" type="text" value={factura}
            onChange={(e) => setFactura(e.target.value)}
            placeholder="Ex.: FT 2026/0451 — remap Stage 1"
          />

          <label htmlFor="atendente">Quem está a atender (opcional)</label>
          <input
            id="atendente" type="text" value={atendente}
            onChange={(e) => setAtendente(e.target.value)} placeholder="Nome do atendente"
          />

          <button className={styles.btnEmitir} onClick={emitir} disabled={aEmitir || !previsao}>
            {aEmitir ? 'A emitir...' : previsao ? `Emitir ${previsao} ${previsao === 1 ? 'voucher' : 'vouchers'}` : 'Mete o valor primeiro'}
          </button>
          {erro && <p className={styles.emitirErro}>{erro}</p>}
        </>
      )}

      {resultado && (
        <div className={styles.emitirOk}>
          <div className={styles.emitirOkTitulo}>
            ✓ {resultado.n_vouchers} {resultado.n_vouchers === 1 ? 'voucher emitido' : 'vouchers emitidos'}
          </div>
          <p>Descarrega o PDF e imprime ou envia ao cliente.</p>
          <div className={styles.emitirAccoes}>
            <button className={styles.btnEmitir} onClick={descarregarPdf}>Descarregar PDF</button>
            <button className={styles.btnNovo} onClick={() => setResultado(null)}>Nova emissão</button>
          </div>
          <p className={styles.restante}>Restam {resultado.restante_lote} vouchers no teu lote.</p>
        </div>
      )}
    </section>
  );
}
