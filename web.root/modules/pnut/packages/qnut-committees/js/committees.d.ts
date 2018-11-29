/**
 * Created by Terry on 5/19/2016.
 */
interface ICommittee extends ICommitteeUpdate {
    createdby : string;
    createdon : string;
    changedby : string;
    changedon : string;
}

interface ICommitteeView extends ICommittee {
    fulldescriptionTeaser: string;
    notesTeaser: string;
}

interface ICommitteeUpdate {
    id : any;
    name  : string;
    code  : string;
    description  : string;
    organizationId : any;
    fulldescription : string;
    mailbox : string;
    isStanding : any;
    isLiaison  : any;
    membershipRequired  : any;
    notes : string;
    active: any;
}

interface ITermOfService {
    personId : any;
    committeeId: any;
    committeeMemberId: any;
    statusId: any;
    startOfService: string;
    endOfService: string;
    dateRelieved: string;
    roleId: any;
    notes: string;
}

interface ITermOfServiceListItem extends ITermOfService {
    name: string;
    email: string;
    phone: string;
    role: string;
    termOfService: string;
    dateAdded : string;
    dateUpdated : string;
    href: string;
}

interface IGetCommitteeResponse {
    committee: ICommitteeView;
    members : ITermOfServiceListItem[];
}
