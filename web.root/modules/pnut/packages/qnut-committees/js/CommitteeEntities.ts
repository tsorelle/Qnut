/**
 * Created by Terry on 5/19/2016.
 */
/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path='../../../../pnut/js/editPanel.ts' />
///<reference path='../../../../typings/knockout/knockout.d.ts' />
///<reference path='../../../../typings/jquery/jquery.d.ts' />
/// <reference path='../../../../pnut/js/selectListObservable.ts' />
/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path="committees.d.ts"/>
/// <reference path='../../../../pnut/js/searchListObservable.ts' />

namespace QnutCommittees {

    import INameValuePair = Peanut.INameValuePair;
    import selectListObservable = Peanut.selectListObservable;
    import editPanel = Peanut.editPanel;
    import ViewModelBase = Peanut.ViewModelBase;

    /** observable container classes **/


    export class termOfServiceObservable extends editPanel {
        id: any;
        committeeId: any;
        personId = ko.observable(0);
        committeeName = ko.observable('');
        name = ko.observable('');
        email = ko.observable('');
        phone = ko.observable('');
        href = ko.observable('');
        startOfService = ko.observable('');
        endOfService = ko.observable('');
        dateRelieved = ko.observable('');
        notes = ko.observable('');
        dateAdded = ko.observable('');
        dateUpdated = ko.observable('');

        dateError = ko.observable(false);


        role: selectListObservable;
        status: selectListObservable;
        backup: ITermOfServiceListItem = null;

        public constructor(owner : ViewModelBase) {
            super(owner);
            let me = this;
            me.role = new selectListObservable(null, [
                {Name: 'member', Value: '1'},
                {Name: 'clerk', Value: '2'},
                {Name: 'co-clerk', Value: '3'},
                {Name: 'convener', Value: '4'},
                {Name: 'correspondent', Value: '5'},
                {Name: 'ex officio', Value: '7'},
                {Name: 'recorder', Value: '6'}], '1');

            me.status = new selectListObservable(null, [
                {Name: 'nominated', Value: '1'},
                {Name: 'first reading', Value: '2'},
                {Name: 'approved', Value: '3'},
                {Name: 'withdrawn', Value: '4'}], '1');
        }

        public clear = () => {
            let me = this;
            me.id = 0;
            me.personId(0);
            me.name('');
            me.email('');
            me.phone('');
            me.role.restoreDefault();
            me.status.restoreDefault();
            me.startOfService('');
            me.endOfService('');
            me.dateRelieved('');
            me.notes('');
            me.dateAdded('');
            me.href('');
            me.dateUpdated('');
            me.hasErrors(false);
            me.dateError(false);
        };

        public assign = (term: ITermOfServiceListItem, committeeName: string) => {
            let me = this;
            me.backup = term;
            me.committeeId = term.committeeId;
            me.id = term.id;
            me.personId(term.personId);
            me.committeeName(committeeName);
            me.name(term.name);
            me.email(term.email);
            me.phone(term.phone);
            me.href(term.href);

            me.startOfService(me.owner.isoToShortDate(term.startOfService));
            me.endOfService(me.owner.isoToShortDate(term.endOfService));
            me.dateRelieved(me.owner.isoToShortDate(term.dateRelieved));

            me.notes(term.notes);
            me.dateAdded(term.dateAdded);
            me.dateUpdated(term.dateUpdated);
            me.hasErrors(false);
            me.dateError(false);

            me.role.setValue(term.roleId);
            me.status.setValue(term.statusId);

            me.isAssigned = true;
        };

        public rollback() {
            let me = this;
            if (me.backup) {
                me.assign(me.backup, me.committeeName());
            }
            else {
                me.clear();
            }
        }

        public validate = () => {
            let me = this;
            me.hasErrors(false);
            me.dateError(false);
            if (!me.startOfService()) {
                me.dateError(true);
                me.hasErrors(true);
            }
            return !me.hasErrors();
        };

        getValues = (): ITermOfService => {
            let me = this;
            let statusId = me.status.getValue();
            let roleId = me.role.getValue();
            let result: ITermOfService = {
                id: me.id,
                committeeId: me.committeeId,
                personId: me.personId(),
                statusId: statusId,
                startOfService: me.owner.shortDateToIso(me.startOfService()),
                endOfService: me.owner.shortDateToIso(me.endOfService()),
                dateRelieved: me.owner.shortDateToIso(me.dateRelieved()),
                roleId: roleId,
                notes: me.notes()
            };
            return result;
        };
    }

    export class committeeObservable extends editPanel {

        committeeId = ko.observable(0);

        description = ko.observable('');
        fulldescription = ko.observable('');
        name = ko.observable('');
        mailbox = ko.observable('');
        active: KnockoutObservable<boolean> = ko.observable(true);
        isStanding: KnockoutObservable<boolean> = ko.observable(true);
        isLiaison: KnockoutObservable<boolean> = ko.observable(true);
        membershipRequired: KnockoutObservable<boolean> = ko.observable(true);
        notes = ko.observable('');
        dateAdded = ko.observable('');
        dateUpdated = ko.observable('');
        fulldescriptionTeaser = ko.observable('');
        notesTeaser = ko.observable('');


        nameError = ko.observable(false);
        descriptionError = ko.observable(false);
        descriptionEditor: any; // tinymce
        notesEditor: any; // tinymce

        organizationId: any;

        private backup: ICommitteeView = null;

        public initialize(finalFunction: () => void) {
            let me = this;
            me.initEditor('#committee-full-description');
            me.descriptionEditor = tinymce.get('committee-full-description');
            me.initEditor('#committee-notes');
            me.notesEditor = tinymce.get('committee-notes');
            finalFunction();
        }

        initEditor = (selector: string) => {
            tinymce.init({
                selector: selector,
                menubar: false,
                // toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | image",
                toolbar: "styleselect | bold italic | bullist numlist outdent indent | cut copy paste | image link",
                plugins: "image imagetools link lists",
                default_link_target: "_blank",
                branding: false,
                height: 75
            });
        };


        public clear() {
            let me = this;
            me.committeeId(0);
            me.description('');
            me.active(true);
            me.name('');
            me.mailbox('');
            me.isLiaison(false);
            me.isStanding(true);
            me.membershipRequired(false);
            me.notes('');
            me.dateUpdated('');
            me.dateAdded('');
            me.hasErrors(false);
            me.nameError(false);
            me.descriptionError(false);
            me.fulldescriptionTeaser('');
            me.notesTeaser('');
            me.fulldescription('');
            me.notes('');
            me.organizationId = null;
        }

        public assign(committee: ICommitteeView) {
            let me = this;
            me.backup = committee;
            me.committeeId(committee.id);
            me.name(committee.name);
            me.mailbox(committee.mailbox);
            me.active(committee.active == 1);
            me.isStanding(committee.isStanding == 1);
            me.isLiaison(committee.isLiaison == 1);
            me.membershipRequired(committee.membershipRequired == 1);
            me.description(committee.description);
            me.fulldescription(committee.fulldescription);
            me.descriptionEditor.setContent(committee.fulldescription || '');
            me.notes(committee.notes);
            me.notesEditor.setContent(committee.notes ||'');
            me.dateAdded(committee.createdon);
            me.dateUpdated(committee.changedon);
            me.hasErrors(false);
            me.nameError(false);
            me.descriptionError(false);
            me.fulldescriptionTeaser(committee.fulldescriptionTeaser);
            me.notesTeaser(committee.notesTeaser);
            me.organizationId = committee.organizationId;
        }

        public rollback() {
            let me = this;
            if (me.backup) {
                me.assign(me.backup);
            }
            else {
                me.clear();
            }
        }

        public getValues = (): ICommitteeUpdate => {
            let me = this;
            tinymce.triggerSave();
            me.fulldescription(jQuery('#committee-full-description').val());
            me.notes(jQuery('#committee-notes').val());
            let result: ICommitteeUpdate = {
                id: me.committeeId(),
                active: me.active() ? 1 : 0,
                mailbox: me.mailbox(),
                isStanding: me.isStanding() ? 1 : 0,
                isLiaison: me.isLiaison() ? 1 : 0,
                membershipRequired: me.membershipRequired()  ? 1 : 0,
                name: me.name(),
                notes: me.notes(),
                description: me.description(),
                fulldescription: me.fulldescription(),
                organizationId: me.organizationId,
                code : null, // not supported in this version.
            };

            return result;
        };

        public validate = () => {
            let me = this;

            me.hasErrors(false);
            if (me.committeeId() == 0 && me.name().trim() === '') {
                me.nameError(true);
                me.hasErrors(true);
            }
            else {
                me.nameError(false);
            }

            if (me.description().trim() === '') {
                me.descriptionError(true);
                me.hasErrors(true);
            }
            else {
                me.descriptionError(false);
            }

            return !me.hasErrors();
        };

        public editMode = () => {

            // me.descriptionEditor.show();
            this.edit();
        }
    }
}