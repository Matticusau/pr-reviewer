[![License](https://img.shields.io/github/license/Matticusau/pr-reviewer.svg?style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/Matticusau/pr-reviewer.svg?style=flat-square)](https://github.com/heinrichreimer/action-github-changelog-generator/commits)
[![Latest tag](https://img.shields.io/github/tag/Matticusau/pr-reviewer.svg?style=flat-square)](https://github.com/heinrichreimer/action-github-changelog-generator/releases)
[![Issues](https://img.shields.io/github/issues/Matticusau/pr-reviewer.svg?style=flat-square)](https://github.com/heinrichreimer/action-github-changelog-generator/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Matticusau/pr-reviewer.svg?style=flat-square)](https://github.com/heinrichreimer/action-github-changelog-generator/pulls)

# pr-reviewer

[GitHub Action](https://github.com/features/actions) to assign Pull Request reviewers and streamline management PR reviews. Very versatile with plenty of configuration settings.

## Project background - what happened to PR Helper

The functionality provided by this GitHub Action was originally included in the related [PR Helper](https://github.com/Matticusau/pr-helper). In 2022, PR Helper has been separated into modularized GitHub actions focusing on specific functionality, rather than an uber GitHub Action. The main purpose for this is better code support, ability to easily pick and choose functionality for your repos. In addition, GitHub has been adding native support for some of the functionality so this improves the overall lifecycle of each GitHub Action.

## Supported functionality

- Automatically assign reviewers from YAML front matter
- Name matching to github username via Jekyll or DocFX Author/People YAML file. More details [here](./docs/FrontMatter.md).
- Automatic comment explaining reviewer instructions
- Auto labeling based on review status

## Events

The Action can respond to the following [workflow events](https://help.github.com/en/actions/reference/events-that-trigger-workflows):

- pull_request
- pull_request_review
- issue_comment
- schedule

## Inputs

Set the following inputs in the workflow file

### `repo-token`

**Required** The token to use for github authentication. Recommend using `${{ secrets.GITHUB_TOKEN }}`. If additional access is required use a PAT/Secret and set it as a secret. More info see [here](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token).

> If you have enabled Branch Protection rules then a PAT/Secret will need to be configured.

### `enable-frontmatter`

Set to true to enable reviewers to be set from owner in YAML front matter.

### `enable-message`

**Required** Set to true to automatically send a welcome message when the automation runs on `pull_request`

### `message`

The custom welcome message to send to new contributors

Requires `enable-welcomemessage: true`

### `requirereviewcount`

Should match the setting in your GitHub repo. Set it to -1 to disable.

### `authorkey`

The key in the YAML front matter to define the article author(s), who will be assigned as reviewers. Defaults to `author`

```yml
---
title: My great article
author: octocat
---
```

Requires `enable-frontmatter: true`

### `github-user-from-author-file`

When set to `true` enables the lookup of the author from the Jekyll style Author YAML file

Requires `enable-frontmatter: true`

### `authorfilepath`

Provides the ability to configure the path to the Jekyll authors YAML file to use in lookup. Default is `docs/_data/authors.yml`

Requires `enable-frontmatter: true` and `github-user-from-author-file: true`

### `bypass-for-fileowner`

Provides the ability to by pass review checks when all the changed files are owned by the author of the PR.
If you configure [Branch Protection](https://docs.github.com/en/github/administering-a-repository/about-protected-branches) within GitHub security, then it may block this setting from working. Configuring the `prmerge-requirereviewcount` setting in it's place will not affect this setting.

Requires `enable-frontmatter: true`

### `review-required-label`

The label to use when the PR requires reviews

## Outputs

None

## Example usage

Create the following file within your repo as `.github/workflows/prreview.yml` to configure an action.

```yml
name: PR Reviewer

on: [pull_request, pull_request_review, issue_comment]

jobs:
  prhelper_job:
    runs-on: ubuntu-latest
    steps:
    - name: Run PR Reviewer
      id: runprreviewer
      uses: Matticusau/pr-reviewer@v1.2.4
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
```

> Note: The `uses` syntax includes tag/branch specification. For the latest release see [tags](https://github.com/Matticusau/pr-reviewer/tags).

To restrict the branches that this workflow executes on use this syntax

```yml
name: PR Reviewer

on:
  pull_request:
    branches:
      - main
  pull_request_review:
    branches:
      - main
  issue_comment:
    branches:
      - main
jobs:
  ...
```

## Example inputs

The action can be customized using the additional inputs on the workflow yaml file. This will always be read from the default branch of the repository, rather than custom yaml config files which can be overridden as they are read in the branch where the workflow is triggered from.

```yml
with:
  repo-token: ${{ secrets.GITHUB_TOKEN }}
  enable-frontmatter: true
  enable-message: true
  message: "Assign a peer to review the contribution or reach out to those auto assigned."
  requirereviewcount: 1
  authorkey: 'author'
  github-user-from-author-file: true
  authorfilepath: '_data/authors.yaml'
  bypass-for-fileowner: true
  review-required-label: 'review-required'
```

## Suggested Label Colors

Labels will be created during the assignment if they do not exist. The following are suggested labels and colors:

| Label | Description | Color |
| --- | --- | --- |
| review-required | Pull Request or Issue requires review | #fbca04 (yellow) |

## Troubleshooting

If you are having issues running the action enable the debug logs as some additional logging has been built into the Action.

1. To enable runner diagnostic logging, set the following secret in the repository that contains the workflow: `ACTIONS_RUNNER_DEBUG` to `true`.
1. To download runner diagnostic logs, download the log archive of the workflow run. The runner diagnostic logs are contained in the `runner-diagnostic-logs` folder. For more information on downloading logs, see [Downloading logs](https://help.github.com/en/actions/configuring-and-managing-workflows/managing-a-workflow-run#downloading-logs).

[Enable debug logging](https://help.github.com/en/actions/configuring-and-managing-workflows/managing-a-workflow-run#enabling-debug-logging)

## Known issues

None, if you find an issue please report it via the issues
