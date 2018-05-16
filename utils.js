export function arrayToQueryString(array_in) {
	const out = [];

	Object.keys(array_in).forEach(key => {
		if (array_in[key]) out.push(key + '=' + encodeURIComponent(array_in[key]));
	});

	return out.join('&');
}