var database = require("../database/config");

function buscarGraficos(estado) {

    console.log("Buscando dados dos gráficos do estado:", estado);

    var instrucaoSqlLinha = `
        SELECT
            HOUR(m.dataHora) AS hora,
            AVG(m.umidade) AS mediaUmidade
        FROM medida m
        INNER JOIN estado e
            ON m.fkEstado = e.idEstado
        WHERE e.uf = '${estado}'
        AND DATE(m.dataHora) = (
            SELECT DATE(MAX(dataHora))
            FROM medida
        )
        GROUP BY HOUR(m.dataHora)
        ORDER BY hora ASC;
    `;

    var instrucaoSqlBarra = `
        SELECT
            WEEK(m.dataHora) AS semana,
            AVG(m.umidade) AS mediaUmidade
        FROM medida m
        INNER JOIN estado e
            ON m.fkEstado = e.idEstado
        WHERE e.uf = '${estado}'
        GROUP BY WEEK(m.dataHora)
        ORDER BY WEEK(m.dataHora);
    `;

    console.log("Executando SQL linha:");
    console.log(instrucaoSqlLinha);

    console.log("Executando SQL barras:");
    console.log(instrucaoSqlBarra);

    return Promise.all([
        database.executar(instrucaoSqlLinha),
        database.executar(instrucaoSqlBarra)
    ]).then(function(resultado) {
        return {
            linha: resultado[0],
            barras: resultado[1]
        };
    });

}

module.exports = {
    buscarGraficos
};