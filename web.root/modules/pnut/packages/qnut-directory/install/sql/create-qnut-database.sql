/*
SQLyog Professional v12.5.0 (64 bit)
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

CREATE TABLE IF NOT EXISTS  `qnut_addresses` (
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
) ENGINE=MyISAM AUTO_INCREMENT=750 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_addresstypes` */

CREATE TABLE IF NOT EXISTS  `qnut_addresstypes` (
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

CREATE TABLE IF NOT EXISTS  `qnut_affiliation_roles` (
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

/*Table structure for table `qnut_committee_members` */

CREATE TABLE IF NOT EXISTS  `qnut_committee_members` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `committeeId` int(11) unsigned DEFAULT NULL,
  `personId` int(11) unsigned DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `notes` text,
  `status` int(11) DEFAULT NULL,
  `startOfService` date DEFAULT NULL,
  `endOfService` date DEFAULT NULL,
  `dateRelieved` date DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=723 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_committee_roles` */

CREATE TABLE IF NOT EXISTS  `qnut_committee_roles` (
  `id` int(11) NOT NULL DEFAULT '0',
  `code` varchar(32) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `uk_committee_role_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_committee_statuses` */

CREATE TABLE IF NOT EXISTS  `qnut_committee_statuses` (
  `id` int(11) unsigned NOT NULL DEFAULT '0',
  `code` varchar(32) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_committee_status_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_committees` */

CREATE TABLE IF NOT EXISTS  `qnut_committees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `organizationId` int(10) unsigned DEFAULT NULL,
  `fulldescription` text,
  `mailbox` varchar(30) DEFAULT NULL,
  `isStanding` tinyint(1) DEFAULT '1',
  `isLiaison` tinyint(1) DEFAULT '0',
  `membershipRequired` tinyint(1) DEFAULT '0',
  `notes` text,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `committeeNameIndex` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_lists` */

CREATE TABLE IF NOT EXISTS  `qnut_email_lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `description` varchar(256) DEFAULT NULL,
  `mailBox` varchar(32) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_messages` */

CREATE TABLE IF NOT EXISTS  `qnut_email_messages` (
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_queue` */

CREATE TABLE `qnut_email_queue` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `mailMessageId` int(11) NOT NULL,
  `personId` int(11) DEFAULT NULL,
  `toAddress` varchar(128) DEFAULT NULL,
  `toName` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=260 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_email_subscriptions` */

CREATE TABLE IF NOT EXISTS  `qnut_email_subscriptions` (
  `personId` int(11) NOT NULL DEFAULT '0',
  `listId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`personId`,`listId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_listingtypes` */

CREATE TABLE IF NOT EXISTS  `qnut_listingtypes` (
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
  UNIQUE KEY `uk_listingtypes` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_meetings` */

CREATE TABLE IF NOT EXISTS  `qnut_meetings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL,
  `meetingtypeId` int(11) NOT NULL,
  `yearlymeetingcode` varchar(32) DEFAULT NULL,
  `quarterlymeetingcode` varchar(32) DEFAULT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_meetings_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_meetingtypes` */

CREATE TABLE IF NOT EXISTS  `qnut_meetingtypes` (
  `id` int(10) unsigned NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(256) NOT NULL,
  `createdby` varchar(64) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(64) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_meetingtypes_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_membershiptypes` */

CREATE TABLE IF NOT EXISTS  `qnut_membershiptypes` (
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
  UNIQUE KEY `uk_membershiptypes_code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_organizations` */

CREATE TABLE IF NOT EXISTS  `qnut_organizations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL,
  `organizationType` int(11) DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_organizations_code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_organizationtypes` */

CREATE TABLE IF NOT EXISTS  `qnut_organizationtypes` (
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

/*Table structure for table `qnut_person_affiliations` */

CREATE TABLE IF NOT EXISTS  `qnut_person_affiliations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `personId` int(10) unsigned DEFAULT NULL,
  `organizationId` int(10) unsigned DEFAULT NULL,
  `roleId` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_person_affilations_org_role` (`organizationId`,`roleId`)
) ENGINE=MyISAM AUTO_INCREMENT=1116 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_persons` */

CREATE TABLE IF NOT EXISTS  `qnut_persons` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  KEY `PersonNames` (`fullname`)
) ENGINE=MyISAM AUTO_INCREMENT=1531 DEFAULT CHARSET=latin1;

/*Table structure for table `qnut_postal_lists` */

CREATE TABLE IF NOT EXISTS  `qnut_postal_lists` (
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

CREATE TABLE IF NOT EXISTS  `qnut_postal_subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `addressId` int(11) NOT NULL,
  `listId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uk_postal_list_addresses` (`listId`,`addressId`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_mailboxes` */

CREATE TABLE `tops_mailboxes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mailboxcode` varchar(30) NOT NULL DEFAULT '',
  `address` varchar(100) DEFAULT NULL,
  `displaytext` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'unknown',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `public` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `boxIndex` (`mailboxcode`)
) ENGINE=MyISAM AUTO_INCREMENT=172 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_permissions` */

CREATE TABLE `tops_permissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `permissionName` varchar(128) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_name` (`permissionName`)
) ENGINE=MyISAM AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_process_log` */

CREATE TABLE `tops_process_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `processCode` varchar(128) DEFAULT NULL,
  `posted` datetime DEFAULT NULL,
  `event` varchar(128) DEFAULT NULL,
  `messageType` int(11) DEFAULT NULL,
  `message` varchar(1024) DEFAULT NULL,
  `detail` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_processes` */

CREATE TABLE `tops_processes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(128) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `description` varchar(128) DEFAULT NULL,
  `paused` datetime DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_rolepermissions` */

CREATE TABLE `tops_rolepermissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `permissionId` int(11) DEFAULT NULL,
  `roleName` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissionRoleIdx` (`permissionId`,`roleName`)
) ENGINE=MyISAM AUTO_INCREMENT=110 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_tasklog` */

CREATE TABLE IF NOT EXISTS  `tops_tasklog` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `time` datetime DEFAULT NULL,
  `type` int(10) unsigned DEFAULT NULL,
  `message` varchar(256) DEFAULT NULL,
  `taskname` varchar(128) DEFAULT NULL,
  `active` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=116 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_taskqueue` */

CREATE TABLE IF NOT EXISTS  `tops_taskqueue` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `frequency` varchar(32) NOT NULL DEFAULT 'P24H',
  `taskname` varchar(128) DEFAULT NULL,
  `namespace` varchar(128) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  `enddate` datetime DEFAULT NULL,
  `inputs` varchar(512) DEFAULT NULL,
  `comments` text,
  `active` tinyint(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=87 DEFAULT CHARSET=latin1;

/*Table structure for table `tops_variables` */

CREATE TABLE IF NOT EXISTS  `tops_variables` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(64) DEFAULT NULL,
  `name` varchar(128) DEFAULT NULL,
  `value` varchar(1024) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `createdby` varchar(50) NOT NULL DEFAULT 'system',
  `createdon` datetime DEFAULT CURRENT_TIMESTAMP,
  `changedby` varchar(50) DEFAULT NULL,
  `changedon` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_variables_code` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `qnut_addresstypes` */

insert  into `qnut_addresstypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values 
(0,'unknown','(unknown)',NULL,'system','2017-10-28 07:55:02',NULL,NULL,1),
(1,'home','Residence',NULL,'system','2017-10-28 07:55:24',NULL,NULL,1),
(2,'office','Office or business location',NULL,'system','2017-10-28 07:56:29',NULL,NULL,1),
(3,'worship','Place of worship',NULL,'system','2017-10-28 07:59:19',NULL,NULL,1);

/*Data for the table `qnut_affiliation_roles` */

insert  into `qnut_affiliation_roles`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values 
(1,'member','Member',NULL,'system','2017-10-28 11:49:36',NULL,NULL,1),
(2,'attender','Attender',NULL,'system','2017-10-28 11:49:46',NULL,NULL,1),
(3,'staff','Staff member',NULL,'system','2017-10-28 11:49:59',NULL,NULL,1),
(4,'board','Board member',NULL,'system','2017-10-28 11:51:00',NULL,NULL,1),
(5,'contact','Contact',NULL,'system','2017-10-28 11:51:22',NULL,NULL,1);

/*Data for the table `qnut_committee_roles` */

/*Data for the table `qnut_committee_statuses` */

/*Data for the table `qnut_listingtypes` */

insert  into `qnut_addresstypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values
(0,'unknown','(unknown)',NULL,'system','2017-10-28 07:55:02',NULL,NULL,1),
(1,'home','Residence',NULL,'system','2017-10-28 07:55:24',NULL,NULL,1),
(2,'office','Office or business location',NULL,'system','2017-10-28 07:56:29',NULL,NULL,1),
(3,'worship','Place of worship',NULL,'system','2017-10-28 07:59:19',NULL,NULL,1);

/*Data for the table `qnut_affiliation_roles` */

insert  into `qnut_affiliation_roles`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values
(1,'member','Member',NULL,'system','2017-10-28 11:49:36',NULL,NULL,1),
(2,'attender','Attender',NULL,'system','2017-10-28 11:49:46',NULL,NULL,1),
(3,'staff','Staff member',NULL,'system','2017-10-28 11:49:59',NULL,NULL,1),
(4,'board','Board member',NULL,'system','2017-10-28 11:51:00',NULL,NULL,1),
(5,'contact','Contact',NULL,'system','2017-10-28 11:51:22',NULL,NULL,1);

/*Data for the table `qnut_listingtypes` */

insert  into `qnut_listingtypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values
(0,'none','(none)','No listing','system','2017-10-28 07:59:51',NULL,NULL,1),
(1,'all','All','All listings','system','2017-10-28 08:00:44',NULL,NULL,1),
(2,'lookup','Lookup','Lookup only','system','2017-10-28 08:01:07',NULL,NULL,1),
(3,'printed','Printed','Printed directory only','system','2017-10-28 08:02:13',NULL,NULL,1);

/*Data for the table `qnut_meetingtypes` */

insert  into `qnut_meetingtypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values 
(1,'monthly','Monthly Meeting','Monthly Meeting','system','2017-10-28 09:34:01',NULL,NULL,1),
(0,'workship','Worship Group','Worship Group','system','2017-10-28 09:34:19',NULL,NULL,1),
(3,'preparative','Preparative Meeting','Preparative Meeting','system','2017-10-28 09:34:53',NULL,NULL,1),
(4,'independent','Independent','Independent','system','2017-10-28 09:35:30',NULL,NULL,1),
(99,'other','Other','Other','system','2017-10-28 09:35:56',NULL,NULL,1);

/*Data for the table `qnut_membershiptypes` */

insert  into `qnut_membershiptypes`(`id`,`code`,`name`,`description`,`createdby`,`createdon`,`changedby`,`changedon`,`active`) values 
(0,'none','None','Unknown or not applicable','system','2017-10-28 08:02:40',NULL,NULL,1),
(1,'visitor','Visitor','Has visited meeting but does not regularly attend, such as out-of-town visitors','system','2017-10-28 08:05:50',NULL,NULL,1),
(2,'attender','Attender','Attends meeting regularly or occsionally','system','2017-10-28 08:08:17',NULL,NULL,1),
(3,'member','Member','Member of meeting','system','2017-10-28 08:09:02',NULL,NULL,1);

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



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
