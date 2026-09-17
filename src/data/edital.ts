import type { Discipline, Topic } from '../types'

// Conteúdo extraído literalmente do PDF "Edital Verticalizado — Guarda Municipal de Fortaleza"
// (@JulianaMCasteloBranco). Nenhum tópico foi inventado ou adicionado.

interface RawDiscipline {
  name: string
  topics: string[]
}

const RAW: RawDiscipline[] = [
  {
    name: 'Língua Portuguesa',
    topics: [
      'Leitura, compreensão e interpretação de textos.',
      'Estruturação do texto e dos parágrafos.',
      'Articulação do texto: pronomes e expressões referenciais, nexos, operadores sequenciais.',
      'Significação contextual de palavras e expressões.',
      'Equivalência e transformação de estruturas.',
      'Sintaxe: processos de coordenação e subordinação.',
      'Emprego de tempos e modos verbais.',
      'Pontuação.',
      'Estrutura e formação de palavras.',
      'Funções das classes de palavras.',
      'Flexão nominal e verbal.',
      'Pronomes: emprego, formas de tratamento e colocação.',
      'Concordância nominal e verbal.',
      'Regência nominal e verbal.',
      'Ortografia oficial.',
      'Acentuação gráfica.',
    ],
  },
  {
    name: 'Raciocínio Lógico',
    topics: [
      'Dedução de novas informações das relações fornecidas e avaliação das condições usadas para estabelecer a estrutura daquelas relações.',
      'Compreensão e análise da lógica de uma situação, utilizando as funções intelectuais: raciocínio verbal, raciocínio matemático, raciocínio sequencial, orientação espacial e temporal, formação de conceitos, discriminação de elementos.',
      'Operações com conjuntos. Raciocínio lógico envolvendo problemas aritméticos, geométricos e matriciais.',
    ],
  },
  {
    name: 'Informática',
    topics: [
      'Hardware: Dispositivos de Armazenamento, Memórias e Periféricos.',
      'Sistemas Operacionais Windows/Linux: conceito de pastas, diretórios, arquivos e atalhos, área de trabalho, área de transferência, manipulação de arquivos e pastas, uso dos menus, programas e aplicativos, interação com o conjunto de aplicativos.',
      'Editor de Textos: LibreOffice/Apache OpenOffice – Writer: estrutura básica dos documentos, edição e formatação de textos, cabeçalhos, parágrafos, fontes, colunas, marcadores simbólicos e numéricos, tabelas, impressão, controle de quebras e numeração de páginas, legendas, índices, inserção de objetos, campos predefinidos, caixas de texto.',
      'Planilhas Eletrônicas: LibreOffice/Apache OpenOffice – Calc: estrutura básica das planilhas, conceitos de células, linhas, colunas, pastas e gráficos, elaboração de tabelas e gráficos, uso de fórmulas, funções e macros, impressão, inserção de objetos, campos predefinidos, controle de quebras e numeração de páginas, obtenção de dados externos, classificação de dados.',
      'Correio Eletrônico - ThunderBird/Webmail: uso de correio eletrônico, preparo e envio de mensagens, anexação de arquivos.',
      'Ferramentas de Comunicações e Reuniões Online: Microsoft Teams, Google Meet, Zoom, Skype, Google Hangout.',
      'Internet: Intranet, Extranet, Protocolo e Serviço, Sítios de Busca e Pesquisa na internet, nuvem e redes sociais.',
      'Navegadores - Mozilla Firefox/Google Chrome – Internet: Navegação Internet, conceitos de URL, links, sites, busca e impressão de páginas. Redes sociais. Tecnologia da informação e segurança de dados.',
      'Segurança da Informação: Princípios de Segurança, Confidencialidade e Assinatura digital, Procedimentos de Segurança e Backup, Ferramentas de Segurança (antivírus e firewalls), Malwares, Ataques.',
      'Extensão e Arquivos.',
    ],
  },
  {
    name: 'Atualidades',
    topics: [
      'Matérias relacionadas a fatos políticos, econômicos, financeiros, sociais, administrativos, culturais, artísticos, científicos e jurídicos ocorridos no Brasil, veiculados nos últimos 06 (seis) meses anteriores à data da realização da Prova, em meios de comunicação de massa como jornais, rádios, internet e televisão.',
    ],
  },
  {
    name: 'Conhecimentos sobre Fortaleza-CE',
    topics: [
      'Localização e limites.',
      'Hidrografia.',
      'População.',
      'Aspectos políticos, administrativos, econômicos e culturais.',
      'Pontos turísticos.',
      'Patrimônio cultural.',
      'Clima e vegetação.',
      'Ocupação geográfica.',
      'História da cidade.',
    ],
  },
  {
    name: 'Direito Administrativo',
    topics: [
      'Estado, Governo e Administração Pública: conceitos, elementos, poderes, natureza, fins e princípios.',
      'Direito Administrativo: conceito, fontes e princípios.',
      'Ato Administrativo: Conceito, requisitos, atributos, classificação e espécies; Invalidação, anulação e revogação; Prescrição.',
    ],
  },
  {
    name: 'Direito Constitucional',
    topics: [
      'Dos Princípios Fundamentais (Art. 1º ao 4º da CRFB/88).',
      'Dos Direitos e Garantias Fundamentais (Art. 5º ao 11 da CRFB/88).',
      'Dos Direitos Políticos (Art. 14 ao 16 da CRFB/88).',
      'Da Organização do Estado (Art. 18 a 31; Art. 37 a 41 da CRFB/88).',
      'Da Segurança Pública (Art. 144 da CRFB/88).',
      'Da Política Urbana (Art. 182 e 183 da CRFB/88).',
      'Da Família, da Criança, do Adolescente, do Jovem e do Idoso (Art. 226 ao 230 da CRFB/88).',
      'Direitos Humanos: conceito, características, categorias e gerações.',
    ],
  },
  {
    name: 'Direito Penal',
    topics: [
      'Dos Crimes (Art. 13 ao 25 do Código Penal).',
      'Dos Crimes contra a Pessoa e contra o Patrimônio (Art. 121 ao 183 do Código Penal).',
      'Dos Crimes Contra a Dignidade Sexual (Art. 213 ao 218-C do Código Penal).',
      'Dos Crimes Contra a Fé Pública (Art. 212 ao 311 do Código Penal).',
      'Dos Crimes contra a Administração Pública (Art. 312 ao 337-A do Código Penal).',
    ],
  },
  {
    name: 'Direito Processual Penal',
    topics: [
      'Do Inquérito Policial (Art. 4º ao 23 do Código de Processo Penal).',
      'Da Prova: Disposições Gerais (Art. 155 ao 157 do Código de Processo Penal).',
      'Da Prova: Do Exame de Corpo de Delito, Da Cadeia de Custódia e das Perícias (Art. 158 ao 184 do Código de Processo Penal).',
      'Da Prova: Da Busca e Apreensão (Art. 240 ao 250 do Código de Processo Penal).',
      'Da Prisão, Das Medidas Cautelares e Da Liberdade Provisória: Disposições Gerais e da Prisão em Flagrante (Art. 282 ao 310 do Código de Processo Penal).',
    ],
  },
  {
    name: 'Leis Extravagantes',
    topics: [
      'Lei nº 13.022/2014 (Estatuto Geral das Guardas) e suas alterações.',
      'Lei nº 11.343/2016 (Lei de Drogas).',
      'Lei nº 7.716/1989 (Crimes resultantes de preconceitos de raça ou de cor) e suas alterações.',
      'Lei nº 8.069/1990 (Estatuto da Criança e do Adolescente) e suas alterações.',
      'Lei nº 9.605/1998 (Crimes contra o Meio Ambiente) e suas alterações.',
      'Lei nº 9.503/1997 (Código de Trânsito Brasileiro) e suas alterações.',
      'Lei nº 10.826/2003 (Estatuto do Desarmamento) e suas alterações.',
      'Lei nº 11.340/2006 (Lei Maria da Penha – Violência doméstica e familiar contra a mulher) e suas alterações.',
      'Lei nº 13.869/2019 (Lei do Abuso de Autoridade) e suas alterações.',
    ],
  },
  {
    name: 'Leis Municipais',
    topics: [
      'Lei Orgânica do Município de Fortaleza-CE (Art. 1º ao 9º e 98 ao 123) e suas alterações.',
      'Lei Municipal nº 6.794/1990 (Estatuto dos Servidores do Município de Fortaleza-CE) e suas alterações.',
    ],
  },
]

export function buildEditalSeed(): { disciplines: Discipline[]; topics: Topic[] } {
  const disciplines: Discipline[] = []
  const topics: Topic[] = []

  RAW.forEach((raw, dIndex) => {
    const disciplineId = `d${dIndex + 1}`
    disciplines.push({ id: disciplineId, name: raw.name, order: dIndex })
    raw.topics.forEach((t, tIndex) => {
      topics.push({
        id: `${disciplineId}-t${tIndex + 1}`,
        disciplineId,
        name: t,
        order: tIndex,
      })
    })
  })

  return { disciplines, topics }
}
