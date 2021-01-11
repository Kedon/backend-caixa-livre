-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 29, 2018 at 06:42 PM
-- Server version: 10.1.31-MariaDB-cll-lve
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `mvcarvalhocom_lawapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `idCliente` varchar(64) CHARACTER SET utf8 NOT NULL,
  `nome` varchar(64) CHARACTER SET utf8 NOT NULL,
  `sobrenome` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(192) CHARACTER SET utf8 DEFAULT NULL,
  `senha` varchar(32) CHARACTER SET utf8 DEFAULT NULL,
  `celular` varchar(32) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `grupos`
--

CREATE TABLE `grupos` (
  `idGrupo` varchar(64) NOT NULL,
  `nome` varchar(128) NOT NULL,
  `descricao` text,
  `restringirAcesso` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gruposClientes`
--

CREATE TABLE `gruposClientes` (
  `idGrupo` varchar(64) NOT NULL,
  `idCliente` varchar(64) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gruposRelacionados`
--

CREATE TABLE `gruposRelacionados` (
  `idGrupo` varchar(64) NOT NULL,
  `idSubGrupo` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gruposUsuarios`
--

CREATE TABLE `gruposUsuarios` (
  `idUsuario` varchar(64) NOT NULL,
  `idGrupo` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `processos`
--

CREATE TABLE `processos` (
  `idProcesso` varchar(64) NOT NULL,
  `idGrupo` varchar(64) DEFAULT NULL,
  `idCliente` varchar(64) DEFAULT NULL,
  `numero` varchar(128) NOT NULL,
  `titulo` varchar(192) DEFAULT NULL,
  `descricao` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` varchar(64) NOT NULL,
  `nome` varchar(64) NOT NULL,
  `sobrenome` varchar(64) DEFAULT NULL,
  `email` varchar(192) NOT NULL,
  `senha` varchar(32) NOT NULL,
  `acesso` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`idCliente`);

--
-- Indexes for table `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`idGrupo`);

--
-- Indexes for table `gruposClientes`
--
ALTER TABLE `gruposClientes`
  ADD PRIMARY KEY (`idGrupo`,`idCliente`);

--
-- Indexes for table `gruposRelacionados`
--
ALTER TABLE `gruposRelacionados`
  ADD PRIMARY KEY (`idGrupo`,`idSubGrupo`);

--
-- Indexes for table `gruposUsuarios`
--
ALTER TABLE `gruposUsuarios`
  ADD PRIMARY KEY (`idUsuario`,`idGrupo`);

--
-- Indexes for table `processos`
--
ALTER TABLE `processos`
  ADD PRIMARY KEY (`idProcesso`),
  ADD KEY `numero` (`numero`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `email` (`email`);
COMMIT;
