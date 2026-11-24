// Monta a barra lateral, a barra do topo, o diálogo de exclusão e o aviso em todas as páginas
const paginas = [
    { id: 'inicio', nome: 'Início', arquivo: 'index.html', letra: 'In', grupo: 'GERAL' },
    { id: 'fabricantes', nome: 'Fabricantes', arquivo: 'fabricantes.html', letra: 'Fa', grupo: 'CADASTROS' },
    { id: 'veiculos', nome: 'Veículos', arquivo: 'veiculos.html', letra: 'Ve' },
    { id: 'clientes', nome: 'Clientes', arquivo: 'clientes.html', letra: 'Cl' },
    { id: 'alugueis', nome: 'Aluguéis', arquivo: 'alugueis.html', letra: 'Al' },
    { id: 'manutencoes', nome: 'Manutenções', arquivo: 'manutencoes.html', letra: 'Ma' },
    { id: 'relatorios', nome: 'Relatórios', arquivo: 'relatorios.html', letra: 'Re', grupo: 'ANÁLISES' }
];

function montarLayout() {
    let atual = document.body.dataset.pagina;
    let pagina = paginas.find(p => p.id === atual);

    let sidebar = document.querySelector('#sidebar');
    sidebar.innerHTML = `<div class="marca"><span class="marca-icone">A</span> AutoGiro</div>`;
    for (let p of paginas) {
        if (p.grupo) sidebar.innerHTML += `<div class="menu-titulo">${p.grupo}</div>`;
        sidebar.innerHTML += `
            <a class="menu-item ${p.id === atual ? 'ativo' : ''}" href="${p.arquivo}">
                <span class="icone">${p.letra}</span> ${p.nome}
            </a>`;
    }
    sidebar.innerHTML += `
        <div class="usuario">
            <span class="avatar">G</span>
            <div><strong>Gabriel Pará</strong><small>Trabalho Prático 2</small></div>
        </div>`;

    let grupo = atual === 'inicio' ? '' : (atual === 'relatorios' ? 'Análises  /  ' : 'Cadastros  /  ');
    document.querySelector('#topbar').innerHTML = `
        <span>Locadora  /  ${grupo}${pagina.nome}</span>
        <span class="status-api" id="statusApi"><span class="ponto"></span> verificando API...</span>`;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal fade dialogo" id="modalExcluir" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered" style="max-width:420px">
            <div class="modal-content">
              <div class="icone-alerta">!</div>
              <h3 id="excluirTitulo">Excluir?</h3>
              <p id="excluirTexto"></p>
              <code id="excluirRota"></code>
              <div class="d-flex justify-content-center gap-2 mt-4">
                <button class="btn-contorno" data-bs-dismiss="modal">Cancelar</button>
                <button class="btn-cheio" id="btnConfirmarExcluir">Sim, excluir</button>
              </div>
            </div>
          </div>
        </div>
        <div class="aviso" id="aviso"></div>`);

    verificarApi();
}

async function verificarApi() {
    let el = document.querySelector('#statusApi');
    try {
        await fetch(`${url}/fabricantes`);
        el.classList.add('online');
        el.innerHTML = '<span class="ponto"></span> API conectada';
    } catch {
        el.innerHTML = '<span class="ponto"></span> API desligada — rode o back-end';
    }
}

montarLayout();
