var database = require("../database/config");

function buscarKPIs(regiao) {
    console.log("Buscando KPIs baseados na MÉDIA dos estados da região:", regiao);

    // Usamos uma Subquery (tabela virtual) para primeiro calcular as médias,
    // e depois extrair os valores Máximos, Mínimos e Críticos dessa tabela.
    var instrucaoSql = `
        SELECT 
            MAX(umidadeMedia) AS umidadeMaxima,
            MIN(umidadeMedia) AS umidadeMinima,
            SUM(CASE WHEN umidadeMedia < 12 THEN 1 ELSE 0 END) AS estadosCriticos
        FROM (
            SELECT 
                e.idEstado,
                COALESCE(ROUND(AVG(m.umidade), 1), 0) AS umidadeMedia
            FROM estado e
            INNER JOIN regiao r ON e.fkRegiao = r.idRegiao
            LEFT JOIN medida m ON m.fkEstado = e.idEstado
            WHERE r.nomeRegiao = '${regiao}'
            GROUP BY e.idEstado
        ) AS MediasEstados;
    `;

    console.log("Executando SQL KPIs:\n", instrucaoSql);

    return database.executar(instrucaoSql);
}

// Lembre-se de verificar se o nome da função no seu arquivo bate com `buscarKPIs`!
module.exports = {
    buscarKPIs
};