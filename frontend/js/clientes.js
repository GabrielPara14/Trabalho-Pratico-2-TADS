// Clientes: listar, filtrar, cadastrar, editar e excluir (rota /api/clientes)
let clientes = [];
let alugueis = [];

async function getClientes() {
    try {
        [clientes, alugueis] = await Promise.all([buscar('clientes'), buscar('alugueis')]);
        mostrarClientes();
    } catch (e) {
        document.querySelector('#lista').innerHTML = `<tr><td colspan="5" class="vazio">Erro ao carregar: ${seguro(e.message)}</td></tr>`;
    }
}

function qtdAlugueis(cliente) {
    return alugueis.filter(a => a.clienteId === cliente.id).length;
}

// Coloca pontos e traço no CPF enquanto digita
document.querySelector('#cpf').addEventListener('input', (e) => {
    let n = e.target.value.replace(/\D/g, '').substring(0, 11);
    e.target.value = n.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
});

function mostrarClientes() {
    let nome = document.querySelector('#filtroNome').value;
    let cpf = document.querySelector('#filtroCpf').value.replace(/\D/g, '');
    let email = document.querySelector('#filtroEmail').value;
    let historico = document.querySelector('#filtroAluguel').value;

    let filtrados = clientes.filter(c =>
        contem(c.nome, nome) &&
        c.cpf.replace(/\D/g, '').includes(cpf) &&
        contem(c.email, email) &&
        (historico === '' || (historico === 'com' ? qtdAlugueis(c) > 0 : qtdAlugueis(c) === 0))
    );
    filtrados.sort((a, b) => a.nome.localeCompare(b.nome));

    let lista = document.querySelector('#lista');
    lista.innerHTML = '';
    document.querySelector('#contador').textContent = `${filtrados.length} de ${clientes.length} registros`;

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum cliente encontrado.</td></tr>';
        return;
    }
    for (let c of filtrados) {
        lista.innerHTML += `
            <tr>
                <td><strong>${seguro(c.nome)}</strong></td>
                <td>${seguro(c.cpf)}</td>
                <td>${seguro(c.email)}</td>
                <td><span class="tag">${qtdAlugueis(c)}</span></td>
                <td class="acoes">
                    <button class="btn-link-texto" onclick="editarCliente(${c.id})">Editar</button>
                    <button class="btn-link-texto perigo" onclick="excluirCliente(${c.id})">Excluir</button>
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

function novoCliente() {
    document.querySelector('#formCliente').reset();
    document.querySelector('#id').value = '';
    abrirGaveta('Novo cliente', 'Salvar envia POST /api/clientes.');
}

async function editarCliente(id) {
    let c = await buscar(`clientes/${id}`);
    document.querySelector('#id').value = c.id;
    document.querySelector('#nome').value = c.nome;
    document.querySelector('#cpf').value = c.cpf;
    document.querySelector('#email').value = c.email;
    abrirGaveta('Editar cliente', `Salvar envia PUT /api/clientes/${id}.`);
}

document.querySelector('#formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    let id = document.querySelector('#id').value;
    let cliente = {
        nome: document.querySelector('#nome').value.trim(),
        cpf: document.querySelector('#cpf').value.trim(),
        email: document.querySelector('#email').value.trim()
    };
    // o CPF é único no banco: avisa antes de mandar para a API
    let repetido = clientes.find(c => c.cpf === cliente.cpf && c.id !== Number(id));
    if (repetido) {
        mostrarErroForm(`Já existe um cliente com esse CPF (${repetido.nome}).`);
        return;
    }
    try {
        if (id) {
            cliente.id = Number(id);
            await enviar(`clientes/${id}`, 'PUT', cliente);
            aviso('Cliente atualizado.');
        } else {
            await enviar('clientes', 'POST', cliente);
            aviso('Cliente cadastrado.');
        }
        bootstrap.Offcanvas.getOrCreateInstance('#gaveta').hide();
        getClientes();
    } catch (erro) {
        mostrarErroForm(erro.message);
    }
});

function excluirCliente(id) {
    let c = clientes.find(x => x.id === id);
    confirmarExclusao('Excluir este cliente?',
        `${c.nome} (CPF ${c.cpf}) será removido do banco, junto com seus aluguéis. Essa ação não pode ser desfeita.`,
        `clientes/${id}`, getClientes);
}

document.querySelector('#formFiltros').addEventListener('submit', (e) => { e.preventDefault(); mostrarClientes(); });
document.querySelector('#filtroNome').addEventListener('input', mostrarClientes);

function limparFiltros() {
    document.querySelector('#formFiltros').reset();
    mostrarClientes();
}

getClientes();
