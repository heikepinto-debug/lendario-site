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

        <h2>1. Organizador e aceitação</h2>
        <p>
          O presente sorteio (a «Promoção») é organizado pela Fuel Injection Technology,
          representada por Heike Pinto, com sede em Maputo, Moçambique (o «Organizador»).
          Contactos oficiais: heike.pinto@fuelinjectiontech.com · +258 84 30 30 504 ·
          lendario.fuelinjectiontech.com.
        </p>
        <p>
          A participação na Promoção implica o conhecimento e a aceitação integral e sem
          reservas destes Termos e Condições. Quem não concordar não deve participar.
        </p>

        <h2>2. Objecto — o prémio</h2>
        <p>
          O prémio consiste em um (1) veículo automóvel, um Mazda 3, restaurado e preparado
          no âmbito do projecto «Cansado → Lendário».
        </p>
        <p>
          <strong>O veículo é entregue «no estado em que se encontra», sem qualquer garantia,
          expressa ou implícita, de espécie alguma.</strong> Ao aceitar o prémio, o vencedor
          reconhece e aceita o veículo no seu estado à data da entrega, incluindo eventuais
          defeitos, desgaste ou necessidades de manutenção, presentes ou futuros. O Organizador
          não presta qualquer garantia de bom funcionamento, durabilidade ou aptidão para
          qualquer fim, para além do que resultar imperativamente da lei aplicável.
        </p>
        <ul>
          <li>O prémio é pessoal e intransmissível até à entrega e não pode ser trocado por dinheiro ou por qualquer outro bem.</li>
          <li>Não há qualquer prémio alternativo, substituto ou compensação em dinheiro.</li>
        </ul>

        <h2>3. Período de participação e data do sorteio</h2>
        <p>
          O período de participação decorre desde a abertura dos registos até ao encerramento
          anunciado, na véspera do sorteio. O sorteio será realizado ao vivo durante o Fuel
          Injection Festival, no Autódromo Internacional de Maputo, em Novembro de 2026. A
          data exacta do sorteio será anunciada pelos canais oficiais do projecto.
        </p>

        <h2>4. Condições de elegibilidade</h2>
        <p>Podem participar as pessoas que, cumulativamente:</p>
        <ul>
          <li>Tenham idade igual ou superior a 18 anos à data da participação;</li>
          <li>Sejam residentes em Moçambique e possuam documento de identificação válido;</li>
          <li>Aceitem integralmente os presentes Termos e Condições.</li>
        </ul>
        <p>
          Para conduzir o veículo poderá ser exigida carta de condução válida; a titularidade
          do prémio não depende de saber conduzir. Estão excluídos de participar o Organizador,
          os patrocinadores e parceiros da Promoção, os seus colaboradores, bem como os
          respectivos cônjuges, ascendentes, descendentes e irmãos, de forma a garantir a
          idoneidade da Promoção.
        </p>

        <h2>5. Como participar — obtenção de entradas</h2>
        <p>
          Cada participante concorre através de «entradas» no sorteio, obtidas mediante compra
          nos pontos de venda aderentes, cuja lista actualizada é divulgada na plataforma
          oficial. Cada compra elegível, a partir do valor mínimo anunciado, gera um ou mais
          códigos únicos, de acordo com a tabela de escalões divulgada. Cada código atribui
          uma entrada no sorteio.
        </p>
        <ul>
          <li>Cada código é único e de utilização única; não pode ser reutilizado nem transferido após registo.</li>
          <li>O registo de um código é feito na plataforma oficial, mediante os dados exigidos, e fica concluído com a emissão do respectivo bilhete.</li>
          <li>Existe um limite de trinta (30) entradas por participante, associado ao contacto e identificação fornecidos.</li>
          <li>Consideram-se elegíveis as compras efectivamente pagas e não reembolsadas. Compras anuladas, devolvidas ou reembolsadas não conferem entradas, podendo as entradas correspondentes ser anuladas.</li>
          <li>O Organizador poderá anular entradas obtidas por fraude, duplicação, manipulação ou incumprimento destas regras, mantendo registo e auditoria por ponto de venda.</li>
        </ul>
        <p>
          Para participar são recolhidos os dados pessoais (nome, contacto, data de nascimento
          e identificação) necessários à gestão do sorteio e à verificação do vencedor, nos
          termos da Cláusula 11.
        </p>

        <h2>6. Realização do sorteio</h2>
        <p>
          O apuramento do vencedor será feito por sorteio aleatório, realizado ao vivo e de
          forma pública e transparente, através da plataforma oficial do projecto, que gera
          o resultado de forma aleatória e mantém registo auditável da extracção. Serão
          apurados um (1) vencedor e três (3) suplentes, pela ordem de extracção, para os
          casos previstos na Cláusula 7.
        </p>

        <h2>7. Notificação e reclamação do prémio</h2>
        <ul>
          <li>O vencedor será anunciado no momento do sorteio e contactado através dos dados fornecidos no registo, por telefone e/ou email, em tentativas e prazo razoáveis a comunicar no momento do sorteio.</li>
          <li>O prémio deve ser reclamado no prazo de trinta (30) dias a contar da notificação, mediante apresentação de documento de identificação válido e do comprovativo da entrada vencedora.</li>
          <li>Se o vencedor não for contactável pelos meios fornecidos dentro do prazo, não reclamar dentro do prazo, não reunir as condições de elegibilidade ou recusar o prémio, o Organizador atribuirá o prémio ao suplente seguinte, pela ordem de extracção. Esgotados os suplentes, o Organizador decidirá o destino do prémio.</li>
        </ul>

        <h2>8. Entrega do prémio e encargos</h2>
        <ul>
          <li>A entrega ocorre após verificação da elegibilidade e assinatura de um Termo de Entrega e Aceitação que reproduz estas condições.</li>
          <li>O Organizador entrega o veículo acompanhado da documentação de transferência de propriedade devidamente preenchida a favor do vencedor. Cabe ao vencedor apenas submeter essa documentação às autoridades competentes e suportar as taxas, emolumentos e impostos oficiais dessa submissão e registo.</li>
          <li>O seguro do veículo, após a entrega, é da responsabilidade do vencedor.</li>
          <li>O veículo é aceite «no estado em que se encontra» no momento da entrega, nos termos da Cláusula 2.</li>
        </ul>

        <h2>9. Condições de posse do veículo</h2>
        <p>
          A atribuição do prémio está sujeita às condições seguintes, que integram o Termo de
          Entrega e Aceitação e visam proteger o projecto e os patrocinadores. Ao aceitar o
          prémio, o vencedor assume-as como condições firmes da entrega:
        </p>
        <p>
          <strong>9.1 Manutenção do livery e identidade visual.</strong> O vencedor mantém no
          veículo, sem alteração, remoção ou ocultação, a identidade visual do projecto e as
          marcas dos patrocinadores, durante um período mínimo de seis (6) meses a contar da
          data de entrega. Danos acidentais ao livery devem ser comunicados ao Organizador
          para reposição.
        </p>
        <p>
          <strong>9.2 Período de não-alienação.</strong> O vencedor não vende, doa, troca,
          onera nem por qualquer forma transmite o veículo a terceiros durante um período de
          seis (6) meses a contar da data de entrega.
        </p>
        <p>
          <strong>9.3 Participação em conteúdos de divulgação.</strong> O vencedor participa,
          de forma razoável, em conteúdos de divulgação relacionados com a atribuição e entrega
          do prémio (fotografia e vídeo), bem como em conteúdos de acompanhamento durante o
          período de manutenção do livery referido em 9.1.
        </p>
        <p>
          <strong>9.4 Uso do veículo.</strong> O vencedor não utiliza o veículo para fins
          ilícitos e mantém-no em estado de conservação razoável durante o período previsto
          em 9.1.
        </p>
        <p className={styles.nota9}>
          Estas condições assentam na boa-fé e no espírito do projecto, e não estabelecem
          penalização pecuniária. O Organizador poderá, contudo, retirar o seu apoio e
          associação pública ao veículo em caso de incumprimento.
        </p>

        <h2>10. Direitos de imagem</h2>
        <p>
          O participante e, em especial, o vencedor autorizam o Organizador e os patrocinadores
          a utilizar o seu nome e imagem (fotografia e vídeo) nas comunicações do projecto e
          dos patrocinadores, sem contrapartida adicional, para divulgação da presente Promoção
          e de edições futuras, dentro dos limites legais aplicáveis.
        </p>

        <h2>11. Protecção de dados pessoais</h2>
        <p>
          Os dados pessoais recolhidos são tratados exclusivamente para a gestão da Promoção
          (participação, verificação e entrega do prémio) e, mediante consentimento expresso e
          separado, para fins de marketing do Organizador. Os dados são conservados apenas
          durante o tempo necessário a estas finalidades e às obrigações legais aplicáveis. São
          garantidos ao titular os direitos de acesso, correcção e eliminação, através dos
          contactos indicados na Cláusula 1.
        </p>

        <h2>12. Limitação de responsabilidade</h2>
        <p>
          Após a transferência de propriedade e entrega, o Organizador não é responsável por
          quaisquer factos, danos, avarias ou encargos relativos ao veículo, salvo o que
          resultar imperativamente da lei. O Organizador não responde por falhas técnicas,
          casos de força maior ou factos de terceiros que afectem a Promoção.
        </p>

        <h2>13. Alterações, suspensão e cancelamento</h2>
        <p>
          O Organizador reserva-se o direito de alterar datas ou mecânicas, ou de suspender ou
          cancelar a Promoção, por motivo justificado (força maior, motivos legais, participação
          insuficiente ou impossibilidade de realização), anunciando tais decisões pelos canais
          oficiais.
        </p>

        <h2>14. Disposições gerais</h2>
        <p>
          A participação implica a aceitação integral destes Termos e Condições. Se alguma
          cláusula for considerada inválida, as restantes mantêm-se em vigor. O Organizador
          poderá esclarecer dúvidas de interpretação através dos contactos oficiais.
        </p>

        <h2>15. Lei aplicável e foro</h2>
        <p>
          A presente Promoção rege-se pela lei da República de Moçambique. Para a resolução de
          qualquer litígio será competente o foro da Comarca de Maputo, com renúncia expressa a
          qualquer outro.
        </p>

        <p className={styles.rodape}>
          Cansado → Lendário · Termos e Condições do Sorteio · Fuel Injection Technology
        </p>
      </article>
    </main>
  );
}
