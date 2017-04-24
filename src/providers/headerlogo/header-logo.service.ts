import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
/**
 * A lot of logic to basically do two things:
 *
 * 1. Make sure there is an image locally
 * 2. Make sure there is an image in the remote data (even though we don't use it; used as preference to show it)
 *
 * Added bonus: If not found locally, no reason to keep looking for it and show 404s over and over.
 *
 * If the image is not found locally, but is in data.assets.header_logo, we still tell they app it's not there.
 */ 
export class HeaderLogo { // Service

	hasImage: Observable<boolean>;
	image_url: string = 'assets/header-logo.png';

	constructor() {
		this.hasImage = Observable.create((observer: Observer<boolean>) => {

			// start off not showing the logo until we know it exists
			observer.next(false);

			const img = new Image();

			// you see a 404 each time this happens, so remember that
			img.onerror = () => {
				observer.next(false);
			}

			// found it, so remember that
			img.onload = () => {
				observer.next(true);
			}

			img.addEventListener('load', () => {
				observer.next(true);
			});

			img.src = this.image_url;

			// it was cached, so remember that
			if(img.complete) {
				observer.next(true);
			}
		});
	}

	/**
	 * When we check remote, we are only checking if it's set in the customizer.  We don't use the file, because it should exists locally.
	 * This way if it's not in the customizer, we won't display it even if it exists locally.
	 */
	isRemote(data) {
		if(data.assets && data.assets.header_logo) {
			window.localStorage.setItem('app-header-logo-remote', data.assets.header_logo);

			// Found remotely, but if not found locally, remove the local setting because we want to keep checking for it locally
			if( window.localStorage.getItem('app-header-logo-local') === '' ) {
				window.localStorage.removeItem('app-header-logo-local');
			}
		} else {
			window.localStorage.setItem('app-header-logo-remote', '');
			window.localStorage.setItem('app-header-logo-local', '');
		}
	}

	isLocal() {

		// check only once: keeps from throwing 404s in the console
		if( window.localStorage.getItem('app-header-logo-remote') === '' )
			return;

		const img = new Image();

		// you see a 404 each time this happens, so remember that
		img.onerror = () => {
			window.localStorage.setItem('app-header-logo-local', '');
		}

		// found it, so remember that
		img.onload = () => {
			window.localStorage.setItem('app-header-logo-local', '1');
		}

		img.addEventListener('load', () => {
			window.localStorage.setItem('app-header-logo-local', '1');
		});

		img.src = this.image_url;

		// it was cached, so remember that
		if(img.complete) {
			window.localStorage.setItem('app-header-logo-local', '1');
		}
	}
}