import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { User } from "../../models/user.model";

export class LoginService {
	private userObs = new Subject<User>();
	public user: User;

	setLoginStatus(user: User) {
		this.user = user;
		this.userObs.next(this.user);
	}

	removeLoginStatus() {
		this.user = null;
		this.userObs.next(null);
	}

	loginStatus(): Observable<User> {
		// return the observable
		return this.userObs;
	}
}