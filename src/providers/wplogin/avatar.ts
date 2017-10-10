export class Avatar {
	/**
	 * If a URL has a relative protocol, //gravatar.com, we need to force one
	 * 
	 * @param url 
	 * @param protocol Default: https
	 */
	fixProtocolRelativeUrl( url: string, protocol?: string ) {

		protocol = protocol ? protocol: 'https';

		if(url.indexOf('//') === 0)
			return protocol + ':' + url;
		else
			return url;
	}
}