//
// Author:  Matt Lavery
// Date:    2022-02-01
// Purpose: Pull Request welcomer
//
// When         Who         What
// ------------------------------------------------------------------------------------------
// 2022-02-01   Mlavery     Migrated from PR Helper
//

import { CoreModule, GitHubModule, Context } from './types' // , Client
import { PRHelper, MessageHelper } from './classes';

export default async function prWelcomeHandler(core: CoreModule, github: GitHubModule) {

  try {
    // only on new PR
    if (github.context.eventName === 'pull_request' 
        && github.context.payload.action === 'opened') {

      const prhelper = new PRHelper(core, github);
      const messagehelper = new MessageHelper;
      const prnumber = prhelper.getPrNumber();
      if (!prnumber) {
        core.info('Could not get pull request number from context, exiting');
        return;
      }
      core.info(`Processing PR ${prnumber}!`);
  
      const welcomeMessage = core.getInput('message');
      const myToken = core.getInput('repo-token');
      const octokit = github.getOctokit(myToken);

      // check if the welcome message is to be processed
      if (core.getInput('enable-message') === 'true') {
        // check if this is a new PR
        if (github.context.eventName === 'pull_request' 
          && github.context.payload.action === 'opened'
          && welcomeMessage.length > 0) {
          
          // const octokit = github.getOctokit(myToken);
          await octokit.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prnumber,
            body: welcomeMessage
          });
        }
      }
    }    
  }
  catch (error) {
    core.setFailed(error.message);
    throw error;
  }

}
