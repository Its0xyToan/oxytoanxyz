import type { Metadata } from "next";
import Image from "next/image";

const USERNAME = "Its0xyToan";
const GITHUB_USER_URL = `https://api.github.com/users/${USERNAME}`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const numberFormatter = new Intl.NumberFormat("en-US");

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  blog: string;
  location: string | null;
  company: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  visibility: string;
};

type PortfolioData = {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  error: string | null;
};

export const metadata: Metadata = {
  title: "Portfolio Test",
  description: "Live portfolio playground powered by GitHub data",
};

async function fetchGitHub<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "oxytoanxyz-web-test-portfolio",
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const [user, repos] = await Promise.all([
      fetchGitHub<GitHubUser>(GITHUB_USER_URL),
      fetchGitHub<GitHubRepo[]>(GITHUB_REPOS_URL),
    ]);

    return {
      user,
      repos,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      repos: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function repoScore(repo: GitHubRepo): number {
  const topicsWeight = (repo.topics?.length ?? 0) * 0.4;
  return repo.stargazers_count * 3 + repo.forks_count * 2 + repo.watchers_count + topicsWeight;
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <article className="group rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">{repo.name}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
          {repo.visibility}
        </span>
      </div>

      <p className="mb-4 min-h-10 text-sm leading-6 text-slate-600">
        {repo.description ?? "No description yet."}
      </p>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-900 px-2 py-1 font-medium text-white">
          {repo.language ?? "Unknown"}
        </span>
        {repo.fork ? (
          <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">Fork</span>
        ) : null}
        {repo.archived ? (
          <span className="rounded-full bg-rose-100 px-2 py-1 font-medium text-rose-800">Archived</span>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600">
        <span>Stars {formatNumber(repo.stargazers_count)}</span>
        <span>Forks {formatNumber(repo.forks_count)}</span>
        <span>Issues {formatNumber(repo.open_issues_count)}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Updated {formatDate(repo.updated_at)}</span>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-2 transition group-hover:decoration-slate-900"
        >
          Open repo
        </a>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

export default async function TestPage() {
  const { user, repos, error } = await getPortfolioData();

  if (!user || error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
        <section className="max-w-xl rounded-2xl border border-rose-200 bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-slate-950">Unable to load GitHub portfolio</h1>
          <p className="mt-3 text-sm text-slate-700">{error ?? "Profile data was empty"}</p>
          <p className="mt-2 text-sm text-slate-600">
            This can happen due to GitHub API rate limits. Try reloading later.
          </p>
          <a
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Open GitHub directly
          </a>
        </section>
      </main>
    );
  }

  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalSizeMb = (repos.reduce((sum, repo) => sum + repo.size, 0) / 1024).toFixed(1);
  const accountAgeYears = Math.max(
    0,
    (new Date().getTime() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  const featuredRepos = [...repos]
    .filter((repo) => !repo.disabled)
    .sort((a, b) => repoScore(b) - repoScore(a))
    .slice(0, 8);

  const latestRepos = [...repos]
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 12);

  const languageMap = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) {
      continue;
    }
    languageMap.set(repo.language, (languageMap.get(repo.language) ?? 0) + 1);
  }
  const topLanguages = [...languageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, count]) => ({ language, count }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,_#fff4d8_0%,_#f6fbff_35%,_#dbeafe_100%)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <Image
                src={user.avatar_url}
                alt={`${user.login} avatar`}
                width={80}
                height={80}
                className="h-20 w-20 rounded-2xl border-2 border-white object-cover shadow-md"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live GitHub Portfolio</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {user.name ?? user.login}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">{user.bio ?? "No bio found on profile."}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
              >
                GitHub Profile
              </a>
              {user.blog ? (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-slate-800"
                >
                  Personal Site
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Public repos" value={formatNumber(user.public_repos)} />
            <Stat label="Followers" value={formatNumber(user.followers)} />
            <Stat label="Total stars" value={formatNumber(totalStars)} />
            <Stat label="Code size" value={`${totalSizeMb} MB`} />
            <Stat label="Following" value={formatNumber(user.following)} />
            <Stat label="Total forks" value={formatNumber(totalForks)} />
            <Stat label="Account age" value={`${accountAgeYears.toFixed(1)} years`} />
            <Stat label="Joined" value={formatDate(user.created_at)} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-700">
            {user.location ? <span className="rounded-full bg-slate-100 px-3 py-1">Location: {user.location}</span> : null}
            {user.company ? <span className="rounded-full bg-slate-100 px-3 py-1">Company: {user.company}</span> : null}
            {user.twitter_username ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">Twitter: @{user.twitter_username}</span>
            ) : null}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-950">Language Mix</h2>
              <div className="space-y-3">
                {topLanguages.length === 0 ? (
                  <p className="text-sm text-slate-600">No language data available.</p>
                ) : (
                  topLanguages.map((entry) => (
                    <div key={entry.language} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-800">{entry.language}</span>
                      <span className="text-slate-600">{entry.count} repos</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-950">Latest Activity</h2>
              <div className="space-y-3 text-sm text-slate-700">
                {latestRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                  >
                    <div className="font-medium text-slate-900">{repo.name}</div>
                    <div className="text-xs text-slate-600">Pushed {formatDate(repo.pushed_at)}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-950">Featured Repositories</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-950">All Repositories ({repos.length})</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Repo</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Stars</th>
                  <th className="px-4 py-3">Forks</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo) => (
                  <tr key={repo.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3">
                      <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 underline-offset-2 hover:underline">
                        {repo.full_name}
                      </a>
                    </td>
                    <td className="px-4 py-3">{repo.language ?? "-"}</td>
                    <td className="px-4 py-3">{formatNumber(repo.stargazers_count)}</td>
                    <td className="px-4 py-3">{formatNumber(repo.forks_count)}</td>
                    <td className="px-4 py-3">{formatDate(repo.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <details className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-md">
          <summary className="cursor-pointer text-xl font-bold tracking-tight text-slate-950">Raw GitHub payload (for testing)</summary>
          <div className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-emerald-200">
            <pre>{JSON.stringify({ user, repos }, null, 2)}</pre>
          </div>
        </details>
      </div>
    </main>
  );
}
