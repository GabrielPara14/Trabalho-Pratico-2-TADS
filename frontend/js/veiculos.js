// Veículos: listar, filtrar, cadastrar, editar e excluir (rota /api/veiculos)
let veiculos = [];
let fabricantes = [];

async function getVeiculos() {
    try {
        [veiculos, fabricantes] = await Promise.all([buscar('veiculos'), buscar('fabricantes')]);
        preencherFabricantes();
        mostrarVeiculos();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="6" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

// Preenche os selects de fabricante (filtro e formulário) com os dados da API
function preencherFabricantes() {
    let filtro = document.querySelector('#filtroFabricante');
    let escolhido = filtro.value;
    filtro.innerHTML = '<option value="">Todos</option>';
    let form = document.querySelector('#fabricanteId');
    form.innerHTML = '<option value="">Selecione</option>';
    for (let f of fabricantes) {
        filtro.innerHTML += `<option value="${f.id}">${seguro(f.nome)}</option>`;
        form.innerHTML += `<option value="${f.id}">${seguro(f.nome)}</option>`;
    }
    filtro.value = escolhido;
}

function nomeFabricante(id) {
    let f = fabricantes.find(x => x.id === id);
    return f ? f.nome : '—';
}

function mostrarVeiculos() {
    let texto = document.querySelector('#filtroTexto').value;
    let fabricante = document.querySelector('#filtroFabricante').value;
    let anoMin = Number(document.querySelector('#filtroAnoMin').value) || 0;
    let anoMax = Number(document.querySelector('#filtroAnoMax').value) || 9999;
    let kmMax = document.querySelector('#filtroKm').value;

    let filtrados = veiculos.filter(v =>
        (contem(v.modelo, texto) || contem(v.placa, texto)) &&
        (fabricante === '' || v.fabricanteId === Number(fabricante)) &&
        v.anoFabricacao >= anoMin && v.anoFabricacao <= anoMax &&
        (kmMax === '' || v.quilometragem <= Number(kmMax))
    );

    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    document.querySelector('#contador').textContent = `${filtrados.length} de ${veiculos.length} registros`;

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum veículo encontrado.</td></tr>';
        return;
    }
    for (let v of filtrados) {
        lista.innerHTML += `
            <tr>
                <td><strong>${seguro(v.modelo)}</strong></td>
                <td><span class="tag">${seguro(v.placa)}</span></td>
                <td>${seguro(nomeFabricante(v.fabricanteId))}</td>
                <td>${v.anoFabricacao}</td>
                <td>${km(v.quilometragem)}</td>
                <td class="acoes">
                    <button class="btn-link-texto" onclick="editarVeiculo(${v.id})">Editar</button>
                    <button class="btn-link-texto perigo" onclick="excluirVeiculo(${v.id})">Excluir</button>
                </td>
            </tr>`;
    }
}

function abrirGaveta(titulo, dica) {
    document.querySelector('#tituloGaveta').textContent = titulo;
    document.querySelector('#dicaGaveta').textContent = dica;
    mostrarErroForm('');
    bootstrap.Offcanvas.getOrCreateInstance('#gaveta').show();
}

function novoVeiculo() {
    document.querySelector('#formVeiculo').reset();
    document.querySelector('#id').value = '';
    document.querySelector('#anoFabricacao').value = new Date().getFullYear();
    abrirGaveta('Novo veículo', 'Salvar envia POST /api/veiculos.');
}

async function editarVeiculo(id) {
    let v = await buscar(`veiculos/${id}`);
    document.querySelector('#id').value = v.id;
    document.querySelector('#modelo').value = v.modelo;
    document.querySelector('#placa').value = v.placa;
    document.querySelector('#anoFabricacao').value = v.anoFabricacao;
    document.querySelector('#quilometragem').value = v.quilometragem;
    document.querySelector('#fabricanteId').value = v.fabricanteId;
    abrirGaveta('Editar veículo', `Salvar envia PUT /api/veiculos/${id}.`);
}

document.querySelector('#formVeiculo').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.querySelector('#id').value;
    let veiculo = {
        modelo: document.querySelector('#modelo').value.trim(),
        placa: document.querySelector('#placa').value.trim().toUpperCase(),
        anoFabricacao: Number(document.querySelector('#anoFabricacao').value),
        quilometragem: Number(document.querySelector('#quilometragem').value),
        fabricanteId: Number(document.querySelector('#fabricanteId').value)
    };
    try {
        if (id) {
            veiculo.id = Number(id);
            await enviar(`veiculos/${id}`, 'PUT', veiculo);
            aviso('Veículo atualizado.');
        } else {
            await enviar('veiculos', 'POST', veiculo);
            aviso('Veículo cadastrado.');
        }
        bootstrap.Offcanvas.getOrCreateInstance('#gaveta').hide();
        getVeiculos();
    } catch (erro) {
        mostrarErroForm(erro.message);
    }
});

function excluirVeiculo(id) {
    let v = veiculos.find(x => x.id === id);
    confirmarExclusao('Excluir este veículo?',
        `O ${v.modelo} (${v.placa}) será removido do banco, junto com seus aluguéis e manutenções. Essa ação não pode ser desfeita.`,
        `veiculos/${id}`, getVeiculos);
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarVeiculos(); });
document.querySelector('#filtroTexto').addEventListener('input', mostrarVeiculos);
document.querySelector('#filtroFabricante').addEventListener('change', mostrarVeiculos);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarVeiculos();
}

getVeiculos();
