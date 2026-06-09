var database = require("../database/config");

function buscarGraficos(estado) {

    console.log("Buscando dados dos gráficos do estado:", estado);

    var instrucaoSqlLinha = `
        SELECT
            HOUR(m.dataHora) AS hora,
            m.umidade AS mediaUmidade
        FROM medida m
        INNER JOIN estado e ON m.fkEstado = e.idEstado
        WHERE e.uf = '${estado}'
        AND DATE(m.dataHora) = (
            SELECT DATE(m2.dataHora)
            FROM medida m2
            INNER JOIN estado e2 ON m2.fkEstado = e2.idEstado
            WHERE e2.uf = '${estado}'
            ORDER BY m2.idMedida DESC
            LIMIT 1
        )
        AND m.idMedida IN (
            SELECT MAX(m3.idMedida)
            FROM medida m3
            INNER JOIN estado e3 ON m3.fkEstado = e3.idEstado
            WHERE e3.uf = '${estado}'
            GROUP BY HOUR(m3.dataHora), DATE(m3.dataHora)
        )
        ORDER BY hora ASC
    `;

    var instrucaoSqlBarra = `
        SELECT
            WEEK(m.dataHora) AS semana,
            m.umidade AS mediaUmidade
        FROM medida m
        INNER JOIN estado e ON m.fkEstado = e.idEstado
        WHERE e.uf = '${estado}'
        AND m.idMedida IN (
            SELECT MAX(m2.idMedida)
            FROM medida m2
            INNER JOIN estado e2 ON m2.fkEstado = e2.idEstado
            WHERE e2.uf = '${estado}'
            GROUP BY WEEK(m2.dataHora)
        )
        ORDER BY semana ASC
    `;

    return database.executar(instrucaoSqlLinha)
        .then(function(linha) {
            return database.executar(instrucaoSqlBarra)
                .then(function(barras) {
                    return { linha, barras };
                });
        });
}

module.exports = {
    buscarGraficos
};