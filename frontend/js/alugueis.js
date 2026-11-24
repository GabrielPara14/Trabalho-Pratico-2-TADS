// Aluguéis: listar, filtrar, registrar, editar/devolver e excluir (rota /api/alugueis)
let alugueis = [];
let clientes = [];
let veiculos = [];

async function getAlugueis() {
    try {
        [alugueis, clientes, veiculos] = await Promise.all([buscar('alugueis'), buscar('clientes'), buscar('veiculos')]);
        preencherSelects();
        mostrarAlugueis();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="8" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

function preencherSelects() {
    let filtro = document.querySelector('#filtroVeiculo');
    let escolhido = filtro.value;
    filtro.innerHTML = '<option value="">Todos</option>';
    let selVeiculo = document.querySelector('#veiculoId');
    selVeiculo.innerHTML = '<option value="">Selecione</option>';
    for (let v of veiculos) {
        filtro.innerHTML += `<option value="${v.id}">${seguro(v.modelo)} (${seguro(v.placa)})</option>`;
        selVeiculo.innerHTML += `<option value="${v.id}">${seguro(v.modelo)} (${seguro(v.placa)})</option>`;
    }
    filtro.value = escolhido;

    let selCliente = document.querySelector('#clienteId');
    selCliente.innerHTML = '<option value="">Selecione</option>';
    for (let c of [...clientes].sort((a, b) => a.nome.localeCompare(b.nome))) {
        selCliente.innerHTML += `<option value="${c.id}">${seguro(c.nome)} — ${seguro(c.cpf)}</option>`;
    }
}

function nomeCliente(id) { let c = clientes.find(x => x.id === id); return c ? c.nome : '—'; }
function nomeVeiculo(id) { let v = veiculos.find(x => x.id === id); return v ? `${v.modelo} (${v.placa})` : '—'; }
function emAberto(a) { return !a.dataDevolucao; }

function mostrarAlugueis() {
    let cliente = document.querySelector('#filtroCliente').value;
    let veiculo = document.querySelector('#filtroVeiculo').value;
    let situacao = document.querySelector('#filtroSituacao').value;
    let de = document.querySelector('#filtroDe').value;
    let ate = document.querySelector('#filtroAte').value;

    let filtrados = alugueis.filter(a =>
        contem(nomeCliente(a.clienteId), cliente) &&
        (veiculo === '' || a.veiculoId === Number(veiculo)) &&
        (situacao === '' || (situacao === 'aberto' ? emAberto(a) : !emAberto(a))) &&
        (de === '' || dataInput(a.dataInicio) >= de) &&
        (ate === '' || dataInput(a.dataInicio) <= ate)
    );
    filtrados.sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));

    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    document.querySelector('#contador').textContent = `${filtrados.length} de ${alugueis.length} registros`;

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="8" class="vazio">Nenhum aluguel encontrado.</td></tr>';
        return;
    }
    for (let a of filtrados) {
        lista.innerHTML += `
            <tr>
                <td>#${a.id}</td>
                <td><strong>${seguro(nomeCliente(a.clienteId))}</strong></td>
                <td>${seguro(nomeVeiculo(a.veiculoId))}</td>
                <td>${dataBR(a.dataInicio)} a ${dataBR(a.dataDevolucao || a.dataFimPrevista)}</td>
                <td>${dinheiro(a.valorDiaria)}</td>
                <td>${a.valorTotal != null ? dinheiro(a.valorTotal) : '—'}</td>
                <td>${emAberto(a) ? '<span class="tag escura">Em aberto</span>' : '<span class="tag">Devolvido</span>'}</td>
                <td class="acoes">
                    <button class="btn-link-texto" onclick="editarAluguel(${a.id})">${emAberto(a) ? 'Devolver / Editar' : 'Editar'}</button>
                    <button class="btn-link-texto perigo" onclick="excluirAluguel(${a.id})">Excluir</button>
                </td>
            </tr>`;
    }
}

// Calcula o total pelas diárias (devolução ou fim previsto - início)
function calcularTotal() {
    let inicio = document.querySelector('#dataInicio').value;
    let fim = document.querySelector('#dataDevolucao').value || document.querySelector('#dataFimPrevista').value;
    let diaria = Number(document.querySelector('#valorDiaria').value);
    if (!inicio || !fim || !diaria) return;
    let dias = Math.max(1, Math.round((new Date(fim) - new Date(inicio)) / 86400000));
    document.querySelector('#valorTotal').value = (dias * diaria).toFixed(2);
}
for (let campo of ['#dataInicio', '#dataFimPrevista', '#dataDevolucao', '#valorDiaria']) {
    document.querySelector(campo).addEventListener('change', calcularTotal);
}

// Ao escolher o veículo, sugere a quilometragem atual dele como km inicial
document.querySelector('#veiculoId').addEventListener('change', (e) => {
    let v = veiculos.find(x => x.id === Number(e.target.value));
    if (v && !document.querySelector('#id').value) document.querySelector('#quilometragemInicial').value = v.quilometragem;
});

function abrirGaveta(titulo, dica) {
    document.querySelector('#tituloGaveta').textContent = titulo;
    document.querySelector('#dicaGaveta').textContent = dica;
    mostrarErroForm('');
    bootstrap.Offcanvas.getOrCreateInstance('#gaveta').show();
}

function novoAluguel() {
    document.querySelector('#formAluguel').reset();
    document.querySelector('#id').value = '';
    document.querySelector('#dataInicio').value = hoje();
    abrirGaveta('Novo aluguel', 'Salvar envia POST /api/alugueis.');
}

async function editarAluguel(id) {
    let a = await buscar(`alugueis/${id}`);
    document.querySelector('#id').value = a.id;
    document.querySelector('#clienteId').value = a.clienteId;
    document.querySelector('#veiculoId').value = a.veiculoId;
    document.querySelector('#dataInicio').value = dataInput(a.dataInicio);
    document.querySelector('#dataFimPrevista').value = dataInput(a.dataFimPrevista);
    document.querySelector('#valorDiaria').value = a.valorDiaria;
    document.querySelector('#quilometragemInicial').value = a.quilometragemInicial;
    document.querySelector('#dataDevolucao').value = dataInput(a.dataDevolucao);
    document.querySelector('#quilometragemFinal').value = a.quilometragemFinal ?? '';
    document.querySelector('#valorTotal').value = a.valorTotal ?? '';
    abrirGaveta(`Aluguel #${a.id}`, `Salvar envia PUT /api/alugueis/${id}.`);
}

function numeroOuNulo(seletor) {
    let valor = document.querySelector(seletor).value;
    return valor === '' ? null : Number(valor);
}

document.querySelector('#formAluguel').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.querySelector('#id').value;
    let aluguel = {
        clienteId: Number(document.querySelector('#clienteId').value),
        veiculoId: Number(document.querySelector('#veiculoId').value),
        dataInicio: paraApi(document.querySelector('#dataInicio').value),
        dataFimPrevista: paraApi(document.querySelector('#dataFimPrevista').value),
        dataDevolucao: paraApi(document.querySelector('#dataDevolucao').value),
        quilometragemInicial: Number(document.querySelector('#quilometragemInicial').value),
        quilometragemFinal: numeroOuNulo('#quilometragemFinal'),
        valorDiaria: Number(document.querySelector('#valorDiaria').value),
        valorTotal: numeroOuNulo('#valorTotal')
    };
    if (aluguel.dataFimPrevista < aluguel.dataInicio) {
        mostrarErroForm('O fim previsto não pode ser antes do início.');
        return;
    }
    if (aluguel.quilometragemFinal != null && aluguel.quilometragemFinal < aluguel.quilometragemInicial) {
        mostrarErroForm('A quilometragem final não pode ser menor que a inicial.');
        return;
    }
    try {
        if (id) {
            aluguel.id = Number(id);
            await enviar(`alugueis/${id}`, 'PUT', aluguel);
            aviso('Aluguel atualizado.');
        } else {
            await enviar('alugueis', 'POST', aluguel);
            aviso('Aluguel registrado.');
        }
        bootstrap.Offcanvas.getOrCreateInstance('#gaveta').hide();
        getAlugueis();
    } catch (erro) {
        mostrarErroForm(erro.message);
    }
});

function excluirAluguel(id) {
    let a = alugueis.find(x => x.id === id);
    confirmarExclusao('Excluir este aluguel?',
        `O aluguel #${a.id} de ${nomeCliente(a.clienteId)} (${nomeVeiculo(a.veiculoId)}) será removido do banco. Essa ação não pode ser desfeita.`,
        `alugueis/${id}`, getAlugueis);
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarAlugueis(); });
document.querySelector('#filtroCliente').addEventListener('input', mostrarAlugueis);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarAlugueis();
}

getAlugueis();
