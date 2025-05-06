const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    // Get inputs from workflow
    const githubToken = core.getInput("github-token", { required: true });
    const jiraBaseUrl = core.getInput("jira-base-url", { required: true });

    // Initialize Octokit
    const octokit = github.getOctokit(githubToken);

    // Get context data
    const context = github.context;
    const { pull_request, repository } = context.payload;

    if (!pull_request) {
      throw new Error("This action can only be run on pull request events.");
    }

    // Extract Jira issue ID from the head branch name
    const branchName = pull_request.head.ref;
    const issueIdMatch = branchName.match(/^([A-Za-z]+-[0-9]+)/);

    if (!issueIdMatch) {
      core.warning(
        "No Jira issue ID found in branch name. Branch format should be ISSUE-123/description"
      );
      return;
    }

    const issueId = issueIdMatch[1];
    core.info(`Found Jira issue ID: ${issueId}`);

    // Construct Jira URL
    const jiraIssueUrl = `${jiraBaseUrl}/browse/${issueId}`;

    // Update PR title if it doesn't already contain the issue ID
    const currentTitle = pull_request.title;
    if (!currentTitle.includes(issueId)) {
      const newTitle = `${issueId}: ${currentTitle}`;
      core.info(`Updating PR title to: ${newTitle}`);

      await octokit.rest.pulls.update({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pull_request.number,
        title: newTitle,
      });
    } else {
      core.info(
        "PR title already contains Jira issue ID. Skipping title update."
      );
    }

    // Prepare the new PR body
    const jiraLink = `[JIRA Link: ${issueId}](${jiraIssueUrl})`;
    let newBody = "";

    if (pull_request.body) {
      // Check if PR body already contains a Jira link
      if (!pull_request.body.includes("JIRA Link:")) {
        newBody = `${jiraLink}\n---\n${pull_request.body}`;
      } else {
        core.info("PR body already contains Jira link. Skipping body update.");
        return;
      }
    } else {
      newBody = jiraLink;
    }

    // Update PR body
    core.info("Updating PR body with Jira information");
    await octokit.rest.pulls.update({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pull_request.number,
      body: newBody,
    });

    core.info("PR updated successfully with Jira information");
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
