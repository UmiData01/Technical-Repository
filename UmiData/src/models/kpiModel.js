var database = require("../database/config");

function buscarKPIs(regiao) {
    console.log("Buscando KPIs baseados na MÉDIA dos estados da região:", regiao);

    var instrucaoSql = `
        SELECT 
        MAX(ultimaUmidade) AS umidadeMaxima,
        MIN(ultimaUmidade) AS umidadeMinima,
        SUM(CASE WHEN ultimaUmidade < 12 THEN 1 ELSE 0 END) AS estadosCriticos,
        COALESCE((
            SELECT SUM(ri.qtdInternacoes)
            FROM registro_internacao ri
            INNER JOIN regiao r2 ON ri.fkRegiao = r2.idRegiao
            WHERE r2.nomeRegiao = '${regiao}'
        ), 0) AS totalInternacoes
        FROM (
            SELECT 
                e.idEstado,
                COALESCE((
                    SELECT m.umidade
                    FROM medida m
                    WHERE m.fkEstado = e.idEstado
                    AND m.idMedida = (
                        SELECT MAX(m2.idMedida)
                        FROM medida m2
                        WHERE m2.fkEstado = e.idEstado
                    )
                ), 0) AS ultimaUmidade
            FROM estado e
            INNER JOIN regiao r ON e.fkRegiao = r.idRegiao
            WHERE r.nomeRegiao = '${regiao}'
        ) AS UltimasUmidades
    `;

    console.log("Executando SQL KPIs:\n", instrucaoSql);

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKPIs
};