'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './parceiro.module.css';

export default function LoginParceiro() {
  const router = useRouter();
  const [estado, setEstado] = useState('idle');
  const [erro, setErro] = useState('');

  async function submeter(e) {
    e.preventDefault();
    setEstado('a-entrar');
    setErro('');
    const fd = new FormData(e.target);
    try {
      const r = await fetch('/api/parceiro/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), senha: fd.get('senha') }),
      });
      const data = await r.json();
      if (data.ok) {
        router.push('/parceiro/painel');
      } else {
        setErro(data.erro === 'credenciais_invalidas' ? 'Email ou senha errados.' : 'Não foi possível entrar.');
        setEstado('idle');
      }
    } catch {
      setErro('Sem ligação. Tenta de novo.');
      setEstado('idle');
    }
  }

  return (
    <main className={styles.authWrap}>
      <div className={styles.authCard}>
        <div className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</div>
        <h1 className={styles.authH1}>Portal do parceiro</h1>
        <p className={styles.authSub}>Entra para gerir os teus vouchers e ver os teus números.</p>

        <form onSubmit={submeter}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" required autoComplete="current-password" />
          <button className={styles.authBtn} type="submit" disabled={estado === 'a-entrar'}>
            {estado === 'a-entrar' ? 'A entrar...' : 'Entrar'}
          </button>
          {erro && <p className={styles.authErr}>{erro}</p>}
        </form>

        <Link href="/" className={styles.voltar}>← voltar ao site</Link>
      </div>
    </main>
  );
}
