var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QnutDirectory;
(function (QnutDirectory) {
    var DirectoryPerson = (function () {
        function DirectoryPerson() {
            this.id = null;
            this.addressId = null;
            this.listingtypeId = null;
            this.fullname = '';
            this.firstname = '';
            this.middlename = '';
            this.lastname = '';
            this.email = '';
            this.username = '';
            this.phone = '';
            this.phone2 = '';
            this.dateofbirth = '';
            this.deceased = '';
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
    var editPanel = (function () {
        function editPanel(owner) {
            var _this = this;
            this.viewState = ko.observable('');
            this.hasErrors = ko.observable(false);
            this.isAssigned = false;
            this.relationId = null;
            this.translate = function (code, defaultText) {
                if (defaultText === void 0) { defaultText = null; }
                return _this.owner.translate(code, defaultText);
            };
            var me = this;
            me.owner = owner;
        }
        editPanel.prototype.edit = function (relationId) {
            if (relationId === void 0) { relationId = null; }
            var me = this;
            me.viewState('edit');
            me.relationId = relationId;
        };
        editPanel.prototype.close = function () {
            var me = this;
            me.viewState('closed');
        };
        editPanel.prototype.search = function () {
            var me = this;
            me.viewState('search');
        };
        editPanel.prototype.empty = function () {
            var me = this;
            me.viewState('empty');
        };
        editPanel.prototype.view = function () {
            var me = this;
            if (me.isAssigned) {
                me.viewState('view');
            }
            else {
                me.viewState('empty');
            }
        };
        editPanel.prototype.setViewState = function (state) {
            if (state === void 0) { state = 'view'; }
            var me = this;
            me.viewState(state);
        };
        return editPanel;
    }());
    QnutDirectory.editPanel = editPanel;
    var directoryEditPanel = (function (_super) {
        __extends(directoryEditPanel, _super);
        function directoryEditPanel(owner) {
            var _this = _super.call(this, owner) || this;
            _this.directoryListingTypeId = ko.observable(1);
            _this.selectedDirectoryListingType = ko.observable(null);
            _this.getDirectoryListingItem = function () {
                var me = _this;
                var lookup = me.owner.directoryListingTypes();
                var id = me.directoryListingTypeId();
                if (!id) {
                    id = 0;
                }
                var key = id.toString();
                var result = _.find(lookup, function (item) {
                    return item.id == key;
                });
                return result;
            };
            _this.getLookupItem = function (id, lookup) {
                var me = _this;
                if (!id) {
                    id = 0;
                }
                var key = id.toString();
                var result = _.find(lookup, function (item) {
                    return item.id == key;
                });
                return result;
            };
            var me = _this;
            if (Peanut.searchListObservable) {
                me.searchList = new Peanut.searchListObservable(2, 10);
            }
            return _this;
        }
        directoryEditPanel.prototype.createSubscriptionList = function (list, items) {
            items.sort(function (a, b) {
                if (a.name === b.name) {
                    return 0;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            _.each(items, function (item) {
                list.push({
                    code: item.code,
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    subscribed: false
                });
            });
        };
        directoryEditPanel.prototype.assignSubscriptions = function (checkList, viewList, subscriptions) {
            var me = this;
            var check = checkList();
            checkList([]);
            viewList([]);
            var view = [];
            var newList = [];
            _.each(check, function (item) {
                item.subscribed = (subscriptions.indexOf(item.id) > -1);
                if (item.subscribed) {
                    view.push(item);
                }
                newList.push(item);
            });
            checkList(newList);
            viewList(view);
        };
        directoryEditPanel.prototype.getSelectedSubscriptions = function (checkList, viewList) {
            var selected = [];
            var subscriptions = checkList();
            var temp = _.filter(subscriptions, function (item) {
                if (item.subscribed) {
                    selected.push(item.id);
                    return true;
                }
            });
            viewList(temp);
            return selected;
        };
        return directoryEditPanel;
    }(editPanel));
    QnutDirectory.directoryEditPanel = directoryEditPanel;
})(QnutDirectory || (QnutDirectory = {}));
//# sourceMappingURL=DirectoryEntities.js.map