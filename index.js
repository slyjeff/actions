const core = require('@actions/core');
const github = require('@actions/github');
const linearSdk = require('@linear/sdk')

async function main(){
    try {
        const status = core.getInput('status', { required: true });
        const linearApiKey = core.getInput('linear_api_key', { required: true });

        const issueIds = await getIssueIdsForPr();

        const linearClient = new linearSdk.LinearClient({apiKey: linearApiKey});
        for (let x = 0; x < issueIds.length; x++) {
            await updateIssueStatus(issueIds[x], status, linearClient);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function updateIssueStatus(issueId, status, linearClient){
    try {
        core.info("Updating status of " + issueId + " to " + status);

        const issue = await linearClient.issue('pla-1');
        const team = await issue.team;
        const states = await team.states()

        let stateId = null;
        states.nodes.forEach(state => {
            if (state.name.toLowerCase() === status.toLowerCase()) {
                stateId = state.id
            }
        });

        if (stateId === null) {
            core.warning("Could not update issue " + issueId + ": state '" + status + "' not found for team '" + team.name + "'");
            return;
        }
        await linearClient.updateIssue(issueId, {stateId: stateId});
    } catch (error) {
        //if we have an issue updating an issue, don't fail completely. Update whatever we can
        core.warning("Could not update issue " + issueId + ": " + error.message)
    }
}

async function getIssueIdsForPr() {
    const commits = await getCommits()
    return extractIssueIds(commits)
}

async function getCommits() {
    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('github_token', { required: true });

    const octokit = new github.getOctokit(token);

    return await octokit.request("GET /repos/{owner}/{repo}/pulls/{pr_number}/commits", {
        owner: owner,
        repo: repo,
        pr_number: pr_number
    });
}

function extractIssueIds(commits)  {
    const ids = [];

    commits.data.forEach(commit => {
        const message = commit.commit.message
        if (!message.startsWith("Merge pull request #")) {
            return;
        }

        const slashIndex = message.indexOf("/");
        if (slashIndex === -1) {
            return;
        }

        let id = message.substring(slashIndex + 1);
        const firstDashIndex = id.indexOf('-');
        if (firstDashIndex === -1) {
            return;
        }
        const secondDashIndex = id.indexOf('-', firstDashIndex + 1)
        if (secondDashIndex === -1) {
            return;
        }

        id = id.substring(0, secondDashIndex)

        ids.push(id)
    })

    return ids
}

main();