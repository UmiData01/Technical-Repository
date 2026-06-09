var database = require("../database/config");

function buscarEstadosPorRegiao(regiao, nomeEmpresa) {
    var instrucaoSql = `
        SELECT 
            e.idEstado,
            e.nomeEstado AS nome,
            e.uf AS sigla,
            e.fkEmpresa,
            COALESCE((
                SELECT m.umidade 
                FROM medida m 
                WHERE m.fkEstado = e.idEstado
                ORDER BY m.dataHora DESC 
                LIMIT 1                    
            ), 0) AS umidade
        FROM estado e
        INNER JOIN regiao r ON e.fkRegiao = r.idRegiao
        LEFT JOIN empresas_governamentais eg ON e.fkEmpresa = eg.idEmpresa
        WHERE r.nomeRegiao = '${regiao}'
        AND (eg.nomeEmpresa = '${nomeEmpresa}' OR e.fkEmpresa IS NULL);
    `;

    return database.executar(instrucaoSql);
}

function cadastrarEstado(idEstado, nomeEstado, uf, nomeRegiao, nomeEmpresa) {

    var instrucaoSql = `
        INSERT INTO estado (idEstado, nomeEstado, uf, fkRegiao, fkEmpresa)
        VALUES (
            ${idEstado}, 
            '${nomeEstado}', 
            '${uf}', 
            (SELECT idRegiao FROM regiao WHERE nomeRegiao = '${nomeRegiao}'),
            (SELECT idEmpresa FROM empresas_governamentais WHERE nomeEmpresa = '${nomeEmpresa}')
        )
        ON DUPLICATE KEY UPDATE 
            fkEmpresa = VALUES(fkEmpresa);
    `;

    return database.executar(instrucaoSql);
}

function deletarEstado(uf) {
    var instrucaoSql = `DELETE FROM estado WHERE uf = '${uf}';`;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarEstadosPorRegiao,
    cadastrarEstado,
    deletarEstado
};