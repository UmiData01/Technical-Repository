var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`);

                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);
                        
                        // Retorna os dados do usuário logado diretamente, sem buscar "aquários"
                        res.json({
                            id: resultadoAutenticar[0].idUsuario,
                            nome: resultadoAutenticar[0].nome,
                            sobrenome: resultadoAutenticar[0].sobrenome,
                            email: resultadoAutenticar[0].email,
                            telefone: resultadoAutenticar[0].telefone,
                            senha: resultadoAutenticar[0].senha,
                            cnpj: resultadoAutenticar[0].cnpj,
                            tipoCargo: resultadoAutenticar[0].tipoCargo,
                            nomeRegiao: resultadoAutenticar[0].nomeRegiao,
                            empresa: resultadoAutenticar[0].empresa,
                            sigla: resultadoAutenticar[0].sigla
                        });
                        
                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var sobrenome = req.body.sobrenomeServer;
    var email = req.body.emailServer;
    var telefone = req.body.telefoneServer; 
    var senha = req.body.senhaServer;
    var cnpj = req.body.cnpjServer;
    var tipoCargo = req.body.cargoServer;
    var nomeRegiao = req.body.regiaoServer;
    var empresa = req.body.empresaServer;
    var sigla = req.body.siglaServer;

    // Validações rigorosas para não quebrar o Model
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (nomeRegiao == undefined) {
        res.status(400).send("A região está undefined! Verifique o Front-end.");
    } else {

        usuarioModel.cadastrar(nome, sobrenome, email, telefone, senha, cnpj, tipoCargo, nomeRegiao, empresa, sigla)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o cadastro! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function listarPorEmpresa(req, res) {
    var empresa = req.params.empresa;
    usuarioModel.listarPorEmpresa(empresa)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function alterarCargo(req, res) {
    var idUsuario = req.params.idUsuario;
    var cargo = req.body.cargoServer;
    usuarioModel.alterarCargo(idUsuario, cargo)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function deletarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    usuarioModel.deletarUsuario(idUsuario)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function alterarSenha(req, res) {
    var idUsuario = req.params.idUsuario;
    var senhaAtual = req.body.senhaAtualServer;
    var novaSenha = req.body.novaSenhaServer;

    if (idUsuario == undefined) {
        res.status(400).send("Usuário não identificado.");
    } else if (senhaAtual == undefined) {
        res.status(400).send("Senha atual está undefined!");
    } else if (novaSenha == undefined) {
        res.status(400).send("Nova senha está undefined!");
    } else if (novaSenha.length < 6) {
        res.status(400).send("A nova senha deve ter no mínimo 6 caracteres.");
    } else {
        usuarioModel.alterarSenha(idUsuario, senhaAtual, novaSenha)
            .then(function (resultado) {
                if (resultado.affectedRows == 0) {
                    res.status(403).send("Senha atual incorreta.");
                } else {
                    res.status(200).send("Senha alterada com sucesso.");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    autenticar,
    cadastrar, 
    listarPorEmpresa, 
    alterarCargo, 
    deletarUsuario,
    alterarSenha
}