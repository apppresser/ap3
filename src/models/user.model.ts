export class User {
	public username: String;
	public firstname: String;
	public lastname: String;
	public email: String;
	public avatar: String;
	public role: String;
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
			this.lang = (data.lang) ? data.lang : '';
			this.rtl = (data.rtl);
		}
	}
}