var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT idUsuario, nome, email, senha FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
async function cadastrar(nome, sobrenome, email, telefone, senha, cnpj, tipoCargo, nomeEstado, empresa, sigla) {
    console.log("ACESSEI O USUARIO MODEL");

    try {
        let instrucaoSql = `
            SELECT idRegiao FROM regiao WHERE nomeRegiao = '${nomeEstado}';
        `;
        console.log("Executando a instrução SQL: \n" + instrucaoSql);

        let resultadoRegiao = await database.executar(instrucaoSql);
        let idRegiao = resultadoRegiao[0].idRegiao;


        instrucaoSql = `
            SELECT idEmpresa FROM empresas_governamentais WHERE cnpj = '${cnpj}';
        `;
        console.log("Executando a instrução SQL: \n" + instrucaoSql);

        let resultadoEmpresa = await database.executar(instrucaoSql);
        let idEmpresa;

        if (resultadoEmpresa.length > 0) {
            idEmpresa = resultadoEmpresa[0].idEmpresa;
        } else {
            instrucaoSql = `
                INSERT INTO empresas_governamentais (nomeEmpresa, cnpj, fkRegiao)
                VALUES ('${empresa}', '${cnpj}', ${idRegiao});
            `;
            console.log("Executando a instrução SQL: \n" + instrucaoSql);

            let resInsertEmpresa = await database.executar(instrucaoSql);
            idEmpresa = resInsertEmpresa.insertId;
        }


        instrucaoSql = `
            SELECT idCargo FROM cargo WHERE tipoCargo = '${tipoCargo}';
        `;
        console.log("Executando a instrução SQL: \n" + instrucaoSql);

        let resultadoCargo = await database.executar(instrucaoSql);
        let idCargo = resultadoCargo[0].idCargo;


        instrucaoSql = `
            INSERT INTO usuario (nome, sobrenome, telefone, email, senha, fkEmpresa, fkCargo)
            VALUES ('${nome}', '${sobrenome}', '${telefone}', '${email}', '${senha}', ${idEmpresa}, ${idCargo});
        `;
        console.log("Executando a instrução SQL: \n" + instrucaoSql);
        return database.executar(instrucaoSql);

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        throw erro;
    }
}

module.exports = {
    autenticar,
    cadastrar
};