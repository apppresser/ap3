import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { LoginService } from './login.service';

@Injectable()
export class RolesService {

	public user: User;

	constructor(
		private loginservice: LoginService
	) {
		this.loginservice.loginStatus().subscribe(user => this.user = user);
	}

	/**
	 * Tests the extra_classes of a menu item again role attached to a user
	 * 
	 * @param role Must begin with 'role-'. This could be the whole extra_class set
	 */
	test_user_role(extra_classes: string) {
		if( extra_classes && extra_classes.indexOf('role-') >= 0) {

			// this menu item has a role to test

			let a_extra_classes = extra_classes.split(' ');
			let user_role = (this.user && this.user.role) ? this.user.role : false;
			let user_roles = (this.user && this.user.roles && this.user.roles.length) ? this.user.roles : false;
			
			if(user_role === false && user_roles === false) {
				// user has no roles, fail
				return false;
			}

			let role_to_test = '';
			
			// match the menu items role to the user's
			for(let i=0;i < a_extra_classes.length; i++) {

				if(a_extra_classes[i].indexOf('role-') === 0) {

					role_to_test = a_extra_classes[i].replace('role-', '');

					// match a single role
					if(role_to_test == user_role) {
						// Match! This user passes
						return true;
					}
	
					// match one of the roles
					if(this.hasRole(role_to_test)) {
						// Match! This user passes
						return true;
					}
				}
				
			}

			// fail, user did not match any roles
			return false;
		}

		// no role to test, ok to add the item to the menun
		return true;
	}

	hasRole(role: string) : boolean {
		return (this.user && this.user.hasRole(role));
	}

}
