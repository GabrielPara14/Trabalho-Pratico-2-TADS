// Fabricantes: listar, filtrar, cadastrar, editar e excluir (rota /api/fabricantes)
let fabricantes = [];
let veiculos = [];

async function getFabricantes() {
    try {
        // a frota de cada fabricante vem da rota de veículos (que já traz o FabricanteId)
        [fabricantes, veiculos] = await Promise.all([buscar('fabricantes'), buscar('veiculos')]);
        mostrarFabricantes();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="4" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

function frota(fabricante) {
    return veiculos.filter(v => v.fabricanteId === fabricante.id).length;
}

function mostrarFabricantes() {
    let nome = document.querySelector('#filtroNome').value;
    let situacao = document.querySelector('#filtroFrota').value;
    let ordem = document.querySelector('#filtroOrdem').value;

    let filtrados = fabricantes.filter(f =>
        contem(f.nome, nome) &&
        (situacao === '' || (situacao === 'com' ? frota(f) > 0 : frota(f) === 0))
    );
    if (ordem === 'nome') filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    if (ordem === 'frota') filtrados.sort((a, b) => frota(b) - frota(a));
    if (ordem === 'id') filtrados.sort((a, b) => a.id - b.id);

    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    document.querySelector('#contador').textContent = `${filtrados.length} de ${fabricantes.length} registros`;

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum fabricante encontrado.</td></tr>';
        return;
    }
    for (let f of filtrados) {
        lista.innerHTML += `
            <tr>
                <td>#${f.id}</td>
                <td><strong>${seguro(f.nome)}</strong></td>
                <td><span class="tag">${frota(f)} veículo(s)</span></td>
                <td class="acoes">
                    <button class="btn-link-texto" onclick="editarFabricante(${f.id})">Editar</button>
                    <button class="btn-link-texto perigo" onclick="excluirFabricante(${f.id})">Excluir</button>
                </td>
            </tr>`;
    }
}

function novoFabricante() {
    document.querySelector('#formFabricante').reset();
    document.querySelector('#id').value = '';
    document.querySelector('#tituloGaveta').textContent = 'Novo fabricante';
    document.querySelector('#dicaGaveta').textContent = 'Salvar envia POST /api/fabricantes.';
    mostrarErroForm('');
    bootstrap.Offcanvas.getOrCreateInstance('#gaveta').show();
}

async function editarFabricante(id) {
    let f = await buscar(`fabricantes/${id}`);
    document.querySelector('#id').value = f.id;
    document.querySelector('#nome').value = f.nome;
    document.querySelector('#tituloGaveta').textContent = 'Editar fabricante';
    document.querySelector('#dicaGaveta').textContent = `Salvar envia PUT /api/fabricantes/${id}.`;
    mostrarErroForm('');
    bootstrap.Offcanvas.getOrCreateInstance('#gaveta').show();
}

document.querySelector('#formFabricante').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.querySelector('#id').value;
    let fabricante = { nome: document.querySelector('#nome').value.trim() };
    try {
        if (id) {
            fabricante.id = Number(id);
            await enviar(`fabricantes/${id}`, 'PUT', fabricante);
            aviso('Fabricante atualizado.');
        } else {
            await enviar('fabricantes', 'POST', fabricante);
            aviso('Fabricante cadastrado.');
        }
        bootstrap.Offcanvas.getOrCreateInstance('#gaveta').hide();
        getFabricantes();
    } catch (erro) {
        mostrarErroForm(erro.message);
    }
});

function excluirFabricante(id) {
    let f = fabricantes.find(x => x.id === id);
    let extra = frota(f) > 0 ? ` Os ${frota(f)} veículo(s) dele também serão removidos.` : '';
    confirmarExclusao('Excluir este fabricante?', `${f.nome} será removido do banco.${extra} Essa ação não pode ser desfeita.`,
        `fabricantes/${id}`, getFabricantes);
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarFabricantes(); });
document.querySelector('#filtroNome').addEventListener('input', mostrarFabricantes);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarFabricantes();
}

getFabricantes();
