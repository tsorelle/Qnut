/// <reference path="../../../../pnut/core/ViewModelBase.ts" />
/// <reference path='../../../../typings/knockout/knockout.d.ts' />
/// <reference path='../../../../pnut/core/peanut.d.ts' />

    namespace QnutDirectory {

        interface IInitDownloadsReaponse {
            affiliations: Peanut.ILookupItem[],
            emailLists: Peanut.ILookupItem[],
            postalLists: Peanut.ILookupItem[],
            translations: string[],
        }

        export class DownloadsViewModel extends Peanut.ViewModelBase {
            // observables
            public selectedAffiliation : KnockoutObservable<Peanut.ILookupItem> = ko.observable(null);
            public affiliations = ko.observableArray<Peanut.ILookupItem>([]);
            public elists = ko.observableArray<Peanut.ILookupItem>([]);
            public postallists = ko.observableArray<Peanut.ILookupItem>([]);
            public selectedList = ko.observable<Peanut.ILookupItem>();
            public selectedPostalList = ko.observable<Peanut.ILookupItem>();
            public contactsDirListingOnly = ko.observable(false);
            public addressesDirListingOnly= ko.observable(false);
            public residencesOnly = ko.observable(false);
            public includeKids = ko.observable(true);
            public affiliationListCaption = ko.observable();
            public emailListCaption = ko.observable();
            public elistError = ko.observable(false);
            public plistError = ko.observable(false);
            
            init(successFunction?: () => void) {
                let me = this;
                console.log('Downloads Init');
                me.getInitializations(successFunction);
            }

            getInitializations(successFunction?: () => void) {
                let me = this;
                jQuery('[data-toggle="popover"]').popover();
                me.services.executeService('peanut.qnut-directory::downloads.InitializeDownloads', null ,
                    (serviceResponse: Peanut.IServiceResponse) => {
                        if (serviceResponse.Result == Peanut.serviceResultSuccess) {
                            let response = <IInitDownloadsReaponse>serviceResponse.Value;
                            me.affiliations(response.affiliations);
                            me.elists(response.emailLists);
                            me.postallists(response.postalLists);
                            me.addTranslations(response.translations);
                            me.emailListCaption(me.translate('email-select-caption'));
                            me.affiliationListCaption(me.translate('affiliation-select-caption'));
                        }
                        me.bindDefaultSection();
                    })
                    .fail(() => {
                        let trace = me.services.getErrorInformation();
                        me.hideLoadMessage();
                    }).always(successFunction);
            }

            submitTest = () => {
                let me = this;
                let options = '?value2=test2';
                let url = "/peanut/service/download" + options;
                jQuery("#test-form").attr("action", url).submit();
            };

            submitContacts = () => {
                let me = this;
                let options = '';
                let affiliation = me.selectedAffiliation();
                if (affiliation) {
                    let code = affiliation.code;
                    options = '?affiliation=' + code;
                }
                let url = "/peanut/service/download" + options;
                jQuery("#contacts-form").attr("action", url).submit();

            };

            submitEmailList = () => {
                let me = this;
                let options = '';
                let list = me.selectedList();
                if (list) {
                    me.elistError(false);
                    let code = list.code;
                    options = '?list=' + code;
                    let url = "/peanut/service/download" + options;
                    jQuery("#email-list-form").attr("action", url).submit();
                }
                else {
                    this.elistError(true); // todo::translate list-select-error
                }
            };

            submitPostalList = () => {
                let me = this;
                let options = '';
                let list = me.selectedPostalList();
                if (list) {
                    me.plistError(false);
                    let code = list.code;
                    options = '?list=' + code;
                    let url = "/peanut/service/download" + options;
                    jQuery("#postal-list-form").attr("action", url).submit();
                }
                else {
                    this.plistError(true); // todo::translate list-select-error
                }
            };
        }
    }
