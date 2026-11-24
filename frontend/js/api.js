// Endereço da API do TP1 (dotnet run --launch-profile http)
const url = 'http://localhost:5210/api';

// GET: busca uma lista ou um item na API
async function buscar(rota) {
    let data = await fetch(`${url}/${rota}`);
    if (!data.ok) throw new Error(await lerErro(data));
    let response = await data.json();
    return response;
}

// POST, PUT e DELETE: envia dados para a API
async function enviar(rota, metodo, corpo) {
    let opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    if (corpo) opcoes.body = JSON.stringify(corpo);
    let data = await fetch(`${url}/${rota}`, opcoes);
    if (!data.ok) throw new Error(await lerErro(data));
    if (data.status === 204) return null;
    return await data.json();
}

// Transforma a resposta de erro da API (texto ou ModelState) em mensagem legível
async function lerErro(data) {
    let texto = await data.text();
    try {
        let json = JSON.parse(texto);
        if (json.errors) return Object.values(json.errors).flat().join('\n');
        if (json.title) return json.title;
        return texto;
    } catch {
        return texto || `Erro ${data.status}`;
    }
}

// ---------- Formatação ----------
function dinheiro(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function km(valor) {
    return Number(valor || 0).toLocaleString('pt-BR') + ' km';
}
function dataBR(valor) {
    if (!valor) return '—';
    let [ano, mes, dia] = valor.substring(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
}
function dataInput(valor) {
    return valor ? valor.substring(0, 10) : '';
}
function paraApi(dataDoInput) {
    return dataDoInput ? `${dataDoInput}T00:00:00` : null;
}
function hoje() {
    return new Date().toISOString().substring(0, 10);
}
function contem(texto, busca) {
    return (texto || '').toString().toLowerCase().includes(busca.trim().toLowerCase());
}
function seguro(texto) {
    let div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// ---------- Avisos, gaveta e exclusão ----------
function aviso(mensagem) {
    let el = document.querySelector('#aviso');
    el.textContent = mensagem;
    el.classList.add('mostrar');
    clearTimeout(el.timer);
    el.timer = setTimeout(() => el.classList.remove('mostrar'), 2800);
}

function mostrarErroForm(mensagem) {
    let el = document.querySelector('#erroForm');
    el.textContent = mensagem;
    el.classList.toggle('d-none', !mensagem);
}

let acaoExcluir = null;
function confirmarExclusao(titulo, descricao, rota, depois) {
    document.querySelector('#excluirTitulo').textContent = titulo;
    document.querySelector('#excluirTexto').textContent = descricao;
    document.querySelector('#excluirRota').textContent = `DELETE /api/${rota}`;
    acaoExcluir = async () => {
        try {
            await enviar(rota, 'DELETE');
            aviso('Registro excluído.');
            depois();
        } catch (e) {
            aviso('Não foi possível excluir: ' + e.message);
        }
    };
    bootstrap.Modal.getOrCreateInstance('#modalExcluir').show();
}

document.addEventListener('click', async (e) => {
    if (e.target.id === 'btnConfirmarExcluir' && acaoExcluir) {
        bootstrap.Modal.getOrCreateInstance('#modalExcluir').hide();
        await acaoExcluir();
        acaoExcluir = null;
    }
});
