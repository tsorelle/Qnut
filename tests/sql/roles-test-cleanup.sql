DELETE FROM qcms_roles WHERE rolename LIKE 'test-%';
DELETE FROM tops_rolepermissions WHERE roleName LIKE 'test-%';
DELETE FROM tops_permissions WHERE permissionName = 'unit-test-permission';
