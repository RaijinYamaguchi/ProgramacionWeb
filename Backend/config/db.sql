CREATE DATABASE IF NOT EXISTS `sistema_control_agua`;
USE `sistema_control_agua`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`       INT          AUTO_INCREMENT PRIMARY KEY,
  `nombre`   VARCHAR(100) NOT NULL,
  `email`    VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol`      ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  `creado_en` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS `tanques` (
  `id`             INT          AUTO_INCREMENT PRIMARY KEY,
  `nombre`         VARCHAR(100) NOT NULL,
  `ubicacion`      VARCHAR(150) NOT NULL,
  `capacidad_max`  FLOAT        NOT NULL COMMENT 'Capacidad máxima en litros',
  `nivel_min_alerta` FLOAT      NOT NULL DEFAULT 20.0 COMMENT 'Porcentaje mínimo antes de alertar',
  `nivel_max_alerta` FLOAT      NOT NULL DEFAULT 90.0 COMMENT 'Porcentaje máximo antes de alertar',
  `activo`         TINYINT(1)   NOT NULL DEFAULT 1,
  `creado_en`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS `dispositivos` (
  `id`            INT          AUTO_INCREMENT PRIMARY KEY,
  `nombre`        VARCHAR(100) NOT NULL,
  `ubicacion`     VARCHAR(150) NOT NULL,
  `funcionalidad` ENUM('sensor','actuador') NOT NULL DEFAULT 'sensor',
  `usuario_id`    INT          NOT NULL,
  `tanque_id`     INT          NOT NULL,
  `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
  `creado_en`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tanque_id`)  REFERENCES `tanques`(`id`)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `mediciones` (
  `id`            INT       AUTO_INCREMENT PRIMARY KEY,
  `dispositivo_id` INT      NOT NULL,
  `nivel_agua`    FLOAT     NOT NULL COMMENT 'Nivel en cm registrado por el HC-SR04',
  `porcentaje`    FLOAT     NOT NULL COMMENT 'Porcentaje calculado respecto al tanque',
  `fecha`         DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `reportes` (
  `id`              INT          AUTO_INCREMENT PRIMARY KEY,
  `titulo`          VARCHAR(150) NOT NULL,
  `tanque_id`       INT          NOT NULL,
  `fecha_inicio`    DATETIME     NOT NULL,
  `fecha_fin`       DATETIME     NOT NULL,
  `nivel_promedio`  FLOAT        NOT NULL COMMENT 'Promedio de nivel en el período',
  `nivel_maximo`    FLOAT        NOT NULL,
  `nivel_minimo`    FLOAT        NOT NULL,
  `total_mediciones` INT         NOT NULL DEFAULT 0,
  `generado_por`    INT          NOT NULL COMMENT 'ID del usuario que generó el reporte',
  `creado_en`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tanque_id`)    REFERENCES `tanques`(`id`)   ON DELETE CASCADE,
  FOREIGN KEY (`generado_por`) REFERENCES `usuarios`(`id`)  ON DELETE CASCADE
);
create table if not exists `tokens_dispositivos` (
  `id` int auto_increment primary key,
  `token` varchar(500) not null unique,
  `dispositivo_id` int not null,
  `descripcion` varchar(255),
  `activo` tinyint(1) not null default 1,
  `expires_at` datetime not null,
  `creado_en` datetime not null default current_timestamp,
  `ultimo_uso` datetime,
  foreign key (`dispositivo_id`) references `dispositivos`(`id`) on delete cascade
);
