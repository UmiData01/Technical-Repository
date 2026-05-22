var database = require("../database/config");

function buscarEstadosPorRegiao(regiao) {
    console.log("Buscando estados da região (MÉDIA):", regiao);

    var instrucaoSql = `
        SELECT 
            e.idEstado,
            e.nomeEstado AS nome,
            e.uf AS sigla,
            COALESCE((
                SELECT ROUND(AVG(m.umidade), 1) 
                FROM medida m 
                WHERE m.fkEstado = e.idEstado 
            ), 0) AS umidade
        FROM estado e
        INNER JOIN regiao r 
            ON e.fkRegiao = r.idRegiao
        WHERE r.nomeRegiao = '${regiao}';
    `;

    console.log("Executando SQL Estados:\n", instrucaoSql);

    return database.executar(instrucaoSql);
}

function cadastrarEstado(idEstado, nomeEstado, uf, nomeRegiao) {
    console.log("Inserindo novo estado:", nomeEstado);

    var instrucaoSql = `
        INSERT INTO estado (idEstado, nomeEstado, uf, fkRegiao)
        VALUES (
            ${idEstado}, 
            '${nomeEstado}', 
            '${uf}', 
            (SELECT idRegiao FROM regiao WHERE nomeRegiao = '${nomeRegiao}')
        );
    `;

    console.log("Executando SQL Cadastro:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarEstadosPorRegiao,
    cadastrarEstado 
};