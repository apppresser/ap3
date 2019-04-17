export class User {
	public username: String;
	public firstname: String;
	public lastname: String;
	public email: String;
	public avatar: String;
	public role: String;
	public roles: String[];
	public lang: String;
	public rtl: Boolean;
	
	public constructor(data?) {

		if(data) {
			this.username = (data.username) ? data.username : '';
			this.firstname = (data.firstname) ? data.firstname : '';
			this.lastname = (data.lastname) ? data.lastname : '';
			this.email = (data.email) ? data.email : '';
			this.avatar = (data.avatar) ? data.avatar : '';
			this.role = (data.role) ? data.role : '';
			this.roles = (data.roles) ? data.roles : [];
			this.lang = (data.lang) ? data.lang : '';
			this.rtl = (data.rtl);

			// backwards compatiblity
			if(this.role) {
				this.roles.push(this.role);
			}
		}
	}

	hasRole(role: string) : boolean {

		if(this.roles && this.roles.length) {
			
			let roles = this.roles;
			
			if(role && roles && typeof roles === 'object' && roles.length) {
				if(roles.indexOf(role) >= 0) {
					return true;
				}
			}
		}

		return false;
	}
}