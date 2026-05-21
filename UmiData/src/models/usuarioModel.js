var database = require("../database/config")

function autenticar(email, senha) {

    console.log("ACESSEI O USUARIO MODEL");

    var instrucaoSql = `
        SELECT 
            u.idUsuario,
            u.nome,
            u.sobrenome,
            u.email,
            u.telefone,
            u.senha,

            c.tipoCargo,

            e.nomeEmpresa AS empresa,
            e.cnpj,

            r.nomeRegiao,
            r.sigla

        FROM usuario u

        INNER JOIN empresas_governamentais e
        ON u.fkEmpresa = e.idEmpresa

        INNER JOIN regiao r
        ON e.fkRegiao = r.idRegiao

        INNER JOIN cargo c
        ON u.fkCargo = c.idCargo

        WHERE u.email = '${email}'
        AND u.senha = '${senha}';
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
}

async function cadastrar(nome, sobrenome, email, telefone, senha, cnpj, tipoCargo, nomeRegiao, empresa, sigla) {
    console.log("ACESSEI O USUARIO MODEL");

    try {
        let instrucaoSql = `
            SELECT idRegiao FROM regiao WHERE nomeRegiao = '${nomeRegiao}';
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

function listarPorEmpresa(nomeEmpresa) {
    var instrucaoSql = `
        SELECT u.idUsuario, u.nome, u.sobrenome, u.email, c.tipoCargo 
        FROM usuario u
        INNER JOIN empresas_governamentais e ON u.fkEmpresa = e.idEmpresa
        INNER JOIN cargo c ON u.fkCargo = c.idCargo
        WHERE e.nomeEmpresa = '${nomeEmpresa}';
    `;
    return database.executar(instrucaoSql);
}

function alterarCargo(idUsuario, idCargo) {
    var instrucaoSql = `UPDATE usuario SET fkCargo = ${idCargo} WHERE idUsuario = ${idUsuario};`;
    return database.executar(instrucaoSql);
}

function deletarUsuario(idUsuario) {
    var instrucaoSql = `DELETE FROM usuario WHERE idUsuario = ${idUsuario};`;
    return database.executar(instrucaoSql);
}


module.exports = {
    autenticar,
    cadastrar, 
    listarPorEmpresa, 
    alterarCargo, 
    deletarUsuario
};