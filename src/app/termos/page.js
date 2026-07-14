import Link from 'next/link';
import styles from './termos.module.css';

export const metadata = {
  title: 'Termos e Condições · Cansado → Lendário',
};

export default function Termos() {
  return (
    <main className={styles.wrap}>
      <div className={styles.top}>
        <Link href="/" className={styles.brand}>CANSADO <span>→</span> LENDÁRIO</Link>
        <Link href="/registar" className={styles.voltar}>Registar código →</Link>
      </div>

      <article className={styles.doc}>
        <h1>Termos e Condições</h1>
        <p className={styles.sub}>Sorteio do veículo · Projecto «Cansado → Lendário»</p>
        <p className={styles.aviso}>
          Versão de rascunho, a rever por assessoria jurídica antes da publicação
          definitiva. Alguns pontos podem ser ajustados.
        </p>

        <h2>1. Organizador e aceitação</h2>
        <p>
          O presente sorteio (a «Promoção») é organizado pela Fuel Injection Technology,
          representada por Heike Pinto, com sede em Maputo, Moçambique (o «Organizador»).
          Contactos oficiais: heike.pinto@fuelinjectiontech.com · +258 84 30 30 504.
        </p>
        <p>
          A participação na Promoção implica o conhecimento e a aceitação integral e sem
          reservas destes Termos e Condições. Quem não concordar não deve participar.
        </p>

        <h2>2. Objecto — o prémio</h2>
        <p>
          O prémio consiste em um (1) veículo automóvel, um Mazda 3, restaurado e preparado
          no âmbito do projecto «Cansado → Lendário», entregue no estado em que for
          apresentado na revelação oficial.
        </p>
        <ul>
          <li>O prémio é pessoal e intransmissível até à entrega e não pode ser trocado por dinheiro ou por outro bem.</li>
          <li>O veículo é entregue com a documentação aplicável, cabendo ao vencedor os passos da Cláusula 8.</li>
          <li>O Organizador não presta qualquer garantia sobre o veículo para além do que resultar imperativamente da lei.</li>
        </ul>

        <h2>3. Período de participação e data do sorteio</h2>
        <p>
          O sorteio será realizado ao vivo durante o Fuel Injection Festival, no Autódromo
          Internacional de Maputo, em Novembro de 2026. A data exacta será anunciada pelos
          canais oficiais. O período de participação termina antes do sorteio, conforme
          anunciado.
        </p>

        <h2>4. Condições de elegibilidade</h2>
        <ul>
          <li>Ter idade igual ou superior a 18 anos à data da participação.</li>
          <li>Ser residente em Moçambique e possuir documento de identificação válido.</li>
          <li>Para conduzir o veículo poderá ser exigida carta de condução válida; a titularidade do prémio não depende de saber conduzir.</li>
          <li>Estão excluídos o Organizador, os patrocinadores e parceiros, os seus colaboradores e familiares directos.</li>
        </ul>

        <h2>5. Como participar — obtenção de entradas</h2>
        <p>
          Cada participante concorre através de «entradas», obtidas mediante compra nos
          pontos de venda aderentes: cada compra elegível gera um ou mais códigos únicos que
          atribuem entradas no sorteio.
        </p>
        <ul>
          <li>Cada código é único e de utilização única; não pode ser reutilizado.</li>
          <li>O Organizador poderá anular entradas obtidas por fraude, duplicação ou manipulação, com registo e auditoria por ponto de venda.</li>
          <li>Existe um limite de entradas por participante, associado ao contacto fornecido.</li>
        </ul>
        <p>
          Para participar são recolhidos dados pessoais (nome, contacto, data de nascimento
          e identificação) necessários à gestão do sorteio e à verificação do vencedor, nos
          termos da Cláusula 11.
        </p>

        <h2>6. Realização do sorteio</h2>
        <p>
          O apuramento do vencedor será feito por sorteio aleatório, realizado ao vivo e de
          forma transparente. Serão apurados um (1) vencedor e suplente(s), pela ordem de
          extracção, para os casos previstos na Cláusula 7.
        </p>

        <h2>7. Notificação e reclamação do prémio</h2>
        <ul>
          <li>O vencedor será anunciado no momento do sorteio e contactado pelos dados fornecidos.</li>
          <li>O prémio deve ser reclamado no prazo anunciado, com documento de identificação válido e comprovativo da entrada vencedora.</li>
          <li>Se o vencedor não for encontrado, não reclamar no prazo, não reunir as condições ou recusar o prémio, o Organizador poderá atribuí-lo ao suplente seguinte ou realizar nova extracção.</li>
        </ul>

        <h2>8. Entrega do prémio e encargos</h2>
        <ul>
          <li>A entrega ocorre após verificação da elegibilidade e assinatura de um Termo de Entrega e Aceitação.</li>
          <li>São da responsabilidade do vencedor a transferência de propriedade e respectivo registo, bem como taxas, impostos e seguro que por lei lhe caibam.</li>
          <li>O veículo é aceite «no estado em que se encontra» no momento da entrega.</li>
        </ul>

        <h2>9. Condições de posse do veículo</h2>
        <p>Ao aceitar o prémio, o vencedor aceita as seguintes condições, que visam proteger o projecto e os patrocinadores:</p>
        <p><strong>9.1 Manutenção da identidade visual.</strong> Manter no veículo, sem alteração ou remoção, a identidade visual do projecto e as marcas dos patrocinadores, por um período mínimo a definir a contar da entrega.</p>
        <p><strong>9.2 Período de não-alienação.</strong> Não vender, doar, trocar ou transmitir o veículo a terceiros durante um período a definir a contar da entrega.</p>
        <p><strong>9.3 Participação em conteúdos.</strong> Participar, de forma razoável, em conteúdos de divulgação da atribuição e entrega do prémio.</p>
        <p><strong>9.4 Uso do veículo.</strong> Não utilizar o veículo para fins ilícitos e mantê-lo em conservação razoável.</p>

        <h2>10. Direitos de imagem</h2>
        <p>
          O participante e, em especial, o vencedor autorizam o Organizador e os patrocinadores
          a utilizar o seu nome e imagem nas comunicações do projecto, dentro dos limites legais.
        </p>

        <h2>11. Protecção de dados pessoais</h2>
        <p>
          Os dados recolhidos são tratados exclusivamente para a gestão da Promoção e, mediante
          consentimento, para marketing do Organizador. São garantidos os direitos de acesso,
          correcção e eliminação, através dos contactos da Cláusula 1.
        </p>

        <h2>12. Limitação de responsabilidade</h2>
        <p>
          Após a transferência de propriedade e entrega, o Organizador não é responsável por
          factos, danos ou encargos relativos ao veículo, salvo o que resultar imperativamente
          da lei. O Organizador não responde por falhas técnicas ou casos de força maior.
        </p>

        <h2>13. Alterações, suspensão e cancelamento</h2>
        <p>
          O Organizador reserva-se o direito de alterar datas ou mecânicas, ou de suspender ou
          cancelar a Promoção, por motivo justificado, anunciando tais decisões pelos canais oficiais.
        </p>

        <h2>14. Disposições gerais</h2>
        <p>
          A participação implica a aceitação integral destes Termos. Se alguma cláusula for
          inválida, as restantes mantêm-se em vigor.
        </p>

        <h2>15. Lei aplicável e foro</h2>
        <p>
          A Promoção rege-se pela lei da República de Moçambique, sendo competente o foro da
          Comarca de Maputo, com renúncia a qualquer outro.
        </p>

        <p className={styles.rodape}>
          Cansado → Lendário · Termos e Condições do Sorteio · Fuel Injection Technology
        </p>
      </article>
    </main>
  );
}
