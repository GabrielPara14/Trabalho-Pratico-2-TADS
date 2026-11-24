// Relatórios: usa as consultas com JOIN do TP1 (rotas /api/relatorios/...)
// Cada relatório diz: rota, colunas da tabela, filtros, o gráfico de barras e os indicadores.
const relatorios = [
    {
        id: 'gastos',
        nome: 'Gastos por fabricante',
        rota: 'relatorios/gastos-manutencao-por-fabricante',
        colunas: [['fabricante', 'Fabricante'], ['totalGastoManutencao', 'Total gasto', 'dinheiro'], ['qtdManutencoes', 'Qtd. manutenções']],
        filtros: [['fabricante', 'Fabricante', 'texto'], ['totalGastoManutencao', 'Gasto mínimo (R$)', 'minimo']],
        grafico: { titulo: 'Gasto com manutenção por fabricante', grupo: 'fabricante', valor: 'totalGastoManutencao', formato: 'dinheiro' },
        resumo: dados => [
            [dinheiro(soma(dados, 'totalGastoManutencao')), 'Total gasto', 'fabricantes filtrados'],
            [soma(dados, 'qtdManutencoes'), 'Manutenções', 'registradas']
        ]
    },
    {
        id: 'frota',
        nome: 'Veículos x fabricantes',
        rota: 'relatorios/veiculos-fabricantes',
        colunas: [['veiculoId', 'ID'], ['modelo', 'Modelo'], ['placa', 'Placa'], ['fabricante', 'Fabricante']],
        filtros: [['fabricante', 'Fabricante', 'lista'], ['modelo', 'Modelo', 'texto'], ['placa', 'Placa', 'texto']],
        grafico: { titulo: 'Veículos por fabricante', grupo: 'fabricante', valor: null },
        resumo: dados => [
            [dados.length, 'Veículos', 'no resultado'],
            [new Set(dados.map(d => d.fabricante)).size, 'Fabricantes', 'com veículos']
        ]
    },
    {
        id: 'historico',
        nome: 'Histórico de aluguéis',
        rota: 'relatorios/historico-alugueis',
        colunas: [['aluguelId', '#'], ['cliente', 'Cliente'], ['cpf', 'CPF'], ['veiculo', 'Veículo'], ['placa', 'Placa'],
                  ['dataInicio', 'Início', 'data'], ['dataFimPrevista', 'Fim previsto', 'data'], ['valorTotal', 'Total', 'dinheiro']],
        filtros: [['cliente', 'Cliente', 'texto'], ['veiculo', 'Veículo', 'lista'], ['dataInicio', 'Início a partir de', 'de'], ['dataInicio', 'Início até', 'ate']],
        grafico: { titulo: 'Faturamento por veículo', grupo: 'veiculo', valor: 'valorTotal', formato: 'dinheiro' },
        resumo: dados => [
            [dinheiro(soma(dados, 'valorTotal')), 'Faturamento', 'aluguéis com total'],
            [dados.length, 'Aluguéis', 'no período']
        ]
    },
    {
        id: 'clientes',
        nome: 'Clientes x aluguéis',
        rota: 'relatorios/clientes-alugueis',
        colunas: [['cliente', 'Cliente'], ['cpf', 'CPF'], ['aluguelRegistrado', 'Alugou?'], ['dataAluguel', 'Data do aluguel', 'data'], ['valorTotal', 'Valor', 'dinheiro']],
        filtros: [['cliente', 'Cliente', 'texto'], ['aluguelRegistrado', 'Alugou?', 'lista']],
        grafico: { titulo: 'Valor gasto por cliente', grupo: 'cliente', valor: 'valorTotal', formato: 'dinheiro' },
        resumo: dados => [
            [new Set(dados.filter(d => d.aluguelRegistrado === 'Não').map(d => d.cpf)).size, 'Sem aluguel', 'clientes (LEFT JOIN)'],
            [dinheiro(soma(dados, 'valorTotal')), 'Total', 'em aluguéis']
        ]
    },
    {
        id: 'manutencoes',
        nome: 'Veículos x manutenções',
        rota: 'relatorios/veiculos-manutencoes',
        colunas: [['modelo', 'Modelo'], ['placa', 'Placa'], ['statusManutencao', 'Situação'], ['descricao', 'Descrição'], ['valorGasto', 'Valor', 'dinheiro']],
        filtros: [['modelo', 'Modelo', 'texto'], ['statusManutencao', 'Situação', 'lista']],
        grafico: { titulo: 'Gasto com manutenção por veículo', grupo: 'modelo', valor: 'valorGasto', formato: 'dinheiro' },
        resumo: dados => [
            [new Set(dados.filter(d => d.statusManutencao === 'Sem Manutenção').map(d => d.placa)).size, 'Sem manutenção', 'veículos (LEFT JOIN)'],
            [dinheiro(soma(dados, 'valorGasto')), 'Total gasto', 'no resultado']
        ]
    }
];

let atual = null;
let dados = [];

function soma(lista, campo) {
    return lista.reduce((t, d) => t + Number(d[campo] || 0), 0);
}

function formatar(valor, formato) {
    if (formato === 'dinheiro') return dinheiro(valor);
    if (formato === 'data') return dataBR(valor);
    return seguro(valor ?? '—');
}

function montarMenu() {
    let menu = document.querySelector('#listaRelatorios');
    for (let r of relatorios) {
        menu.innerHTML += `<button type="button" id="rel-${r.id}" onclick="abrirRelatorio('${r.id}')">${r.nome}</button>`;
    }
}

async function abrirRelatorio(id) {
    atual = relatorios.find(r => r.id === id) || relatorios[0];
    history.replaceState(null, '', `?r=${atual.id}`);
    document.querySelectorAll('#listaRelatorios button').forEach(b => b.classList.toggle('ativo', b.id === `rel-${atual.id}`));
    document.querySelector('#rotaAtual').textContent = `GET /api/${atual.rota}`;
    document.querySelector('#cabecalhoTabela').innerHTML = '<tr>' + atual.colunas.map(c => `<th>${c[1]}</th>`).join('') + '</tr>';
    document.querySelector('#lista').innerHTML = `<tr><td colspan="${atual.colunas.length}" class="vazio">Carregando...</td></tr>`;
    try {
        dados = await buscar(atual.rota);
        montarFiltros();
        mostrarRelatorio();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="${atual.colunas.length}" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

// Cria os campos de filtro do relatório escolhido (as listas usam os valores que vieram da consulta)
function montarFiltros() {
    let form = document.querySelector('#formFiltros');
    form.innerHTML = '';
    atual.filtros.forEach(([campo, rotulo, tipo], i) => {
        let entrada;
        if (tipo === 'lista') {
            let opcoes = [...new Set(dados.map(d => d[campo]))].sort();
            entrada = `<select id="f${i}"><option value="">Todos</option>${opcoes.map(o => `<option>${seguro(o)}</option>`).join('')}</select>`;
        } else if (tipo === 'de' || tipo === 'ate') {
            entrada = `<input id="f${i}" type="date">`;
        } else if (tipo === 'minimo') {
            entrada = `<input id="f${i}" type="number" step="0.01" placeholder="0,00">`;
        } else {
            entrada = `<input id="f${i}" placeholder="Buscar...">`;
        }
        form.innerHTML += `<div class="campo"><label for="f${i}">${rotulo}</label>${entrada}</div>`;
    });
    form.innerHTML += `<button class="btn-cheio">Aplicar</button><button type="button" class="btn-contorno" onclick="limparFiltros()">Limpar</button>`;
}

function filtrar() {
    return dados.filter(d => atual.filtros.every(([campo, , tipo], i) => {
        let v = document.querySelector(`#f${i}`).value;
        if (v === '') return true;
        if (tipo === 'texto') return contem(d[campo], v);
        if (tipo === 'lista') return String(d[campo]) === v;
        if (tipo === 'minimo') return Number(d[campo]) >= Number(v);
        if (tipo === 'de') return dataInput(d[campo]) >= v;
        if (tipo === 'ate') return dataInput(d[campo]) <= v;
        return true;
    }));
}

function mostrarRelatorio() {
    let filtrados = filtrar();

    // tabela
    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    if (filtrados.length === 0) {
        lista.innerHTML = `<tr><td colspan="${atual.colunas.length}" class="vazio">Nenhum resultado para esses filtros.</td></tr>`;
    }
    for (let d of filtrados) {
        lista.innerHTML += '<tr>' + atual.colunas.map(([campo, , formato], i) =>
            `<td>${i === 0 || campo === 'cliente' || campo === 'modelo' ? '<strong>' : ''}${formatar(d[campo], formato)}</td>`).join('') + '</tr>';
    }

    // gráfico de barras: agrupa pelo campo do relatório (soma o valor ou conta as linhas)
    let g = atual.grafico;
    let grupos = {};
    for (let d of filtrados) {
        let chave = d[g.grupo] ?? '—';
        grupos[chave] = (grupos[chave] || 0) + (g.valor ? Number(d[g.valor] || 0) : 1);
    }
    let barras = Object.entries(grupos).sort((a, b) => b[1] - a[1]).slice(0, 8);
    let maior = Math.max(1, ...barras.map(b => b[1]));
    document.querySelector('#tituloGrafico').textContent = g.titulo;
    let grafico = document.querySelector('#grafico');
    grafico.innerHTML = barras.length ? '' : '<p class="vazio">Sem dados para o gráfico.</p>';
    for (let [nome, valor] of barras) {
        grafico.innerHTML += `
            <div class="barra">
                <span class="nome" title="${seguro(nome)}">${seguro(nome)}</span>
                <span class="trilho"><span class="preenchido d-block" style="width:${(valor / maior) * 100}%"></span></span>
                <span class="valor">${g.formato === 'dinheiro' ? dinheiro(valor) : valor}</span>
            </div>`;
    }

    // indicadores
    let resumo = document.querySelector('#resumo');
    resumo.innerHTML = '';
    for (let [numero, rotulo, detalhe] of atual.resumo(filtrados)) {
        resumo.innerHTML += `
            <div class="card-cinza kpi">
                <div class="numero">${numero}</div>
                <div class="rotulo">${rotulo}</div>
                <div class="detalhe">${detalhe}</div>
            </div>`;
    }
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarRelatorio(); });
document.querySelector('#formFiltros').addEventListener('change', mostrarRelatorio);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarRelatorio();
}

montarMenu();
abrirRelatorio(new URLSearchParams(window.location.search).get('r'));
