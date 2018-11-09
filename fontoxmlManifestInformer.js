const path = require('path');
const fs = require('fs');
const fark = require('fark');

module.exports = {
	name: 'fontoxml-manifest',

	dependencies: [],

	retrieve: (info, location) => {
		try {
			const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), location, 'manifest.json'), 'utf8'));
			return {
				isFontoxmlEditor: true,
				fontoxmlManifestJson: manifest
			}
		} catch (e) {
			return {
				isFontoxmlEditor: false,
			};
		}
	},

	props: [
		{
			name: 'fonto-sdk',
			type: fark.propTypes.semver,
			description: 'SDK version of a FontoXML editor',
			callback: ({ isFontoxmlEditor, fontoxmlManifestJson }) => (isFontoxmlEditor && fontoxmlManifestJson.sdkVersion) || null
		},
		{
			name: 'has-fonto-addon',
			type: fark.propTypes.boolean,
			isFilterable: true,
			description: 'Assert that the Fonto editor has addon $1',
			callback: ({ isFontoxmlEditor, fontoxmlManifestJson }, addonName) => isFontoxmlEditor &&
				Array.isArray(fontoxmlManifestJson.addonNames) &&
				fontoxmlManifestJson.addonNames.includes(addonName) ||
				null
		}
	]
};
