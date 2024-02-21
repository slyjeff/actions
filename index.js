const core = require('@actions/core');
const github = require('@actions/github');

async function main(){
    try {
        const commits = await getCommits()
        const ids = extractIssueIds(commits)
        console.log(ids)
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getCommits() {
    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('token', { required: true });
    // const owner = 'slyjeff';
    // const repo = 'repotest';
    // const pr_number = 3;
    // const token = '';

    const octokit = new github.getOctokit(token);

    return await octokit.request("GET /repos/{owner}/{repo}/pulls/{pr_number}/commits", {
        owner: owner,
        repo: repo,
        pr_number: pr_number
    });
}

function extractIssueIds(commits)  {
    const issuePrefix = "issue-";

    const ids = [];

    commits.data.forEach(commit => {
        const message = commit.commit.message
        if (!message.startsWith("Merge pull request #")) {
            return;
        }

        const issuePrefixIndex = message.indexOf(issuePrefix);
        if (issuePrefixIndex === -1) {
            return;
        }

        let id = message.substring(issuePrefixIndex + issuePrefix.length)
        const newLineIndex = id.indexOf("\n")
        if (newLineIndex > -1) {
            id = id.substring(0, newLineIndex)
        }

        ids.push(id)
    })

    return ids
}

main();