// Manutenções: listar, filtrar, registrar, editar e excluir (rota /api/manutencoes)
let manutencoes = [];
let veiculos = [];

async function getManutencoes() {
    try {
        [manutencoes, veiculos] = await Promise.all([buscar('manutencoes'), buscar('veiculos')]);
        preencherVeiculos();
        mostrarManutencoes();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="6" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

function preencherVeiculos() {
    let filtro = document.querySelector('#filtroVeiculo');
    let escolhido = filtro.value;
    filtro.innerHTML = '<option value="">Todos</option>';
    let form = document.querySelector('#veiculoId');
    form.innerHTML = '<option value="">Selecione</option>';
    for (let v of veiculos) {
        filtro.innerHTML += `<option value="${v.id}">${seguro(v.modelo)} (${seguro(v.placa)})</option>`;
        form.innerHTML += `<option value="${v.id}">${seguro(v.modelo)} (${seguro(v.placa)})</option>`;
    }
    filtro.value = escolhido;
}

function nomeVeiculo(id) { let v = veiculos.find(x => x.id === id); return v ? `${v.modelo} (${v.placa})` : '—'; }

function mostrarManutencoes() {
    let veiculo = document.querySelector('#filtroVeiculo').value;
    let descricao = document.querySelector('#filtroDescricao').value;
    let min = document.querySelector('#filtroValorMin').value;
    let max = document.querySelector('#filtroValorMax').value;
    let de = document.querySelector('#filtroDe').value;
    let ate = document.querySelector('#filtroAte').value;

    let filtrados = manutencoes.filter(m =>
        (veiculo === '' || m.veiculoId === Number(veiculo)) &&
        contem(m.descricao, descricao) &&
        (min === '' || m.valorGasto >= Number(min)) &&
        (max === '' || m.valorGasto <= Number(max)) &&
        (de === '' || dataInput(m.dataManutencao) >= de) &&
        (ate === '' || dataInput(m.dataManutencao) <= ate)
    );
    filtrados.sort((a, b) => b.dataManutencao.localeCompare(a.dataManutencao));

    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    document.querySelector('#contador').textContent = `${filtrados.length} de ${manutencoes.length} registros`;
    let total = filtrados.reduce((soma, m) => soma + m.valorGasto, 0);
    document.querySelector('#totalGasto').textContent = `${dinheiro(total)} gastos`;

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma manutenção encontrada.</td></tr>';
        return;
    }
    for (let m of filtrados) {
        lista.innerHTML += `
            <tr>
                <td>${dataBR(m.dataManutencao)}</td>
                <td><strong>${seguro(nomeVeiculo(m.veiculoId))}</strong></td>
                <td>${seguro(m.descricao)}</td>
                <td>${km(m.quilometragemNaManutencao)}</td>
                <td>${dinheiro(m.valorGasto)}</td>
                <td class="acoes">
                    <button class="btn-link-texto" onclick="editarManutencao(${m.id})">Editar</button>
                    <button class="btn-link-texto perigo" onclick="excluirManutencao(${m.id})">Excluir</button>
                </td>
            </tr>`;
    }
}

// Ao escolher o veículo, sugere a quilometragem atual dele
document.querySelector('#veiculoId').addEventListener('change', (e) => {
    let v = veiculos.find(x => x.id === Number(e.target.value));
    if (v && !document.querySelector('#id').value) document.querySelector('#quilometragemNaManutencao').value = v.quilometragem;
});

function abrirGaveta(titulo, dica) {
    document.querySelector('#tituloGaveta').textContent = titulo;
    document.querySelector('#dicaGaveta').textContent = dica;
    mostrarErroForm('');
    bootstrap.Offcanvas.getOrCreateInstance('#gaveta').show();
}

function novaManutencao() {
    document.querySelector('#formManutencao').reset();
    document.querySelector('#id').value = '';
    document.querySelector('#dataManutencao').value = hoje();
    abrirGaveta('Nova manutenção', 'Salvar envia POST /api/manutencoes.');
}

async function editarManutencao(id) {
    let m = await buscar(`manutencoes/${id}`);
    document.querySelector('#id').value = m.id;
    document.querySelector('#veiculoId').value = m.veiculoId;
    document.querySelector('#descricao').value = m.descricao;
    document.querySelector('#dataManutencao').value = dataInput(m.dataManutencao);
    document.querySelector('#valorGasto').value = m.valorGasto;
    document.querySelector('#quilometragemNaManutencao').value = m.quilometragemNaManutencao;
    abrirGaveta('Editar manutenção', `Salvar envia PUT /api/manutencoes/${id}.`);
}

document.querySelector('#formManutencao').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.querySelector('#id').value;
    let manutencao = {
        veiculoId: Number(document.querySelector('#veiculoId').value),
        descricao: document.querySelector('#descricao').value.trim(),
        dataManutencao: paraApi(document.querySelector('#dataManutencao').value),
        valorGasto: Number(document.querySelector('#valorGasto').value),
        quilometragemNaManutencao: Number(document.querySelector('#quilometragemNaManutencao').value)
    };
    try {
        if (id) {
            manutencao.id = Number(id);
            await enviar(`manutencoes/${id}`, 'PUT', manutencao);
            aviso('Manutenção atualizada.');
        } else {
            await enviar('manutencoes', 'POST', manutencao);
            aviso('Manutenção registrada.');
        }
        bootstrap.Offcanvas.getOrCreateInstance('#gaveta').hide();
        getManutencoes();
    } catch (erro) {
        mostrarErroForm(erro.message);
    }
});

function excluirManutencao(id) {
    let m = manutencoes.find(x => x.id === id);
    confirmarExclusao('Excluir esta manutenção?',
        `"${m.descricao}" em ${nomeVeiculo(m.veiculoId)} será removida do banco. Essa ação não pode ser desfeita.`,
        `manutencoes/${id}`, getManutencoes);
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarManutencoes(); });
document.querySelector('#filtroDescricao').addEventListener('input', mostrarManutencoes);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarManutencoes();
}

getManutencoes();
