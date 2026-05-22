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


                    sessionStorage.setItem("ID_USUARIO", json.id);
                    sessionStorage.setItem("NOME_USUARIO", json.nome);
                    sessionStorage.setItem("EMAIL_USUARIO", json.email);
                    sessionStorage.setItem("REGIAO_USUARIO", json.nomeRegiao);
                    sessionStorage.setItem("TIPO_CARGO", json.tipoCargo);
                    sessionStorage.setItem("EMPRESA_USUARIO", json.empresa);

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

function mostrarMensagemSucesso(mensagem) {
    const toast = document.createElement("div");
    toast.textContent = mensagem;
    
    toast.style.position = "fixed";
    toast.style.top = "30px";
    toast.style.right = "30px";
    toast.style.backgroundColor = "#22c55e";
    toast.style.color = "white";
    toast.style.padding = "16px 24px";
    toast.style.borderRadius = "10px";
    toast.style.fontWeight = "bold";
    toast.style.boxShadow = "0 10px 25px rgba(34, 197, 94, 0.4)";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all 0.4s ease";
    
    document.body.appendChild(toast);

  
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);
}