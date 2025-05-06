# Jira PR Updater

A GitHub Action that automatically updates Pull Request titles and descriptions with Jira issue information, extracted from branch names.

## Features

- Extracts Jira issue IDs from branch names using the pattern `^[A-Za-z]+-[0-9]+` (e.g., PROJECT-123)
- Prepends the Jira issue ID to the PR title
- Adds a link to the Jira issue in the PR description
- Preserves any existing PR description content

## Example

When creating a PR from a branch named `ABC-123-feature-description`:

- Title will be updated to: `ABC-123: Your PR Title`
- Body will be updated to include:
  ```
  [JIRA Link: ABC-123](https://your-org.atlassian.net/browse/ABC-123)
  ---
  Your original PR description (if any)
  ```

## Setup

### 1. Create Workflow File

Create a file in your repository at `.github/workflows/jira-pr-updater.yml`:

```yaml
name: Jira PR Updater

on:
  pull_request:
    types: [opened, reopened, edited]

jobs:
  update-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Update PR with Jira Info
        uses: srajasimman/jira-pr-updater@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jira-base-url: 'https://your-org.atlassian.net'
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `github-token` | GitHub token used to update PR | Yes | `${{ github.token }}` |
| `jira-base-url` | Base URL for your Jira instance (e.g., https://your-org.atlassian.net) | Yes | N/A |

## Development

### Build the Action

```bash
# Install dependencies
npm install

# Build the action
npm run build
```

### Testing Locally

To test changes locally:

1. Push your changes to a branch in your fork
2. Create a workflow that uses your forked action branch
3. Create a PR to trigger the workflow

## License

This project is licensed under the MIT [License](./LICENSE).
