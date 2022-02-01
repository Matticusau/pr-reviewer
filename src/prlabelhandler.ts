//
// Author:  Matt Lavery
// Date:    2022-02-01
// Purpose: Pull Request label handler
//
// When         Who         What
// ------------------------------------------------------------------------------------------
// 2022-02-01   Mlavery     Migrated from PR Helper
//

import { CoreModule, GitHubModule, Context } from './types' // , Client
import { PRHelper, PRFileHelper, MessageHelper, IssueLabels, GlobHelper } from './classes'; // MatchConfig

// export async function prLabelHandler(core: CoreModule, github: GitHubModule, prnumber: number) {
async function prLabelHandler(core: CoreModule, github: GitHubModule, prnumber: number) {
  try {
    const messageHelper = new MessageHelper;

    const prhelper = new PRHelper(core, github);
    const filehelper = new PRFileHelper(core, github);
    // const prnumber = prhelper.getPrNumber();
    if (!prnumber) {
      core.info('Could not get pull request number from context, exiting');
      return;
    }
    core.info(`Processing PR ${prnumber}!`);
  
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    const myToken = core.getInput('repo-token');
    const octokit = github.getOctokit(myToken);

    const { data: pullRequest } = await octokit.pulls.get({
      ...github.context.repo,
      pull_number: prnumber,
    });
    // const { data: pullRequestReviews } = await octokit.pulls.listReviews({
    //   ...github.context.repo,
    //   pull_number: prnumber,
    // });
    
    // get the current labels
    const { data: issueLabelsData } = await octokit.issues.listLabelsOnIssue({
      ...github.context.repo,
      issue_number: prnumber,
    });
    var issueLabels = new IssueLabels(issueLabelsData);

    // core.debug('<< start PR payload >>');
    // core.debug(pullRequest);
    // core.debug('<< end PR payload >>');
    
    // make sure the PR is open
    if (pullRequest.state !== 'closed') {

      // make sure it hasn't merged
      if (pullRequest.merged === false) {
        // check if we need reviews
        if (await prhelper.isMergeReadyByReview(pullRequest)) {
          issueLabels.removeLabel(core.getInput('review-required-label'));
        } else {
          issueLabels.addLabel(core.getInput('review-required-label'));
        }

        core.debug('issueLabels.haschanges: ' + issueLabels.haschanges);
        core.debug('issueLabels.labels: ' + JSON.stringify(issueLabels.labels));

        if (issueLabels.haschanges) {
          // set the label
          await octokit.issues.setLabels({
              owner: github.context.repo.owner,
              repo: github.context.repo.repo,
              issue_number: prnumber,
              labels: issueLabels.labels
          });
        }
      } else {
        core.info(`PR #${prnumber} is merged, no label automation taken`);

      }
    } else {
      core.info(`PR #${prnumber} is closed, no label automation taken`);
    }
      
  }
  catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}


// 
// OnDemand
//
export async function prLabelHandler_OnDemand(core: CoreModule, github: GitHubModule) {

  core.debug('>> prLabelHandler_OnDemand');

  try {
    const prhelper = new PRHelper(core, github);
    const prnumber = prhelper.getPrNumber();
    if (!prnumber) {
      core.info('Could not get pull request number from context, exiting');
      return;
    }
    // core.info(`Processing PR ${prnumber}!`)
    
    // process the pull request
    await prLabelHandler(core, github, prnumber);
  }
  catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}

// 
// OnSchedule
//
export async function prLabelHandler_OnSchedule(core: CoreModule, github: GitHubModule) {

  core.debug('>> prLabelHandler_OnSchedule');

  try {
    
    const myToken = core.getInput('repo-token');
    const octokit = github.getOctokit(myToken);

    // list the prs
    const { data: pullRequestList } = await octokit.pulls.list({
      ...github.context.repo,
      state: 'open',
    });

    for(var iPr = 0; iPr < pullRequestList.length; iPr++){

      // process the pull request
      await prLabelHandler(core, github, pullRequestList[iPr].number);
    
    }
  }
  catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}