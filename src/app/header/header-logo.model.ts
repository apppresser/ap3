
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
export class HeaderLogo {

	private image_url = 'assets/header-logo.png';
	private data: any;

	constructor() {
		// console.debug('app-header-logo-remote', window.localStorage.getItem('app-header-logo-remote') );
		// console.debug('app-header-logo-local', window.localStorage.getItem('app-header-logo-local') );
	}

	/**
	 * @param data ajax response object from myapppresser.com API
	 */
	imageExists(data) { // locally and remotely

		this.data = data;

		if(this.data.assets) {
			this.isRemote();
		} else if( window.localStorage.getItem('app-header-logo-remote') !== '' ) { // check only once: keeps from throwing 404s in the console
			this.isLocal();
		}
	}

	/**
	 * When we check remote, we are only checking if it's set in the customizer.  We don't use the file, because it should exists locally.
	 * This way if it's not in the customizer, we won't display it even if it exists locally.
	 */
	isRemote() {
		if(this.data.assets.header_logo) {
			window.localStorage.setItem('app-header-logo-remote', this.data.assets.header_logo);

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

		const img = new Image();

		// console.debug('is there a header image locally?');

		// you see a 404 each time this happens, so remember that
		img.onerror = function() {
			// console.debug('logo is not found locally');
			window.localStorage.setItem('app-header-logo-local', '');
		}

		// found it, so remember that
		img.onload = function() {
			// console.debug('logo is found locally');
			window.localStorage.setItem('app-header-logo-local', '1');
		}

		img.src = this.image_url;

		// it was cached, so remember that
		if(img.complete) {
			// console.debug('logo is found locally in cache');
			window.localStorage.setItem('app-header-logo-local', '1');
		}
	}
}