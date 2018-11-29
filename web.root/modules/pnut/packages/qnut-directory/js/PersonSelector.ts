/// <reference path='../../../../pnut/core/peanut.d.ts' />
/// <reference path="../../../../pnut/core/ViewModelBase.ts" />

namespace QnutDirectory {
    import ViewModelBase = Peanut.ViewModelBase;
    import IPeanutClient = Peanut.IPeanutClient;

    /**
     * Host class for personSelector component
     */
    export class PersonSelector {
        owner : ViewModelBase;
        application: IPeanutClient;
        component :  personSelectorComponent;

        constructor(owner: ViewModelBase) {
            this.owner = owner;
            this.application = owner.getApplication();
        }

        attach = (finalFunction: () => void) => {
            let me = this;
            me.application.loadResources([
                '@pnut/searchListObservable'
            ], () => {
                me.application.attachComponent(
                    '@pkg/qnut-directory/person-selector',
                    this.personSelectorFactory,
                    finalFunction
                );
            });
        };

        personSelectorFactory = (returnFunction: (vm: any) => void) => {
            let me = this;
            me.application.loadComponents('@pkg/qnut-directory/person-selector', () => {
                me.component = new QnutDirectory.personSelectorComponent(me.owner);
                me.component.initialize(() => {
                    returnFunction(me.component);
                });
            });
        };

        show = () => {
           this.component.show();
        };

        hide = () => {
            this.component.hide();
        };
    }
}