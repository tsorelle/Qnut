var QnutDirectory;
(function (QnutDirectory) {
    var DirectoryPerson = (function () {
        function DirectoryPerson() {
            this.id = null;
            this.addressId = null;
            this.listingtypeId = null;
            this.fullname = '';
            this.email = '';
            this.username = '';
            this.phone = '';
            this.phone2 = '';
            this.dateofbirth = '';
            this.deceased = '';
            this.sortkey = '';
            this.notes = '';
            this.createdby = '';
            this.createdon = '';
            this.changedby = '';
            this.changedon = '';
            this.active = 1;
            this.editState = Peanut.editState.created;
        }
        return DirectoryPerson;
    }());
    QnutDirectory.DirectoryPerson = DirectoryPerson;
    var DirectoryAddress = (function () {
        function DirectoryAddress() {
            this.id = null;
            this.addressname = '';
            this.address1 = '';
            this.address2 = '';
            this.city = '';
            this.state = '';
            this.postalcode = '';
            this.country = '';
            this.phone = '';
            this.notes = '';
            this.createdon = '';
            this.sortkey = '';
            this.addresstypeId = null;
            this.listingtypeId = null;
            this.latitude = null;
            this.longitude = null;
            this.changedby = '';
            this.changedon = '';
            this.createdby = '';
            this.active = 1;
            this.editState = Peanut.editState.created;
        }
        return DirectoryAddress;
    }());
    QnutDirectory.DirectoryAddress = DirectoryAddress;
})(QnutDirectory || (QnutDirectory = {}));
//# sourceMappingURL=DirectoryEntities.js.map