// Dados padronizados das 15 disciplinas do 9º Ano
const dadosBrutos = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Frequência geral apenas para demonstração visual nesta etapa (será recalculada futuramente)
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Função para padronizar e converter qualquer nota para a escala 0 a 10
function normalizarNota(valor) {
  // Se estiver vazio, nulo ou indefinido -> nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string com vírgula, troca por ponto decimal
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  const num = Number(valor);

  // Se não for um número válido, retorna nulo
  if (isNaN(num)) {
    return null;
  }

  // Regras de conversão
  if (num >= 0 && num <= 10) {
    return num;
  } else if (num > 10 && num <= 100) {
    return num / 10;
  }

  // Valores fora dessas faixas são inválidos
  return null;
}

// Função principal que processa os dados e desenha na tela
function renderizarBoletim() {
  const tbody = document.getElementById("tabela-corpo");
  tbody.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Passa por cada disciplina do array usando o forEach
  dadosBrutos.forEach((item) => {
    // Normaliza as notas dos 3 trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a soma e conta quantas notas existem
    let somaNotas = 0;
    let qtdNotas = 0;

    [n1, n2, n3].forEach((nota) => {
      if (nota !== null) {
        somaNotas += nota;
        qtdNotas++;
      }
    });

    // Calcula a média da disciplina (somente com as notas disponíveis)
    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (qtdNotas > 0) {
      media = somaNotas / qtdNotas;
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        qtdAtencao++;
      }
    }

    // Somar as faltas dos trimestres
    const totalFaltasDisciplina = item.faltas.reduce((acc, f) => acc + f, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Formatação de exibição das notas para a tabela
    const txt1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace(".", ",") : "—";

    // Criar a linha na tabela HTML
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${txt1}</td>
      <td>${txt2}</td>
      <td>${txt3}</td>
      <td><strong>${txtMedia}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td><span class="${classeSituacao}">${situacao}</span></td>
    `;
    tbody.appendChild(tr);
  });

  // Atualizar os Cards de Resumo na página
  const mediaGeralFinal = qtdDisciplinasComMedia > 0 ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") : "—";

  document.getElementById("card-media-valor").innerText = mediaGeralFinal;
  document.getElementById("card-faltas-valor").innerText = totalFaltasGeral;
  document.getElementById("card-frequencia-valor").innerText = FREQUENCIA_DEMONSTRATIVA;
  document.getElementById("card-bom-desempenho").innerText = qtdBomDesempenho;
  document.getElementById("card-atencao-valor").innerText = qtdAtencao;
}

// Executa a função assim que a página carrega
renderizarBoletim();