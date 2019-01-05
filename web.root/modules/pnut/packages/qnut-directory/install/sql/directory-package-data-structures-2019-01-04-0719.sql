/*
SQLyog Professional v13.1.1 (64 bit)
MySQL - 5.7.14 : Database - twoquake_qnut
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `qnut_addresses` */

CREATE TABLE `qnut_addresses` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `addressname` varchar(128) DEFAULT NULL,
  `address1` varchar(128) DEFAULT NULL,
  `address2` varchar(128) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `state` varchar(64) DEFAULT NULL,
  `postalcode` varchar(64) DEFAULT NULL,
  `country` varchar(64) DEFAULT NULL,
  `phone` varchar(128) DEFAULT NULL,
  `notes` varchar(2056) DEFAULT NULL,
  `addresstypeId` int(11) DEFAULT '1',
  `sortkey` varchar(128) DEFAULT NULL,
  `listingtypeId` int(11) DEFAULT '1',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=752 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_addresstypes` */

CREATE TABLE `qnut_addresstypes` (
  `id` int(10) unsigned NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_addresstypes_code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_affiliation_roles` */

CREATE TABLE `qnut_affiliation_roles` (
  `id` int(10) unsigned NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_affiliation_roles_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_contacts` */

CREATE TABLE `qnut_contacts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `organizationId` int(10) unsigned NOT NULL,
  `contactName` varchar(256) DEFAULT NULL,
  `department` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `fax` varchar(32) DEFAULT NULL,
  `notes` text,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_lists` */

CREATE TABLE `qnut_email_lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `description` varchar(256) DEFAULT NULL,
  `mailBox` varchar(32) DEFAULT NULL,
  `cansubscribe` tinyint(1) NOT NULL DEFAULT '0',
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_messages` */

CREATE TABLE `qnut_email_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listId` int(11) NOT NULL,
  `sender` varchar(128) NOT NULL,
  `replyAddress` varchar(128) DEFAULT NULL,
  `subject` varchar(128) DEFAULT NULL,
  `messageText` text NOT NULL,
  `contentType` char(4) DEFAULT NULL,
  `template` varchar(128) DEFAULT NULL,
  `recipientCount` int(11) DEFAULT '1',
  `postedDate` datetime NOT NULL,
  `postedBy` varchar(128) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_queue` */

CREATE TABLE `qnut_email_queue` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `mailMessageId` int(11) NOT NULL,
  `personId` int(11) DEFAULT NULL,
  `toAddress` varchar(128) DEFAULT NULL,
  `toName` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=298 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_subscriptions` */

CREATE TABLE `qnut_email_subscriptions` (
  `personId` int(11) NOT NULL DEFAULT '0',
  `listId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`personId`,`listId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_organizations` */

CREATE TABLE `qnut_organizations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL,
  `organizationType` int(11) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `phone` varchar(128) DEFAULT NULL,
  `fax` varchar(128) DEFAULT NULL,
  `notes` text,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_organizations_code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_organizationtypes` */

CREATE TABLE `qnut_organizationtypes` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_organizationtypes_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `qnut_organizationtypes` */

insert  into `qnut_organizationtypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values
    (1,'meeting','Friends Meeting','Friends Meeting or Church','system','2017-11-10 07:01:08',NULL,NULL,1),
    (3,'quarter','Quarterly Meeting','Friends Quarterly Meeting','system','2017-11-10 07:05:25',NULL,NULL,1),
    (2,'yearlymeeting','Yearly Meeting','Friends Yearly Meeting','system','2017-11-10 07:04:49',NULL,NULL,1),
    (4,'friendsorg','Friends Organization','Friends Organization','system','2017-11-10 07:06:13',NULL,NULL,1),
    (5,'worship','Worship Place','Other place of worship','system','2017-11-10 07:07:39',NULL,NULL,1),
    (6,'nonprofit','Non profit','Non-profit organization','system','2017-11-10 07:08:39',NULL,NULL,1),
    (7,'community','Community organization','Community or local social change organizaiton','system','2017-11-10 07:09:11',NULL,NULL,1),
    (8,'business','Business','Businesses and services','system','2017-11-10 07:09:43',NULL,NULL,1),
    (9,'govt','Government','Government Agencies','system','2017-11-10 07:10:21',NULL,NULL,1),
    (10,'other','Other','Not classified','system','2017-11-10 07:10:35',NULL,NULL,1);


/*Table structure for table `qnut_person_affiliations` */

CREATE TABLE `qnut_person_affiliations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `personId` int(10) unsigned DEFAULT NULL,
  `organizationId` int(10) unsigned DEFAULT NULL,
  `roleId` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_person_affilations_org_role` (`organizationId`,`roleId`)
) ENGINE=MyISAM AUTO_INCREMENT=1116 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_persons` */

CREATE TABLE `qnut_persons` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(128) DEFAULT NULL,
  `lastname` varchar(128) DEFAULT NULL,
  `middlename` varchar(128) DEFAULT NULL,
  `fullname` varchar(128) NOT NULL,
  `addressId` int(11) unsigned DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `username` varchar(64) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `phone2` varchar(32) DEFAULT NULL,
  `dateofbirth` date DEFAULT NULL,
  `junior` tinyint(1) DEFAULT '0',
  `deceased` date DEFAULT NULL,
  `listingtypeId` int(11) unsigned DEFAULT '1',
  `sortkey` varchar(128) DEFAULT NULL,
  `notes` text,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `uid` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id_qnut_person` (`uid`),
  KEY `PersonNames` (`fullname`)
) ENGINE=MyISAM AUTO_INCREMENT=1537 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_postal_lists` */

CREATE TABLE `qnut_postal_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varbinary(256) DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_postal_lists_code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_postal_subscriptions` */

CREATE TABLE `qnut_postal_subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `addressId` int(11) NOT NULL,
  `listId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uk_postal_list_addresses` (`listId`,`addressId`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
