var database = require("../database/config");

function buscarKPIs(regiao) {

    // A query agora cria uma "tabela virtual" (ultimas) contendo apenas
    // o registro mais recente de cada estado da região solicitada.
    var instrucaoSql = `
        SELECT 
            MAX(ultimas.umidadeAtual) AS umidadeMaxima,
            MIN(ultimas.umidadeAtual) AS umidadeMinima,
            COUNT(CASE WHEN ultimas.umidadeAtual < 12 THEN 1 END) AS estadosCriticos
        FROM (
            SELECT 
                (
                    SELECT m.umidade 
                    FROM medida m 
                    WHERE m.fkEstado = e.idEstado 
                    ORDER BY m.dataHora DESC 
                    LIMIT 1
                ) AS umidadeAtual
            FROM estado e
            INNER JOIN regiao r 
                ON e.fkRegiao = r.idRegiao
            WHERE r.nomeRegiao = '${regiao}'
        ) AS ultimas
        WHERE ultimas.umidadeAtual IS NOT NULL;
    `;

    console.log("Executando SQL KPIs em tempo real:");
    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKPIs
};