const FALLBACK_STAR_COUNT = 5948;
const REPOSITORIES_PER_PAGE = 100;

type Repository = {
	stargazers_count: number;
};

/**
 * Fetches the total stars across public repositories at build time.
 * A fallback keeps local and production builds reliable if the API is unavailable.
 */
export async function getGithubStars(): Promise<number> {
	try {
		let page = 1;
		let totalStars = 0;
		let repositories: Repository[];

		do {
			const url = new URL('https://api.github.com/users/jacklandrin/repos');
			url.searchParams.set('type', 'owner');
			url.searchParams.set('per_page', String(REPOSITORIES_PER_PAGE));
			url.searchParams.set('page', String(page));

			const response = await fetch(url, {
				headers: {
					Accept: 'application/vnd.github+json',
					'User-Agent': 'jacklandrin.github.io',
				},
				signal: AbortSignal.timeout(5000),
			});

			if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

			repositories = (await response.json()) as Repository[];
			totalStars += repositories.reduce((total, repository) => total + repository.stargazers_count, 0);
			page += 1;
		} while (repositories.length === REPOSITORIES_PER_PAGE);

		return totalStars;
	} catch (error) {
		console.warn('Unable to refresh GitHub star count; using fallback.', error);
		return FALLBACK_STAR_COUNT;
	}
}
