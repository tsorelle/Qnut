declare namespace  QnutDirectory {
    export interface IPersonSelector {
        initialize(finalFunction? : () => void);
        show();
    }
}