import Link from 'next/link';
import styles from './page.module.css';
import { listarEpisodios } from '@/lib/youtube';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function obterParceiros() {
  try {
    const r = await query(
      "SELECT nome, logo_url, categoria FROM parceiro WHERE estado = 'activo' ORDER BY nome"
    );
    return r.rows;
  } catch {
    return null;
  }
}

async function obterEpisodios() {
  try {
    const eps = await listarEpisodios(4);
    if (!eps.length) return null;
    return eps.map((e, i) => ({
      etiqueta: `EP ${String(eps.length - i).padStart(2, '0')}`,
      titulo: e.titulo,
      url: `https://youtube.com/watch?v=${e.video_id}&list=PLWk5WB1OBQXA`,
      estado: i === 0 ? 'novo' : 'no ar',
    }));
  } catch {
    return null;
  }
}

// Mostra o logótipo do parceiro se ele já o carregou; senão, o nome.
function Logo({ nome, tamanho, db }) {
  const cls = `${styles.logo} ${styles[tamanho]}`;
  const p = db && db.find((x) => x.nome.toLowerCase() === nome.toLowerCase());
  if (p && p.logo_url) {
    return (
      <div className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.logo_url} alt={nome} className={styles.logoImg} />
      </div>
    );
  }
  return <div className={cls}>{nome}</div>;
}

export default async function Home() {
  const episodios = await obterEpisodios();
  const parceirosDb = await obterParceiros();
  return (
    <main>
      <div className={styles.wrap}>
        <header className={styles.top}>
          <div className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</div>
          <nav className={styles.nav}>
            <a href="#como">Como participar</a>
            <a href="#onde">Onde comprar</a>
            <a href="#parceiros">Parceiros</a>
          </nav>
        </header>

        <section className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>O carro existe. Falta o dono.</div>
            <h1 className={styles.h1}>
              Ganha o<br /><em>Lendário</em>.<br />
              <span className={styles.arrow}>↓</span> Podes ser tu.
            </h1>
            <p className={styles.lede}>
              Um Mazda 3 cansado, reconstruído do zero e filmado episódio a episódio
              desde Junho. A 8 de Novembro é sorteado ao vivo, no Autódromo Internacional
              de Maputo. Compra num parceiro, regista o teu código, e o carro pode ser teu.
            </p>
            <div className={styles.cta}>
              <Link href="/registar" className={`${styles.btn} ${styles.btn1}`}>Registar código do sorteio</Link>
              <a href="#onde" className={`${styles.btn} ${styles.btn2}`}>Onde comprar</a>
            </div>
            <p className={styles.sep}>
              A entrada no sorteio é gratuita com a tua compra nos parceiros.
              O bilhete do Fuel Injection Festival é vendido à parte.
            </p>
          </div>

          <div>
            <figure className={styles.shot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/carro.webp" alt="O carro do projecto, num estaleiro em Maputo" />
              <figcaption>
                <b>Mazda 3 · 2008 · sedan · caixa manual</b>
                <span>Em transformação desde Junho. Sorteado a 8 de Novembro.</span>
              </figcaption>
            </figure>

            <div className={styles.eps}>
              <div className={styles.eh}>
                <h3>Acompanha a transformação</h3>
                <a href="https://youtube.com/playlist?list=PLWk5WB1OBQXA" target="_blank" rel="noreferrer">Ver episódios →</a>
              </div>
              <ol className={styles.epsList}>
                {episodios ? (
                  episodios.map((e) => (
                    <li key={e.etiqueta}>
                      <i>{e.etiqueta}</i>
                      <span><a href={e.url} target="_blank" rel="noreferrer">{e.titulo}</a></span>
                      <em>{e.estado}</em>
                    </li>
                  ))
                ) : (
                  <>
                    <li><i>EP 02</i><span>Dyno: os números do motor antes de tudo</span><em>em produção</em></li>
                    <li><i>EP 01</i><span>O carro cansado: primeiro contacto</span><em>no ar</em></li>
                  </>
                )}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.steps} id="como">
          <div className={styles.step}>
            <div className={styles.k}>PASSO 01</div>
            <h4>Compra num parceiro</h4>
            <p>A partir de 2.500 MZN, em qualquer parceiro. O mesmo valor em todos.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.k}>PASSO 02</div>
            <h4>Regista o código</h4>
            <p>Lê o QR do voucher, toca no link, ou escreve o código. Leva trinta segundos.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.k}>PASSO 03</div>
            <h4>Estás a concorrer</h4>
            <p>Recebes o teu bilhete com um número único. Vê-lo-ás no ecrã se ganhares.</p>
          </div>
        </section>

        <section className={styles.pv} id="onde">
          <h2>Onde comprar para ganhar</h2>
          <p className={styles.pvsub}>
            Qualquer compra a partir de <b>2.500 MZN</b> dá-te um voucher.
            O mesmo valor em todos os parceiros.
          </p>
          <div className={styles.shops}>
            <div className={styles.shop}>
              <div className={styles.nm}>Fuel Injection</div>
              <div className={styles.ct}>Oficina e performance · Maputo</div>
            </div>
            <div className={styles.shop}>
              <div className={styles.nm}>The Shine</div>
              <div className={styles.ct}>Detailing · Maputo</div>
            </div>
          </div>

          <table className={styles.tiers}>
            <caption>Quanto gastas, quantas entradas levas</caption>
            <tbody>
              <tr><th>Factura</th><th>Entradas</th></tr>
              <tr><td>2.500 – 9.999 MZN</td><td><b>1</b></td></tr>
              <tr><td>10.000 – 24.999 MZN</td><td><b>3</b></td></tr>
              <tr><td>25.000 MZN ou mais</td><td><b>5</b></td></tr>
            </tbody>
          </table>
          <p className={styles.fine}>
            O tecto é de cinco entradas por factura. Ganhar não depende de gastar mais — depende de participar.
          </p>
        </section>

        <section className={styles.sp} id="parceiros">
          <div className={styles.spHead}>
            <h2>Quem torna isto possível</h2>
            <p>Marcas que entraram no projecto e o carregam até 8 de Novembro.</p>
          </div>
          <div className={styles.tier}>
            <div className={styles.tl}>Co-Sponsor</div>
            <div className={styles.logos}>
              <Logo nome="Fuel Injection" tamanho="lg" db={parceirosDb} />
            </div>
          </div>
          <div className={styles.tier}>
            <div className={styles.tl}>Patrocinador</div>
            <div className={styles.logos}>
              <Logo nome="ELTEL" tamanho="md" db={parceirosDb} />
              <Logo nome="JPS Transportes" tamanho="md" db={parceirosDb} />
            </div>
          </div>
          <div className={styles.tier}>
            <div className={styles.tl}>Parceiro Oficial</div>
            <div className={styles.logos}>
              <Logo nome="Galp" tamanho="sm" db={parceirosDb} />
              <Logo nome="The Shine" tamanho="sm" db={parceirosDb} />
            </div>
          </div>
          <a className={styles.join} href="mailto:heike.pinto@fuelinjectiontech.com">
            <span>Torna-te parceiro do Lendário</span><b>→</b>
          </a>
        </section>

        <footer className={styles.footer}>
          <div className={styles.brand} style={{ marginBottom: 14 }}>CANSADO <span>→</span> LENDÁRIO</div>
          A entrada no sorteio é gratuita com a tua compra nos parceiros. O bilhete do Fuel Injection Festival é vendido à parte.<br />
          FIT Racing Team · Fuel Injection Technology · Sorteio a 8 de Novembro de 2026, Autódromo Internacional de Maputo.
        </footer>
      </div>
    </main>
  );
}
