-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
*/

DROP DATABASE IF EXISTS UmiData;
CREATE DATABASE UmiData;
USE UmiData;

CREATE TABLE regiao (
    idRegiao INT PRIMARY KEY AUTO_INCREMENT,
    nomeRegiao VARCHAR(20) UNIQUE NOT NULL,
    sigla VARCHAR(2) UNIQUE NOT NULL,
    CONSTRAINT chkRegiao
    CHECK (nomeRegiao IN ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul')),
    CONSTRAINT chkSigla
		CHECK(sigla IN ('N' , 'NE' , 'CO' , 'SE' , 'S'))
);

CREATE TABLE empresas_governamentais (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nomeEmpresa VARCHAR(100) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL,
    fkRegiao INT NOT NULL,
    CONSTRAINT chkCnpj
    CHECK (cnpj REGEXP '^[0-9]{14}$'),
    CONSTRAINT fkEmpresaRegiao
        FOREIGN KEY (fkRegiao)
        REFERENCES regiao(idRegiao)
	ON DELETE RESTRICT
);

CREATE TABLE cargo (
	idCargo INT PRIMARY KEY AUTO_INCREMENT,
	tipoCargo VARCHAR(15),
	CONSTRAINT chkCargo
		CHECK (tipoCargo IN ('Admin', 'Padrao'))
);

CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    fkEmpresa INT,
    fkCargo INT,
	CONSTRAINT fkUsuarioCargo
		FOREIGN KEY (fkCargo)
		REFERENCES cargo(idCargo)
        ON DELETE SET NULL,
        
	CONSTRAINT fkUsuarioEmpresa
        FOREIGN KEY (fkEmpresa)
		REFERENCES empresas_governamentais(idEmpresa)
        ON DELETE SET NULL
);

CREATE TABLE estado (
    idEstado INT PRIMARY KEY,
    nomeEstado VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    fkRegiao INT NOT NULL,
    CONSTRAINT fkEstadoRegiao
        FOREIGN KEY (fkRegiao)
        REFERENCES regiao(idRegiao)
        ON DELETE RESTRICT
);

CREATE TABLE medida (
    idMedida INT PRIMARY KEY AUTO_INCREMENT,
    dataHora DATETIME NOT NULL,
    umidade DECIMAL(5,2) NOT NULL,
    fkEstado INT NOT NULL,
    CONSTRAINT fkMedidaEstado
        FOREIGN KEY (fkEstado)
        REFERENCES estado(idEstado)
        ON DELETE RESTRICT
);