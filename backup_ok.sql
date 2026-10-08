-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: mysql-39d170f2-romarrizo054-2bf5.f.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'General'),(3,'Joyas'),(4,'Perfumes'),(5,'Maquillaje');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_venta` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES (2,2,4,1,7000.00),(4,3,2,3,7000.00),(5,4,3,3,3000.00),(8,5,64,1,2000.00),(9,6,68,1,2000.00),(10,7,58,1,20000.00),(11,8,57,1,15000.00),(12,1,14,2,4500.00),(13,9,3,1,3000.00),(14,10,70,1,3000.00),(15,11,60,1,5500.00),(16,12,83,1,6500.00),(17,13,2,1,7000.00),(18,14,104,1,7500.00),(19,15,105,1,4800.00),(20,16,3,3,3000.00),(21,17,6,3,4800.00),(25,21,103,1,5500.00),(26,21,91,1,3500.00),(27,21,64,1,2000.00),(28,21,88,1,4500.00),(29,21,99,1,4000.00),(30,21,93,1,4000.00),(31,21,65,1,6000.00),(32,21,62,1,4000.00),(33,22,103,1,5500.00),(34,22,98,1,2400.00),(35,22,66,1,4500.00),(36,19,86,2,3499.82),(37,20,6,1,4800.00),(38,18,5,2,4000.00),(39,23,97,1,5500.00),(40,23,15,2,2000.00),(41,23,20,1,4500.00),(43,25,69,1,4500.00),(44,26,92,1,3500.00),(45,26,67,1,6000.00),(46,26,89,1,5000.00),(47,24,14,1,4500.00),(48,27,157,1,4000.00),(49,27,158,1,4500.00),(50,28,121,1,5000.00),(51,29,121,1,5000.00),(52,30,163,1,3500.00),(53,30,172,1,3500.00),(54,30,164,1,4000.00),(55,30,169,1,4000.00),(56,30,173,1,3500.00),(57,30,167,1,3500.00),(58,30,176,1,3500.00),(59,30,165,1,4000.00),(60,30,170,1,4000.00),(61,30,180,1,4000.00),(62,30,171,1,3500.00),(63,30,121,1,5500.00),(64,30,127,1,3500.00),(65,31,121,1,5500.00),(66,32,5,1,4000.00),(67,33,11,1,3500.00),(68,33,4,1,7000.00),(69,34,4,1,7000.00),(70,34,11,1,3500.00),(71,34,29,1,4000.00),(72,34,102,1,4500.00),(73,35,2,1,7000.00);
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_gastos`
--

DROP TABLE IF EXISTS `movimientos_gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_gastos` (
  `id_gasto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int DEFAULT '1',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_gasto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_gastos`
--

LOCK TABLES `movimientos_gastos` WRITE;
/*!40000 ALTER TABLE `movimientos_gastos` DISABLE KEYS */;
INSERT INTO `movimientos_gastos` VALUES (1,5,'2026-09-07 17:56:46','Compra Mercadería','maquillaje la muna',49900.00),(2,5,'2026-09-09 09:40:11','Compra Mercadería','Compra online',36937.00),(3,4,'2026-09-14 21:32:43','Compra Mercadería','perfumes encargados',15335.00),(4,5,'2026-09-14 21:34:05','Compra Mercadería','maquillaje la muna',17100.00),(5,3,'2026-09-21 00:09:29','Compra Mercadería','temu',69002.00);
/*!40000 ALTER TABLE `movimientos_gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `stock_actual` int NOT NULL,
  `stock_minimo` int NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (2,4,'aerosol saphirus',4644.00,7000.00,2,1),(3,4,'sahumerios',1910.00,3000.00,2,1),(4,4,'difusor grande',4239.00,7000.00,4,1),(5,4,'difusor mini',1951.00,4000.00,0,0),(6,4,'textiles',2995.00,4800.00,5,1),(8,4,'homespray',5989.00,9800.00,1,1),(9,4,'clips de autos',2734.00,6000.00,4,1),(10,4,'aromatizantes para autos',1323.00,2500.00,3,1),(11,4,'mini concentrados',2220.00,3500.00,0,1),(12,4,'saphirus parfum',4567.00,7300.00,2,1),(13,4,'bombas de humo',1000.00,2500.00,2,1),(14,5,'perfumes arabes',2000.00,4500.00,0,1),(15,5,'mascarillas',1000.00,2000.00,0,1),(16,5,'base liquida fit me',1000.00,3800.00,1,1),(18,5,'polvo de hadas tei',1000.00,3000.00,1,1),(20,5,'red concealer',2000.00,4500.00,0,1),(21,5,'lip oil M\'undo',1000.00,4000.00,1,1),(22,5,'polvo de hadas tei',1000.00,3000.00,2,1),(23,5,'lip gloss miss lara',2000.00,3800.00,1,1),(24,5,'glitter lip oil love crazy',1000.00,3500.00,1,1),(25,5,'iluminador liquido',2000.00,4500.00,1,1),(27,5,'corrector pink21',2000.00,3000.00,1,1),(28,5,'labial vinyl tei',1000.00,4000.00,1,1),(29,5,'lipgloss the nude pink21',2000.00,4000.00,0,1),(57,5,'aceite karssel',8300.00,15000.00,0,1),(58,5,'pote karseell',12000.00,20000.00,0,1),(59,5,'sombra girls club pink21',3000.00,5500.00,1,0),(60,5,'sombra young saniye',3000.00,5500.00,0,0),(61,5,'mascara de pestañas the colossal',1700.00,3500.00,1,0),(62,5,'mascara de pestañas skyhigh',2000.00,4000.00,0,0),(63,5,'lipstick matte kiss beauty',1600.00,3000.00,1,0),(64,5,'delineador doble ',500.00,2000.00,0,0),(65,5,'espejo doble cartera',2200.00,6000.00,0,0),(66,5,'lipgloss vinyl',1500.00,4500.00,0,0),(67,5,'combo lips mely',3600.00,6000.00,0,0),(68,5,'esponja beauty blender',700.00,2000.00,0,0),(69,5,'lipgloss llavero',3300.00,4500.00,0,0),(70,5,'arqueador',1900.00,3000.00,0,0),(81,1,'Producto de Prueba',100.00,150.00,10,2),(82,5,'Base tei',2000.00,3800.00,1,0),(83,5,'Brochas',3500.00,6500.00,0,0),(84,1,'Producto de Prueba',100.00,150.00,10,2),(85,1,'Producto de Prueba',100.00,150.00,10,2),(86,4,'Textil ambar',1789.00,3499.82,1,0),(87,5,'Polvo translucido',3300.00,5000.00,1,0),(88,5,'Contorno  en barra',2000.00,4500.00,0,0),(89,5,'Ilumiinador y Contorno',3000.00,5000.00,0,0),(90,5,'Brocha para mascarilla',700.00,1500.00,1,0),(91,5,'Delineador liquido',1200.00,3500.00,0,0),(92,5,'Masacara para pestañas transparente',1400.00,3500.00,0,0),(93,5,'Lip gloss nenita',2000.00,4000.00,0,0),(94,5,'set brochas sirena',1500.00,2500.00,1,0),(97,5,'Comb self Care',3700.00,5500.00,0,0),(98,5,'Iluminnador en  stick',1370.00,2400.00,0,0),(99,5,'lip gloss tei',2676.00,4000.00,0,0),(100,5,'Blush Tei',2676.00,4799.83,1,0),(101,5,'Lip balm Tei',2676.00,4500.00,1,0),(102,5,'Mascara de pestañas extreme big volume tejar',2190.00,4500.00,0,0),(103,5,'paleta de sombras peerless tejar',2300.00,5500.00,0,0),(104,5,'polvo compacto translucido',5730.00,7500.00,0,0),(105,5,'rubor en gel jelly',3000.00,4800.00,0,0),(120,1,'Producto de Prueba',100.00,150.00,10,2),(121,3,'aritos simples *7',3500.00,5500.00,6,0),(122,3,'collar diiamantes diminutos',1200.00,3500.00,1,0),(123,3,'collar alas diamante',1200.00,3500.00,1,0),(124,3,'collar corazon rosa',1200.00,4000.00,1,0),(125,3,'collar moño diamante',1200.00,4000.00,1,0),(126,3,'collar cereza simple',1200.00,3500.00,1,0),(127,3,'collar cola rata diamante azul',1200.00,3500.00,0,0),(128,3,'collar destellos',1200.00,4000.00,1,0),(129,3,'collar moño doble',1200.00,4000.00,1,0),(130,3,'collar moñito simple',1200.00,3500.00,1,0),(131,3,'collar corazon rosado diamante',1200.00,4000.00,1,0),(132,3,'collar moño rosado',1200.00,4000.00,1,0),(133,3,'collar corazon doble',1200.00,3500.00,1,0),(134,3,'anillo dorado ying yang',500.00,4000.00,1,0),(135,3,'anillo dorado flor diamante',500.00,4000.00,1,0),(136,3,'anillo dorado diamantes con diam rosado en el medio',500.00,3500.00,1,0),(137,3,'anillo dorado corazon rosado diamante',500.00,3500.00,1,0),(138,3,'anillo dorado corazon rosado y blanco',500.00,3500.00,1,0),(139,3,'anillo dorado mariposa morada',500.00,3500.00,1,0),(140,3,'anillo dorado coraon rosado mediano',500.00,3500.00,1,0),(141,3,'anilllo dorado gema morada',500.00,3500.00,1,0),(142,3,'anillo dorado angel',500.00,3500.00,1,0),(143,3,'anillo dorado soga entrelazado',500.00,3500.00,1,0),(144,3,'anillo dorado zigzag',500.00,3500.00,1,0),(145,3,'anillo dorado gemas coloridas',500.00,3500.00,1,0),(146,3,'anillo dorado gemas rosadas',500.00,3500.00,1,0),(147,3,'anillo dorado geema rectangular morada',500.00,3500.00,1,0),(148,3,'anillo dorado gemas mini coloridas',500.00,3500.00,1,0),(149,3,'anillo corazon rosado alambre',837.00,4000.00,1,0),(150,3,'anillo ancho gema roja',837.00,4000.00,1,0),(151,3,'anillo gema roja circulo',837.00,3500.00,1,0),(152,3,'anillo ancho gema blanca',837.00,4000.00,1,0),(153,3,'anillo corazon blanco',837.00,4000.00,1,0),(154,3,'anillo mini gema azulada',837.00,3500.00,1,0),(155,3,'anillo gema blanca ',837.00,3500.00,1,0),(156,3,'anillo 3 gemas blancas',837.00,3500.00,1,0),(157,3,'anillo gema transparene con destellos',450.00,4000.00,0,0),(158,3,'anillo mariposa azul meda ala faltante',450.00,4500.00,0,0),(159,3,'anillo mariposa verde agua',450.00,4500.00,1,0),(160,3,'anillo mariposa detalles azul',450.00,4500.00,1,0),(161,3,'anillo mariposa mediano verde agua',450.00,4000.00,1,0),(162,3,'anillo mariposa mini celeste',450.00,4000.00,1,0),(163,3,'anillo mini totem elefante',450.00,3500.00,0,0),(164,3,'anillo gema gris detalles al rededor',450.00,4000.00,0,0),(165,3,'anillo detales medievales',450.00,4000.00,0,0),(166,3,'anillo mini diamate azul 3 hojas arriba',450.00,3500.00,1,0),(167,3,'anillo mini corona',450.00,3500.00,0,0),(168,3,'anillo mini diamante azul',450.00,4000.00,1,0),(169,3,'anillo laureles mini',450.00,4000.00,0,0),(170,3,'anillo hoja al rededor',450.00,4000.00,0,0),(171,3,'anillo mini coorona pequeño',450.00,3500.00,0,0),(172,3,'anillos elefantes sin fin',450.00,3500.00,0,0),(173,3,'anillo pequeño con detalles',450.00,3500.00,0,0),(174,3,'anillo diamant azul pequeño con detalles al rdedor',450.00,4000.00,1,0),(175,3,'anillo diamante blanco con medio circulo',450.00,4000.00,1,0),(176,3,'anillo con detalles de puntos',450.00,3500.00,0,0),(177,3,'anillo diamante morado con detalles al rededor',450.00,4000.00,1,0),(178,3,'anillo diamante morado con una flexha abajo',450.00,4000.00,1,0),(179,3,'anillo mini diamante azul con detalles',450.00,4000.00,1,0),(180,3,'anillo diamante azul con detalles al rededor',450.00,4000.00,0,0),(181,3,'anillo gema azul con circulos a lado',450.00,4000.00,1,0),(182,3,'anillo diamante gota azul',450.00,3500.00,1,0),(183,3,'diamante efecto colgante',450.00,4000.00,1,0),(184,3,'anillo flores sin fin',450.00,4000.00,1,0),(185,3,'anillo estrella grande',450.00,4000.00,1,0),(186,3,'anillo hoja al rededor',450.00,3500.00,1,0),(187,3,'anillo mini detalles tallados',450.00,3500.00,1,0),(188,3,'anillo flor pequeña',450.00,4000.00,1,0),(189,3,'anillo dos aros entrelazaados',450.00,4000.00,1,0),(190,3,'anillo flor de loto',450.00,4000.00,1,0),(191,1,'Producto de Prueba',100.00,150.00,10,2),(192,1,'Producto de Prueba',100.00,150.00,10,2),(193,1,'Producto de Prueba',100.00,150.00,10,2),(194,1,'Producto de Prueba',100.00,150.00,10,2),(195,1,'Producto de Prueba',100.00,150.00,10,2),(196,1,'Producto de Prueba',100.00,150.00,10,2),(197,1,'Producto de Prueba',100.00,150.00,10,2),(198,1,'Producto de Prueba',100.00,150.00,10,2),(199,1,'Producto de Prueba',100.00,150.00,10,2),(200,1,'Producto de Prueba',100.00,150.00,10,2);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` varchar(50) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `cliente_fiado` varchar(150) DEFAULT NULL,
  `estado_fiado` varchar(30) DEFAULT NULL,
  `cliente` varchar(150) NOT NULL DEFAULT 'Cliente General',
  PRIMARY KEY (`id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'2026-09-06 19:55:50','Transferencia',9000.00,NULL,NULL,'Cliente General'),(2,'2026-09-07 00:32:04','Transferencia',7000.00,NULL,NULL,'Cliente General'),(3,'2026-09-07 17:40:12','Fiado',21000.00,'pichon','pendiente','Cliente General'),(4,'2026-09-07 17:40:31','Efectivo',9000.00,NULL,NULL,'Cliente General'),(5,'2026-09-07 18:08:09','Efectivo',2000.00,NULL,NULL,'Cliente General'),(6,'2026-09-09 09:41:19','Fiado',2000.00,'Laura','pendiente','Cliente General'),(7,'2026-09-09 09:41:47','Transferencia',20000.00,NULL,NULL,'Cliente General'),(8,'2026-09-09 09:42:04','Transferencia',15000.00,NULL,NULL,'Cliente General'),(9,'2026-09-09 18:02:16','Transferencia',3000.00,NULL,NULL,'Cliente General'),(10,'2026-09-10 01:09:41','Fiado',3000.00,'Miki','pendiente','Cliente General'),(11,'2026-09-10 01:10:03','Fiado',5500.00,'Miki','pendiente','Cliente General'),(12,'2026-09-10 02:18:30','Transferencia',6500.00,NULL,NULL,'Cliente General'),(13,'2026-09-14 21:31:43','Efectivo',7000.00,NULL,NULL,'Cliente General'),(14,'2026-09-15 18:10:21','Fiado',7500.00,'vale','pendiente','Cliente General'),(15,'2026-09-16 03:57:57','Fiado',4800.00,'Mamá','pendiente','Cliente General'),(16,'2026-09-16 17:48:09','Fiado',9000.00,'topo','pendiente','Cliente General'),(17,'2026-09-16 17:48:37','Fiado',14400.00,'topo','pendiente','Cliente General'),(18,'2026-09-16 17:49:12','Transferencia',8000.00,NULL,NULL,'Cliente General'),(19,'2026-09-16 17:50:16','Transferencia',6999.64,NULL,NULL,'Cliente General'),(20,'2026-09-16 17:50:37','Transferencia',4800.00,NULL,NULL,'Cliente General'),(21,'2026-09-17 01:22:32','Fiado',33500.00,'Titi','pendiente','Cliente General'),(22,'2026-09-17 03:23:52','Transferencia',12400.00,NULL,NULL,'Cliente General'),(23,'2026-09-20 23:07:08','Fiado',14000.00,'Nati','pendiente','Cliente General'),(24,'2026-09-20 23:13:43','Fiado',4500.00,'Cari','pendiente','Cliente General'),(25,'2026-09-20 23:37:56','Fiado',4500.00,'Susana','pendiente','Cliente General'),(26,'2026-09-21 00:01:45','Fiado',14500.00,'Carina','pendiente','Cliente General'),(27,'2026-09-21 01:09:15','Fiado',8500.00,'sofia','pendiente','Cliente General'),(28,'2026-09-21 01:09:47','Fiado',5000.00,'nati','pendiente','Cliente General'),(29,'2026-09-21 01:10:06','Fiado',5000.00,'agos','pendiente','Cliente General'),(30,'2026-09-21 01:53:21','Fiado',50000.00,'Anahi','pendiente','Cliente General'),(31,'2026-09-21 02:03:59','Fiado',5500.00,'Lulu','pendiente','Cliente General'),(32,'2026-09-26 23:34:59','Transferencia',4000.00,NULL,NULL,'Cliente General'),(33,'2026-09-29 15:45:32','Fiado',10500.00,'Compañera papá','pendiente','Cliente General'),(34,'2026-09-29 15:47:02','Transferencia',19000.00,NULL,NULL,'Cliente General'),(35,'2026-09-29 15:47:31','Fiado',7000.00,'Compañera papá','pendiente','Cliente General');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08  0:55:29
