const { string } = require('fark').propTypes;
const request = require('request-promise-native');

function getDefaultBranchForBitbucketRepository (remoteUrl) {
	const repositoryName = remoteUrl.substr(remoteUrl.indexOf(':') + 1);
	const uri = `https://api.bitbucket.org/2.0/repositories/${repositoryName}`;

	return request({
			uri,
			auth: {
				user: process.env.BITBUCKET_USERNAME,
				pass: process.env.BITBUCKET_API_KEY
			},
			json: true
		})
		.then((response) => response.mainbranch.name);
}

module.exports = {
	name: 'git-remote-default-branch',
	dependencies: ['git-remote-host'],
	retrieve: ({ gitRemotes }, path) => {
		const remoteNames = Object.keys(gitRemotes);
		return Promise.all(remoteNames.map(remoteName => {
			const remoteUrl = gitRemotes[remoteName];
			// Quick and dirty URL parsing
			const remoteUrlHost = remoteUrl.split(/[:@]/)[1];

			switch (remoteUrlHost) {
				case 'bitbucket.org':
					return getDefaultBranchForBitbucketRepository(remoteUrl);
				case 'github.com':
					// @TODO
				default:
					// Can not error, the show must go on.
					return Promise.resolve('(unknown)');
			}
		})
		.map(deferred => deferred.catch(error => {
			// One repository could not be resolved for whatever reason, ignore
			return '(error)';
		})))
		.then(defaultBranches => ({
			gitDefaultBranches: remoteNames.reduce((stats, remoteName, i) => Object.assign(stats, {
				[remoteName]: defaultBranches[i]
			}), {})
		}))
	},
	props: [
		{
			name: 'git-default-branches',
			type: string,
			description: 'The default branches for each of the git remotes',
			callback: ({ gitDefaultBranches }) => Object.keys(gitDefaultBranches).map(remoteName => gitDefaultBranches[remoteName]).join(', ')
		}
	]
};