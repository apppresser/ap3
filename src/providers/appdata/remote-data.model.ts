import { Guid } from "guid-typescript";

export class RemoteData {
	public guid: Guid;
	public apiUrl: string;
	public timestamp: number;
	public data: object;
	public token: string;
	public type: string;
	public isLog: boolean = false;

	constructor(apiUrl: string, options?: any) {
		this.apiUrl = apiUrl;
		this.guid = Guid.create();
		this.timestamp = new Date().getTime();

		if(options) {
			if(options.type)
				this.type = options.type;
			if(options.isLog)
				this.isLog = true;
			if(options.token)
				this.token = options.token;
		}
	}

	getDbKey() {
		if(this.isLog)
			return 'rdata-log-' + this.type + '-' + this.guid.toString();
		else if(this.type)
			return 'rdata-' + this.type + '-' + this.guid.toString();
		else
			return 'rdata-' + this.guid.toString();
	}
}