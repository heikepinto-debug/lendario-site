'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function LoginAdmin() {
  const router = useRouter();
  const [estado, setEstado] = useState('idle');
  const [erro, setErro] = useState('');

  async function submeter(e) {
    e.preventDefault();
    setEstado('a-entrar');
    setErro('');
    const fd = new FormData(e.target);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), senha: fd.get('senha') }),
      });
      const data = await r.json();
      if (data.ok) router.push('/admin/painel');
      else { setErro('Email ou senha errados.'); setEstado('idle'); }
    } catch {
      setErro('Sem ligação. Tenta de novo.');
      setEstado('idle');
    }
  }

  return (
    <main className={styles.authWrap}>
      <div className={styles.authCard}>
        <div className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</div>
        <div className={styles.adminTag}>ADMINISTRAÇÃO</div>
        <form onSubmit={submeter}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" required autoComplete="current-password" />
          <button className={styles.btn} type="submit" disabled={estado === 'a-entrar'}>
            {estado === 'a-entrar' ? 'A entrar...' : 'Entrar'}
          </button>
          {erro && <p className={styles.err}>{erro}</p>}
        </form>
      </div>
    </main>
  );
}
