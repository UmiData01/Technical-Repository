var sigla = null;
var id = 

function barra() {
        const sidebar = document.getElementById("sidebar");

        if (sidebar.style.width === "250px") {
            sidebar.style.width = "0";
        } else {
            sidebar.style.width = "250px";
        }
    }
    function validarNome() {
        let nome = document.getElementById("nome").value
        let erro = document.getElementById("erroNome")

        erro.innerText = ""

        if (nome.trim() == "") {
            erro.innerText = "Digite seu nome"
        }
        else if (nome.length < 3) {
            erro.innerText = "Nome deve ter pelo menos 3 letras"
        }
    }

    function validarSobrenome() {
        let sobrenome = document.getElementById("sobrenome").value
        let erro = document.getElementById("erroSobrenome")

        erro.innerText = ""

        if (sobrenome.trim() == "") {
            erro.innerText = "Digite seu sobrenome"
        }
        else if (sobrenome.length < 3) {
            erro.innerText = "Sobrenome inválido"
        }
    }

    function validarEmpresa() {
        let empresa = document.getElementById("empresa").value
        let erro = document.getElementById("erroEmpresa")

        erro.innerText = ""

        if (empresa.trim() == '') {
            erro.innerText = "O Nome Empresa é obrigatório"
        }
    }

    function validarCnpj() {
        let cnpj = document.getElementById("cnpj").value
        let erro = document.getElementById("erroCnpj")

        erro.innerText = ""

        if (cnpj.length != 14) {
            erro.innerText = "CNPJ deve ter 14 números"
        }
    }

    function validarCargo() {
        let cargo = document.getElementById("cargo").value
        let erro = document.getElementById("erroCargo")

        erro.innerText = ""

        if (cargo == '#') {
            erro.innerText = "Informe o cargo"
        }
    }

    function validarRegião() {
        let estado = document.getElementById("estado").value
        let erro = document.getElementById("erroEstado")

        erro.innerText = ""

        if (estado == '#') {
            erro.innerText = "Selecione uma das regiões"
        }

        if (estado == 'Sudeste'){
            sigla = 'SE'
            console.log("Sigla: SE")
        } else if (estado == 'Sul'){
            sigla = 'S'
            console.log("Sigla: S")
        } else if (estado == 'Centro-Oeste'){
            sigla = 'CO'
            console.log("Sigla: CO")
        } else if (estado == 'Nordeste'){
            sigla = 'NE'
            console.log("Sigla: NE")
        } else {
            sigla = 'N'
            console.log("Sigla: N")
        }
    }

    function validarEmail() {
        let email = document.getElementById("email").value
        let erro = document.getElementById("erroEmail")

        erro.innerText = ""

        if (!email.includes("@") || !email.includes(".")) {
            erro.innerText = "Email inválido. Ex: usuario@email.com"
        }
    }

    function validarTelefone() {
        let telefone = document.getElementById("telefone").value
        let erro = document.getElementById("erroTelefone")

        erro.innerText = ""

        if (telefone.length < 10) {
            erro.innerText = "Telefone inválido"
        }
    }

    function validarSenha() {
        let senha = document.getElementById("senha").value
        let erro = document.getElementById("erroSenha")

        erro.innerText = ""

        if (senha.length < 8) {
            erro.innerText = "Senha precisa ter no mínimo 8 caracteres"
        }
    }

    function validarConfirmarSenha() {
        let senha = document.getElementById("senha").value
        let confirmar = document.getElementById("confirmarSenha").value
        let erro = document.getElementById("erroConfirmarSenha")

        erro.innerText = ""

        if (senha != confirmar) {
            erro.innerText = "As senhas não coincidem"
        }
    }

    function registrar() {
    let nome = document.getElementById("nome").value;
    let sobrenome = document.getElementById("sobrenome").value;
    let empresa = document.getElementById("empresa").value;
    let cnpj = document.getElementById("cnpj").value;
    let cargo = document.getElementById("cargo").value;
    let estado = document.getElementById("estado").value;
    let email = document.getElementById("email").value;
    let telefone = document.getElementById("telefone").value;
    let senha = document.getElementById("senha").value;
    let confirmarSenha = document.getElementById("confirmarSenha").value;

    // Validação simples geral
    if (
        nome.trim() == "" ||
        sobrenome.trim() == ""|| 
        empresa.trim() == ""||
        cnpj.length != 14 ||
        cargo == "#" ||
        estado == "#" ||
        !email.includes("@") ||
        telefone.length < 10 ||
        senha.length < 8 ||
        senha != confirmarSenha
    ) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    console.log({
        nome,
        sobrenome,
        empresa,
        cnpj,
        cargo,
        estado,
        email,
        telefone,
        senha
    });

    fetch("/usuarios/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idServer: id,
            nomeServer: nome,
            sobrenomeServer: sobrenome,
            empresaServer: empresa,
            siglaServer: sigla,
            cnpjServer: cnpj,
            cargoServer: cargo,
            estadoServer: estado,
            emailServer: email,
            telefoneServer: telefone,
            senhaServer: senha
        })
    })
    .then(res => {
        if (res.ok) {
            alert("Cadastro realizado com sucesso!");
            setTimeout(() => {
                window.location = "login.html";
            }, 2000);
        } else {
            throw new Error("Erro ao cadastrar");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao cadastrar usuário");
    });
}