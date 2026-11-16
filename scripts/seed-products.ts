/**
 * Insere ~30 produtos de exemplo pelo endpoint POST /api/v1/products.
 *
 * Uso (com o app rodando):
 *   bun scripts/seed-products.ts
 *   BASE_URL=http://localhost:3000 bun scripts/seed-products.ts
 */

type SeedProduct = {
  slug: string;
  name: string;
  description?: string;
  withImage?: boolean;
};

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const products: SeedProduct[] = [
  {
    slug: "fone-aura-x2",
    name: "Fone Aura X2",
    description:
      "Fone over-ear com cancelamento de ruído ativo e até 30 horas de bateria.",
  },
  {
    slug: "cafeteira-moka-ritual",
    name: "Cafeteira Moka Ritual",
    description:
      "Cafeteira italiana de alumínio para 6 xícaras, compatível com fogão a gás e elétrico.",
  },
  {
    slug: "mochila-trilha-28",
    name: "Mochila Trilha 28L",
    description:
      "Mochila impermeável com compartimento para notebook de 15 polegadas e alças acolchoadas.",
  },
  {
    slug: "luminaria-orbita",
    name: "Luminária Órbita",
    description:
      "Luminária de mesa com três temperaturas de cor e carregador sem fio na base.",
  },
  {
    slug: "tenis-passo-leve",
    name: "Tênis Passo Leve",
    description:
      "Tênis de corrida com entressola de espuma responsiva para treinos diários.",
  },
  {
    slug: "garrafa-termica-glacial",
    name: "Garrafa Térmica Glacial",
    description:
      "Mantém bebidas geladas por 24 horas e quentes por 12. Capacidade de 750 ml.",
  },
  {
    slug: "teclado-mecanico-kora",
    name: "Teclado Mecânico Kora",
    description:
      "Teclado 75% com switches marrons, conexão Bluetooth e cabo USB-C.",
  },
  {
    slug: "panela-ferro-brasa",
    name: "Panela de Ferro Brasa",
    description:
      "Panela de ferro fundido esmaltado de 24 cm, vai do fogão ao forno.",
  },
  {
    slug: "smartwatch-pulso-s",
    name: "Smartwatch Pulso S",
    description:
      "Relógio inteligente com GPS, monitor de sono e tela AMOLED sempre ligada.",
  },
  {
    slug: "cadeira-ergo-flex",
    name: "Cadeira Ergo Flex",
    description:
      "Cadeira de escritório com apoio lombar ajustável e encosto em tela respirável.",
  },
  {
    slug: "caixa-som-mare",
    name: "Caixa de Som Maré",
    description: "Caixa Bluetooth à prova d'água com 16 horas de autonomia.",
  },
  {
    slug: "kindle-leitor-pagina",
    name: "Leitor Digital Página",
    description:
      "Leitor de livros digitais com tela antirreflexo de 7 polegadas e luz ajustável.",
  },
  {
    slug: "aspirador-robo-nimbus",
    name: "Aspirador Robô Nimbus",
    description:
      "Aspirador robô com mapeamento a laser e base de esvaziamento automático.",
  },
  {
    slug: "jaqueta-corta-vento-sul",
    name: "Jaqueta Corta-Vento Sul",
    description:
      "Jaqueta leve que vira bolsinha, com capuz e costuras seladas.",
  },
  {
    slug: "liquidificador-turbo-6",
    name: "Liquidificador Turbo 6",
    description:
      "Liquidificador de 1400 W com jarra de vidro e seis velocidades.",
  },
  {
    slug: "camera-instantanea-flash",
    name: "Câmera Instantânea Flash",
    description:
      "Câmera de fotos instantâneas com modo selfie e flash automático.",
  },
  {
    slug: "colchao-sereno",
    name: "Colchão Sereno",
    description: "Colchão de molas ensacadas com pillow top, tamanho casal.",
  },
  {
    slug: "monitor-vista-27",
    name: "Monitor Vista 27",
    description:
      "Monitor IPS de 27 polegadas, resolução 4K e ajuste de altura.",
  },
  {
    slug: "bicicleta-urbana-giro",
    name: "Bicicleta Urbana Giro",
    withImage: false,
  },
  {
    slug: "air-fryer-crocante",
    name: "Air Fryer Crocante",
    description:
      "Fritadeira sem óleo de 5 litros com cesto antiaderente e timer de 60 minutos.",
  },
  {
    slug: "mouse-sem-fio-agil",
    name: "Mouse sem Fio Ágil",
    description:
      "Mouse silencioso com sensor de 4000 DPI e bateria recarregável.",
  },
  {
    slug: "barraca-acampa-3",
    name: "Barraca Acampa 3",
    description:
      "Barraca para três pessoas com montagem rápida e sobreteto impermeável.",
    withImage: false,
  },
  {
    slug: "escova-dental-sonica",
    name: "Escova Dental Sônica",
    description:
      "Escova elétrica com cinco modos de limpeza e sensor de pressão.",
  },
  {
    slug: "tablet-lousa-10",
    name: "Tablet Lousa 10",
    description:
      "Tablet de 10 polegadas com caneta inclusa, ideal para anotações e desenhos.",
  },
  {
    slug: "oculos-sol-horizonte",
    name: "Óculos de Sol Horizonte",
    description: "Lentes polarizadas com proteção UV400 e armação de acetato.",
  },
  {
    slug: "ventilador-brisa-silenciosa",
    name: "Ventilador Brisa Silenciosa",
    description:
      "Ventilador de coluna com controle remoto e modo noturno de baixo ruído.",
  },
  {
    slug: "carregador-portatil-volt",
    name: "Carregador Portátil Volt",
    description:
      "Bateria externa de 20.000 mAh com carregamento rápido de 30 W.",
  },
  {
    slug: "jogo-lencois-algodao",
    name: "Jogo de Lençóis Algodão Egípcio",
    description: "Jogo de lençóis de 400 fios com quatro peças, tamanho queen.",
  },
  {
    slug: "projetor-cine-casa",
    name: "Projetor Cine Casa",
    description:
      "Projetor Full HD com alto-falante embutido e espelhamento de celular.",
  },
  {
    slug: "balanca-cozinha-precisa",
    name: "Balança de Cozinha Precisa",
    description: "Balança digital com precisão de 1 g e função tara.",
  },
];

async function main() {
  let created = 0;
  // Sequencial para que a ordem de created_at siga a lista.
  for (const product of products) {
    const response = await fetch(`${BASE_URL}/api/v1/products`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        link: `https://loja.example.com/${product.slug}`,
        image:
          product.withImage === false
            ? undefined
            : `https://picsum.photos/seed/${product.slug}/800/600`,
      }),
    });

    if (!response.ok) {
      console.error(
        `Falha ao criar "${product.name}" (${response.status}):`,
        await response.text(),
      );
      continue;
    }

    created += 1;
    console.log(`Criado: ${product.name}`);
  }

  console.log(
    `\n${created}/${products.length} produtos criados em ${BASE_URL}.`,
  );
  if (created < products.length) process.exit(1);
}

await main();

export {};
