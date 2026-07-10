'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './registar.module.css';

const ERROS = {
  codigo_invalido: 'Esse código não parece válido. Confere as letras e tenta de novo.',
  codigo_inexistente: 'Não encontrámos esse código. Confere se o escreveste bem.',
  codigo_ja_usado: 'Este código já foi usado. Cada voucher só serve uma vez.',
  parceiro_inactivo: 'Este parceiro ainda não está activo. Fala connosco.',
  email_em_uso: 'Este email já está registado com outro número. Usa outro email.',
  email_invalido: 'Esse email não parece válido.',
  telefone_invalido: 'Esse número não parece um número moçambicano válido.',
  nome_invalido: 'Escreve o teu nome completo.',
  sem_consentimento: 'Precisas de aceitar os termos para concorrer.',
  fora_do_periodo: 'O período de registo já terminou.',
  erro_interno: 'Algo correu mal do nosso lado. Tenta daqui a pouco.',
};

function Form() {
  const params = useSearchParams();
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState('idle'); // idle | a-enviar | ok | erro
  const [bilhete, setBilhete] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    const c = params.get('c');
    if (c) setCodigo(c.toUpperCase());
  }, [params]);

  async function submeter(e) {
    e.preventDefault();
    setEstado('a-enviar');
    setErro('');
    const fd = new FormData(e.target);
    const payload = {
      codigo: codigo.trim(),
      nome: fd.get('nome').trim(),
      email: fd.get('email').trim(),
      telefone: fd.get('telefone').trim(),
      consent_sorteio: fd.get('consent') === 'on',
      optin_marketing: fd.get('optin') === 'on',
      via: 'manual',
    };
    try {
      const r = await fetch('/api/registar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (r.status === 201 && data.ok) {
        setBilhete(data.bilhete);
        setEstado('ok');
      } else {
        setErro(ERROS[data.erro] || 'Não foi possível registar. Tenta de novo.');
        setEstado('erro');
      }
    } catch {
      setErro('Sem ligação. Confere a internet e tenta de novo.');
      setEstado('erro');
    }
  }

  if (estado === 'ok') {
    return (
      <div className={`${styles.msg} ${styles.ok}`} role="status">
        Estás a concorrer! O teu bilhete é:
        <span className={styles.tk}>{bilhete}</span>
        Guarda este número. Vais vê-lo no ecrã se fores o vencedor a 8 de Novembro.
        {' '}<strong>Isto não é bilhete do festival</strong> — esse compra-se à parte.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submeter} autoComplete="on">
        <label htmlFor="codigo">Código do voucher</label>
        <input
          id="codigo" name="codigo" className={styles.code} type="text"
          placeholder="FIT-FI-XXXXXXX" required
          value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        />
        <div className={styles.hint}>Está no teu voucher, por baixo do QR.</div>

        <label htmlFor="nome">Nome completo</label>
        <input id="nome" name="nome" type="text" placeholder="O teu nome" required autoComplete="name" />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="tu@exemplo.com" required autoComplete="email" />
        <div className={styles.hint}>É por aqui que confirmas as tuas entradas.</div>

        <label htmlFor="telefone">Telefone</label>
        <input id="telefone" name="telefone" type="tel" placeholder="84 000 0000" required autoComplete="tel" />
        <div className={styles.hint}>É por aqui que te contactamos se ganhares.</div>

        <label className={styles.check}>
          <input name="consent" type="checkbox" required />
          <span>Aceito os termos do sorteio e autorizo o uso dos meus dados para a sua gestão.</span>
        </label>
        <label className={styles.check}>
          <input name="optin" type="checkbox" />
          <span className={styles.opt}>Quero receber novidades da FIT e dos parceiros do Lendário. (opcional)</span>
        </label>

        <button className={styles.btn} type="submit" disabled={estado === 'a-enviar'}>
          {estado === 'a-enviar' ? 'A registar...' : 'Registar e concorrer'}
        </button>

        <p className={styles.sep}>
          A entrada no sorteio é gratuita com a tua compra nos parceiros.
          O bilhete do Fuel Injection Festival é vendido à parte.
        </p>
      </form>

      {estado === 'erro' && (
        <div className={`${styles.msg} ${styles.err}`} role="status">{erro}</div>
      )}
    </>
  );
}

export default function RegistarPage() {
  return (
    <main>
      <div className={styles.wrap}>
        <div className={styles.top}>
          <div className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</div>
          <Link href="/">← voltar</Link>
        </div>
        <h1 className={styles.h1}>Regista o teu código</h1>
        <p className={styles.sub}>
          Tens um voucher de um parceiro? Regista-o aqui e ficas a concorrer ao Lendário.
          Leva trinta segundos.
        </p>
        <Suspense fallback={<p>A carregar…</p>}>
          <Form />
        </Suspense>
      </div>
    </main>
  );
}
