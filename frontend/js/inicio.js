// Início: painel com os totais de cada entidade, aluguéis em aberto e atividade recente
async function getPainel() {
    try {
        let [fabricantes, veiculos, clientes, alugueis, manutencoes] = await Promise.all(
            ['fabricantes', 'veiculos', 'clientes', 'alugueis', 'manutencoes'].map(rota => buscar(rota)));

        let abertos = alugueis.filter(a => !a.dataDevolucao);
        let gasto = manutencoes.reduce((t, m) => t + m.valorGasto, 0);

        let kpis = [
            [fabricantes.length, 'Fabricantes', 'marcas cadastradas', 'fabricantes.html'],
            [veiculos.length, 'Veículos', 'na frota', 'veiculos.html'],
            [clientes.length, 'Clientes', 'cadastrados', 'clientes.html'],
            [abertos.length, 'Aluguéis', `em aberto de ${alugueis.length}`, 'alugueis.html'],
            [manutencoes.length, 'Manutenções', `${dinheiro(gasto)} gastos`, 'manutencoes.html']
        ];
        let el = document.querySelector('#kpis');
        el.innerHTML = '';
        for (let [numero, rotulo, detalhe, link] of kpis) {
            el.innerHTML += `
                <a class="card-cinza kpi text-reset text-decoration-none" href="${link}">
                    <div class="numero">${String(numero).padStart(2, '0')}</div>
                    <div class="rotulo">${rotulo}</div>
                    <div class="detalhe">${detalhe}</div>
                </a>`;
        }

        let lista = document.querySelector('#emAberto');
        lista.innerHTML = abertos.length ? '' : '<p class="vazio">Nenhum aluguel em aberto.</p>';
        for (let a of abertos.sort((x, y) => x.dataFimPrevista.localeCompare(y.dataFimPrevista))) {
            let cliente = clientes.find(c => c.id === a.clienteId);
            let veiculo = veiculos.find(v => v.id === a.veiculoId);
            let atrasado = dataInput(a.dataFimPrevista) < hoje();
            lista.innerHTML += `
                <div class="item-aberto">
                    <span class="avatar">${seguro((cliente?.nome || '?')[0])}</span>
                    <div class="flex-grow-1">
                        <strong>${seguro(cliente?.nome)}</strong>
                        <div class="text-secondary small fw-semibold">${seguro(veiculo?.modelo)} • devolve em ${dataBR(a.dataFimPrevista)}</div>
                    </div>
                    <span class="tag ${atrasado ? '' : 'escura'}">${atrasado ? 'Atrasado' : 'Em aberto'}</span>
                </div>`;
        }

        // atividade recente: aluguéis e manutenções mais novos pela data
        let eventos = [
            ...alugueis.map(a => ({ data: a.dataDevolucao || a.dataInicio,
                texto: a.dataDevolucao ? `Aluguel #${a.id} devolvido (${veiculos.find(v => v.id === a.veiculoId)?.modelo ?? ''})`
                                       : `Aluguel #${a.id} aberto para ${clientes.find(c => c.id === a.clienteId)?.nome ?? ''}` })),
            ...manutencoes.map(m => ({ data: m.dataManutencao, texto: `Manutenção no ${veiculos.find(v => v.id === m.veiculoId)?.modelo ?? ''}: ${m.descricao}` }))
        ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);

        let atividade = document.querySelector('#atividade');
        atividade.innerHTML = eventos.length ? '' : '<p class="vazio">Sem movimentações ainda.</p>';
        for (let e of eventos) {
            atividade.innerHTML += `
                <div class="evento"><span class="bolinha"></span><span>${seguro(e.texto)}</span><span class="quando">${dataBR(e.data)}</span></div>`;
        }
    } catch (e) {
        document.querySelector('#kpis').innerHTML = `<div class="card-cinza vazio" style="grid-column:1/-1">Não foi possível falar com a API: ${seguro(e.message)}</div>`;
    }
}

getPainel();
