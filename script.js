// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// DADOS FICTÍCIOS PADRONIZADOS - 9º ANO (Dados Brutos Locais)
const dadosBoletimPadrao = [
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

// Estado da aplicação na memória
let dadosAtuais = [];
let pinSessao = "";
let modoEdicao = false;

// Função para normalizar qualquer formato de nota para a escala de 0 a 10 (Dados Antigos/Iniciais)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null; // Nota ainda não lançada
  }

  let n = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : Number(valor);

  if (isNaN(n)) return null;

  if (n > 10 && n <= 100) {
    n = n / 10;
  }

  if (n < 0 || n > 10) {
    return null;
  }

  return n;
}

// Validação de nota digitada pelo estudante (Escala 0 a 10)
function validarNotaDigitada(strVal) {
  if (strVal === undefined || strVal === null) return { valida: true, valor: null };
  const texto = String(strVal).trim();
  if (texto === "") return { valida: true, valor: null };

  // Aceita apenas ponto ou vírgula decimal simples
  const textoPadronizado = texto.replace(",", ".");
  const n = Number(textoPadronizado);

  if (isNaN(n) || n < 0 || n > 10) {
    return { valida: false, valor: null };
  }

  return { valida: true, valor: n };
}

// Validação de faltas digitadas (Inteiro >= 0)
function validarFaltaDigitada(strVal) {
  const texto = String(strVal).trim();
  if (texto === "") return { valida: false, valor: null };

  const n = Number(texto);
  if (!Number.isInteger(n) || n < 0) {
    return { valida: false, valor: null };
  }

  return { valida: true, valor: n };
}

// Função para construir o boletim e atualizar o HTML
function carregarBoletim() {
  const tabela = document.getElementById("tabela-boletim");
  tabela.innerHTML = ""; // Limpa a tabela antes de reconstruir

  let somaMediasValidas = 0;
  let qtdMediasValidas = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosAtuais.forEach((item, idx) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltasDisciplina = faltasArray.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    totalFaltasGeral += totalFaltasDisciplina;

    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((a, b) => a + b, 0);
      media = soma / notasValidas.length;

      somaMediasValidas += media;
      qtdMediasValidas++;

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

    const txt1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
    const txt2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
    const txt3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";
    const txtMedia = media !== null ? media.toFixed(1).replace(".", ",") : "—";

    const tr = document.createElement("tr");

    if (modoEdicao) {
      // Segurança DOM e Edição de Campos
      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina;
      tdDisc.appendChild(strongDisc);
      tr.appendChild(tdDisc);

      const val1 = n1 !== null ? String(n1).replace(".", ",") : "";
      const val2 = n2 !== null ? String(n2).replace(".", ",") : "";
      const val3 = n3 !== null ? String(n3).replace(".", ",") : "";

      tr.innerHTML += `
        <td><input type="text" class="input-edicao input-n1" data-idx="${idx}" value="${val1}"></td>
        <td><input type="text" class="input-edicao input-n2" data-idx="${idx}" value="${val2}"></td>
        <td><input type="text" class="input-edicao input-n3" data-idx="${idx}" value="${val3}"></td>
        <td><strong>${txtMedia}</strong></td>
        <td>
          <input type="text" class="input-edicao input-f1" data-idx="${idx}" value="${faltasArray[0] ?? 0}" title="Faltas Tri 1">
          <input type="text" class="input-edicao input-f2" data-idx="${idx}" value="${faltasArray[1] ?? 0}" title="Faltas Tri 2">
          <input type="text" class="input-edicao input-f3" data-idx="${idx}" value="${faltasArray[2] ?? 0}" title="Faltas Tri 3">
        </td>
        <td class="${classeSituacao}">${situacao}</td>
      `;
    } else {
      // Exibição Padrão com Segurança DOM
      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina;
      tdDisc.appendChild(strongDisc);
      tr.appendChild(tdDisc);

      const td1 = document.createElement("td"); td1.textContent = txt1; tr.appendChild(td1);
      const td2 = document.createElement("td"); td2.textContent = txt2; tr.appendChild(td2);
      const td3 = document.createElement("td"); td3.textContent = txt3; tr.appendChild(td3);
      
      const tdMed = document.createElement("td");
      const strongMed = document.createElement("strong");
      strongMed.textContent = txtMedia;
      tdMed.appendChild(strongMed);
      tr.appendChild(tdMed);

      const tdFaltas = document.createElement("td"); tdFaltas.textContent = totalFaltasDisciplina; tr.appendChild(tdFaltas);
      
      const tdSit = document.createElement("td");
      tdSit.className = classeSituacao;
      tdSit.textContent = situacao;
      tr.appendChild(tdSit);
    }

    tabela.appendChild(tr);
  });

  // Atualizando os Cards de Resumo
  const mediaGeral = qtdMediasValidas > 0 ? (somaMediasValidas / qtdMediasValidas).toFixed(1).replace(".", ",") : "—";

  document.getElementById("card-media").textContent = mediaGeral;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;

  /* 
    NOTA SOBRE A FREQUÊNCIA:
    O percentual de 92% exibido no card de frequência é APENAS DEMONSTRATIVO/FICTÍCIO nesta etapa.
    Em versões futuras, o cálculo da frequência será integrado dinamicamente ao sistema.
  */
}

// Conectar / Abrir Boletim na API
async function abrirBoletim() {
  const inputPin = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite o PIN.";
    msgLogin.className = "msg-status msg-erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "msg-status";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "msg-status msg-erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "msg-status msg-erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "msg-status msg-erro";
      return;
    }

    const resultado = await resposta.json();

    // Salva o PIN apenas na memória durante a sessão
    pinSessao = pinDigitado;
    inputPin.value = ""; // Limpa o campo por segurança

    // REGRA: DADOS DA API > DADOS LOCAIS
    if (resultado.dados && Array.isArray(resultado.dados.disciplinas)) {
      dadosAtuais = resultado.dados.disciplinas;
    } else {
      dadosAtuais = JSON.parse(JSON.stringify(dadosBoletimPadrao));
    }

    document.getElementById("secao-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";

    carregarBoletim();
  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "msg-status msg-erro";
  }
}

// Alternar entre modo de visualização e edição
function alternarEdicao() {
  modoEdicao = !modoEdicao;
  const btnEdicao = document.getElementById("btn-alternar-edicao");
  const btnSalvar = document.getElementById("btn-salvar");
  const msgSalvar = document.getElementById("msg-salvamento");

  msgSalvar.textContent = "";

  if (modoEdicao) {
    btnEdicao.textContent = "Cancelar edição";
    btnSalvar.style.display = "inline-block";
  } else {
    btnEdicao.textContent = "Alterar dados";
    btnSalvar.style.display = "none";
  }

  carregarBoletim();
}

// Salvar alterações na API
async function salvarBoletim() {
  const msgSalvar = document.getElementById("msg-salvamento");
  const inputs = document.querySelectorAll(".input-edicao");
  
  // Limpa estados de erro anteriores
  inputs.forEach(input => input.classList.remove("invalido"));
  
  let temErro = false;
  const novosDados = JSON.parse(JSON.stringify(dadosAtuais));

  // Validação de todos os campos digitados
  dadosAtuais.forEach((item, idx) => {
    const inN1 = document.querySelector(`.input-n1[data-idx="${idx}"]`);
    const inN2 = document.querySelector(`.input-n2[data-idx="${idx}"]`);
    const inN3 = document.querySelector(`.input-n3[data-idx="${idx}"]`);

    const inF1 = document.querySelector(`.input-f1[data-idx="${idx}"]`);
    const inF2 = document.querySelector(`.input-f2[data-idx="${idx}"]`);
    const inF3 = document.querySelector(`.input-f3[data-idx="${idx}"]`);

    const vN1 = validarNotaDigitada(inN1.value);
    const vN2 = validarNotaDigitada(inN2.value);
    const vN3 = validarNotaDigitada(inN3.value);

    const vF1 = validarFaltaDigitada(inF1.value);
    const vF2 = validarFaltaDigitada(inF2.value);
    const vF3 = validarFaltaDigitada(inF3.value);

    if (!vN1.valida) { inN1.classList.add("invalido"); temErro = true; }
    if (!vN2.valida) { inN2.classList.add("invalido"); temErro = true; }
    if (!vN3.valida) { inN3.classList.add("invalido"); temErro = true; }

    if (!vF1.valida) { inF1.classList.add("invalido"); temErro = true; }
    if (!vF2.valida) { inF2.classList.add("invalido"); temErro = true; }
    if (!vF3.valida) { inF3.classList.add("invalido"); temErro = true; }

    if (!temErro) {
      novosDados[idx].tri1 = vN1.valor;
      novosDados[idx].tri2 = vN2.valor;
      novosDados[idx].tri3 = vN3.valor;
      novosDados[idx].faltas = [vF1.valor, vF2.valor, vF3.valor];
    }
  });

  if (temErro) {
    msgSalvar.textContent = "Verifique os campos destacados em vermelho.";
    msgSalvar.className = "msg-status msg-erro";
    return;
  }

  msgSalvar.textContent = "Salvando...";
  msgSalvar.className = "msg-status";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novosDados
        }
      })
    });

    if (!resposta.ok) {
      msgSalvar.textContent = "Erro ao salvar alterações. Tente novamente.";
      msgSalvar.className = "msg-status msg-erro";
      return;
    }

    dadosAtuais = novosDados;
    modoEdicao = false;
    
    document.getElementById("btn-alternar-edicao").textContent = "Alterar dados";
    document.getElementById("btn-salvar").style.display = "none";
    
    msgSalvar.textContent = "Dados salvos com sucesso.";
    msgSalvar.className = "msg-status msg-sucesso";

    carregarBoletim();
  } catch (erro) {
    msgSalvar.textContent = "Erro ao salvar alterações. Tente novamente.";
    msgSalvar.className = "msg-status msg-erro";
  }
}

// Eventos dos botões
document.getElementById("btn-entrar").addEventListener("click", abrirBoletim);
document.getElementById("btn-alternar-edicao").addEventListener("click", alternarEdicao);
document.getElementById("btn-salvar").addEventListener("click", salvarBoletim);
