//
// Author:  Matt Lavery
// Date:    2022-02-01
// Purpose: Process the actions based on event type
//
// When         Who         What
// ------------------------------------------------------------------------------------------
// 2022-02-01   Mlavery     Migrated from PR Helper
//

import prWelcomeHandler from './prwelcomehandler';
import { prLabelHandler_OnDemand, prLabelHandler_OnSchedule } from './prlabelhandler';
import { prReviewHandler_OnDemand } from './prreviewerhandler';
import { CoreModule, GitHubModule } from './types';

export default async function main(core: CoreModule, github: GitHubModule) {
    core.debug('context: ' + github.context);
    
    const event = github.context.eventName
    switch (event) {
        case 'pull_request':
            // await prHandler(client, github.context, config)
            await prWelcomeHandler(core, github);
            await prReviewHandler_OnDemand(core, github);
            await prLabelHandler_OnDemand(core, github);
            break;
        // case 'status':
        //     await statusHandler(client, github.context, config)
        //     break
        case 'pull_request_review':
            await prLabelHandler_OnDemand(core, github);
            break;
        case 'schedule':
            await prLabelHandler_OnSchedule(core, github);
            await prReviewHandler_OnDemand(core, github);
            break;
        case 'workflow_run':
            await prLabelHandler_OnSchedule(core, github);
            await prReviewHandler_OnDemand(core, github);
            break;
    }
}
