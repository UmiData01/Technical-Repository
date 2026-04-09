-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
*/

CREATE DATABASE Umidata;

USE Umidata;

-- USUÁRIO PODERÁ DAR UPDATE NA SENHA
CREATE TABLE usuario (
idUsuario INT PRIMARY KEY AUTO_INCREMENT,
nomeUsuario VARCHAR(30),
email VARCHAR(45),
senha VARCHAR(16),
fkUsuarioResponsavel INT,
      CONSTRAINT fkResponsavel
            FOREIGN KEY (fkUsuarioAdm)
                  REFERENCES Usuario(idUsuario)
);

-- Separei cidade de região que eu achei masi fácil só adicionar uma chave estrangeira para associar por região
CREATE TABLE regioes (
idRegiao INT PRIMARY KEY AUTO_INCREMENT,
regiao VARCHAR(15),
      CONSTRAINT chkRegioes
            CHECK(regiao IN ('Norte' , 'Nordeste' , 'Noroeste' , 'Oeste', 'Centro-Oeste' , 'Sudeste' , 'Sudoeste' , 'Sul')),
sigla CHAR(2),
      CONSTRAINT chkSigla
            CHECK(sigla IN ('N' , 'NE' , 'NO' , 'O', 'CO' , 'SE' , 'SO' , 'S'))
);

-- Associar cidades às suas respectivas regioes
CREATE TABLE cidades (
idCidade INT PRIMARY KEY AUTO_INCREMENT,
nomeCidade VARCHAR(45),
uf CHAR(2),
fkRegiao INT,
      CONSTRAINT fkCidadeRegiao
            FOREIGN KEY (fkRegiao)
                  REFERENCES regioes(idRegiao)
);

-- Pensei em ser uma tabela com relacionamento fraco, pois sem a cidade e sem a região, não existe a medida, faz sentido xovens?
CREATE TABLE medidas (
idMedida INT AUTO_INCREMENT,
dataHora DATETIME,
fkRegiao INT,
      CONSTRAINT fkUmidadeRegiao
            FOREIGN KEY (fkRegiao)
                  REFERENCES regioes(idRegiao),
fkCidade INT,
      CONSTRAINT fkUmidadeCIdade
            FOREIGN KEY (fkCidade)
                  REFERENCES cidade(idCidade),
      PRIMARY KEY (IdMedida, idRegiao, idCidade)
);

INSERT INTO usuario (nomeUsuario, email, senha, fkUsuarioAdm) VALUES 
      ('Fabiano', 'fabiano.silva@gmail.com', NULL),
      ('José Bonifácio.', 'jose.bonifacio@gmail.com', NULL),
    ('Amanda Sapia', 'amanda.sapia@gmail.com', NULL),
      ('Dantas', 'dantas.okamoto@gmail.com', NULL),
    ('Samara Santos', 'samara.sa@gmail.com', 4),
    ('Cleiton Rasta', 'cleiton.rasta@gamil.com', 3),
    ('Larissa Araujo', 'larissaArjo@gmail.com', 2),
    ('Bianca Azevedo', 'bianca.zevedo@gmail.com', 1);
    
INSERT INTO regioes (regiao, sigla) VALUES 
      ('Norte', 'N'),
      ('Nordeste', 'NE'),
      ('Noroeste', 'NO'),
      ('Oeste', 'O'),
      ('Centro-Oeste', 'CO'),
      ('Sudeste', 'SE'),
      ('Sudoeste', 'SO'),
      ('Sul', 'S');

INSERT INTO cidades (nomeCidade, uf, fkRegiao) VALUES
      ('PRADOPOLIS', 'SP', 1),
      ('SAO GONCALO', 'PB', 2),
      ('CACHOEIRA PAULISTA', 'SP', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1),
      ('', '', 1);