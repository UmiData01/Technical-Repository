function barra() {
        const sidebar = document.getElementById("sidebar");

        if (sidebar.style.width === "250px") {
            sidebar.style.width = "0";
        } else {
            sidebar.style.width = "250px";
        }

    }
    function entrar() {

    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    var erroEmail = document.getElementById("erroEmail");
    var erroSenha = document.getElementById("erroSenha");

    erroEmail.textContent = "";
    erroSenha.textContent = "";

    var valido = true;

    // 🔹 Validação de email
    if (email.trim() === "") {
        erroEmail.textContent = "Digite seu email. Ex: usuario@email.com";
        valido = false;
    } else if (!email.includes("@") || !email.includes(".")) {
        erroEmail.textContent = "Email inválido";
        valido = false;
    } else if (email.length > 45) {
        erroEmail.textContent = "Email muito longo";
        valido = false;
    }

    // 🔹 Validação de senha
    if (senha === "") {
        erroSenha.textContent = "Digite sua senha";
        valido = false;
    } else if (senha.length < 8) {
        erroSenha.textContent = "Senha deve ter no mínimo 8 caracteres";
        valido = false;
    } else if (senha.length > 16) {
        erroSenha.textContent = "Senha muito longa";
        valido = false;
    }

    if (!valido) {
        return false;
    }


    fetch("/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: email,
            senhaServer: senha
        })
    })
    .then(function (resposta) {

        console.log("Resposta recebida:", resposta);

        if (resposta.ok) {

            resposta.json().then(json => {

                console.log(json);

                // 🔐 Sessão
                sessionStorage.EMAIL_USUARIO = json.email;
                sessionStorage.NOME_USUARIO = json.nome;
                sessionStorage.ID_USUARIO = json.idUsuario;

                setTimeout(function () {
                    window.location = "./dashboard/dashboard.html";
                }, 1000);

            });

        } else {

            console.log("Erro ao logar");

            resposta.text().then(() => {
                erroSenha.textContent = "Email ou senha inválidos";
            });

        }

    })
    .catch(function (erro) {
        console.error(erro);
        erroSenha.textContent = "Erro ao conectar com o servidor";
    });

    return false;
}