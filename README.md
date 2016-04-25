# Visual Studio Team Services Extension
The extension allows you to manage your pull requests for your Team Services Git repositories as well as monitor builds and work items for your team project.  It  will use your Git repository information to connect to Team Services.

![Visual Studio Team Services extension](assets/vscode.png)

Here is the [Walkthrough of the Team Services extension for Visual Studio Code](https://www.youtube.com/watch?v=tpjj5i8f6BE) video that shows many of the features of the extension.

## Ensure you have a Team Services account
If you do not already have a Team Services account, [sign up for Team Services](https://www.visualstudio.com/en-us/get-started/setup/sign-up-for-visual-studio-team-services).

## Install the Extension
First, you will need to install [Visual Studio Code](https://code.visualstudio.com/download) `0.10.8` or later.  Then, in the Visual Studio Code Command Palette (`F1`) select `Install Extension` and choose `Visual Studio Team Services` by Microsoft.

You'll also need to create a personal access token on your Team Services account and add it to Visual Studio Code's user settings.

To create the token and add it to your user settings:

1. Go [here](https://www.visualstudio.com/en-us/get-started/setup/use-personal-access-tokens-to-authenticate) to learn how to create a personal access token for your account.
     - When you create your token, ensure you create it for **All Scopes**.
     - If you would rather not use *All Scopes*, you can enable **Build (read)**, **Code (read)** and **Work items (read)**.  If you do this, note that the Build Status indicator will not function properly until an upcoming update to Team Services.  Once that update is available, the Build Status indicator will begin to function normally and we will update these instructions.
2. Open Visual Studio Code's user settings (**File > Preferences > User Settings**) and add an entry similar to the one below.

  ```javascript
    "team.accessTokens": [
        {
            "account": "your-account-name",
            "token": "access-token"
        }
    ]
  ```

3. Replace **your-account-name** with the name of your Team Services account.  For example, if your Team Services URL is `https://fabrikam.visualstudio.com`, your account name is **fabrikam**.
4. Replace **access-token** with the token you created earlier.

If you would like to add multiple accounts, simply add an additional entry per account.

The extension also supports a *global access token*.  A global access token is one that can be used across all of the Team Services accounts that you have access to (so you will not need to add a token per account in your User Settings).  To create a global token, set the "Accounts" value on the "Create a personal access token" page to "All accessible accounts".  After creating that global token, add an entry to `team.accessTokens` similar to the following:
```javascript
    "team.accessTokens": [
        {
            "account": "global",
            "token": "global-access-token"
        }
    ]
```
- Replace **global-access-token** with the global token you created.

If the extension doesn't find an *account-specific* access token, it'll look for the *global* token.

Here is the [Set up the Team Services extension for Visual Studio Code](https://www.youtube.com/watch?v=NUVbn7gGLvA) video that shows how to create a PAT on your Team Services account and how to properly set it in the User Settings.

## Open a local Team Services Repository folder
After adding your personal access token and restarting Visual Studio Code, open either the root folder or sub-folder of the Team Services repository.  Once a Team Services repository is detected by the extension, the status bar indicators will be active and the commands will be ready.

**Note:** In order for the extension to be activated, a repository *folder* must be opened.  The extension won't be activated if only a single *file* in the repository is opened.

## Status Bar Indicators
* ![Team Project indicator](assets/project-indicator.png) – This status bar item is populated with the name of the team project to which the Git repository belongs.  Clicking on the item will open your browser to the team website.

* ![Pull Requests indicator](assets/pullrequest-indicator.png) – This status bar item is a count of active pull requests that you either requested yourself or were added to explicitly as a reviewer.  Clicking the item will display that list of pull requests in the quick pick list.  Choosing one will take you to that pull request in your browser.  This indicator will update its status every 5 minutes.

* ![Build Status indicator](assets/buildstatus-indicator.png) – This status bar item shows the status of the build for this particular repository and branch.  Hovering over the item will provide additional information about which build was referenced (if any).  Clicking on the item will take you to that build’s summary page in your browser.  This indicator will update its status every 5 minutes.

* ![Pinned Work Item Query Status indicator](assets/pinnedquery-indicator.png) – This status bar item shows the number of items returned by your pinned work item query.  If you have not configured a pinned query it defaults to the work items assigned to you. Clicking the item will show you the work items the query returns.  This indicator will update its status every 5 minutes.

## Commands
In addition to the status bar integrations, the extension also provides several commands for interacting with Team Services.  In the Command Palette (`F1`), type ```team``` and choose a command.

* `team create bug` – Opens your browser to the webpage used to create a new bug.  If a single line of text is highlighted in Visual Studio Code, it will be used as the title of the bug.  The bug will be assigned to you.  You can then choose to update the fields, save, cancel, etc.

* `team create pull request` – Opens your browser for a new pull request based on the current repository and branch.  Before creating the pull request, ensure that you save, commit and push any changes you have before running the command.  Doing so will ensure that all of your latest changes are part of the pull request.

* `team create task` – Opens your browser to the webpage used to create a new task.  If a single line of text is highlighted in Visual Studio Code, it will be used as the title of the task.  The task will be assigned to you.  You can then choose to update the fields, save, cancel, etc.

* `team create work item` – Prompts you to choose a work item type from the list available in your team project.  Once you make a selection, your browser is opened to the webpage used to create the work item.  If a single line of text is highlighted in Visual Studio Code, it will be used as the title of the task.  The work item will be assigned to you.  You can then choose to update the fields, save, cancel, etc.

* `team send feedback` – Prompts you to either send a smile or a frown.  After choosing, you can provide us feedback of up to 1000 characters.  Optionally, provide your email address so we can contact if you needed.  If you do not want to provide your email address, leave it empty (we'll still get your feedback).

* `team view blame` – If a file in the repository is opened in the editor, it will open your browser to the blame page for that file in the current branch in the server repository.

* `team view build summary` – Same behavior as clicking on the Build Status status bar item.

* `team view history` – If a file in the repository is opened in the editor, it will open your browser to the history page for that file in the current branch in the server repository.  Otherwise, the history of the current branch in the server repository will be opened.

* `team view pull requests` – Same behavior as clicking on the Pull Requests status bar item.

* `team view website` – Same behavior as clicking on the team project status bar item.

* `team view work items` – Prompts you to choose a work item that is assigned to you, sorted by ChangedDate descending.  Choosing a work item will open it in your browser.  This command will return a maximum of 200 results with an option to "Browse additional work items...".  Choosing that option will open your browser to show all of the results of your query.

* `team view work item queries` – Prompts you to choose a query stored in your “My Queries” folder in your Team Services team project.  Choosing a query will run it and display the results in the Quick Pick list.  Choosing one of the results will open that work item in your browser.    This command will return a maximum of 200 results with an option to "Browse additional work items...".  Choosing that option will open your browser to show all of the results of your query.  If you don’t have any queries under “My Queries”, you can go to `https://account.visualstudio.com/DefaultCollection/project/_workitems` (where *account* is your account name and *project* is your team project) to create one.

## How to disable telemetry reporting
The Visual Studio Team Services extension collects usage data and sends it to Microsoft to help improve our products and services.  Read our [privacy statement](http://go.microsoft.com/fwlink/?LinkId=528096&clcid=0x409) to learn more.

If you don’t wish to send usage data to Microsoft (including any feedback via the `send feedback` command), add the following entry to User Settings (**File > Preferences > User Settings**):
```javascript
    "team.appInsights.enabled": "false"
```

## Polling interval
The polling interval for the pull request and build status bar indicators defaults to five minutes.  You can change this value in the Visual Studio Code User Settings by adding an entry like the one below.  The minimum value is 1.
```javascript
"team.pollingInterval": 2
```

## Logging
There may be times when you need to enable file logging to troubleshoot an issue.  There are five levels of logging (`error`, `warn`, `info`, `verbose` and `debug`).  Since logging is disabled by default, you can add an entry like the one shown below to Visual Studio Code's User Settings.  Once you are finished logging, either remove the setting or set it to an empty string.
```javascript
"team.logging.level": "debug"
```
The log file will be placed at the root of your workspace and will be named `team-extension.log`.

## Pinned Work Item Queries
You can customize the pinned work item query by adding the following in the Visual Studio Code User Settings. You need to provide the account and the query text or query path.

**Using Query Text**
  ```javascript
    "team.pinnedQueries": [
        {
            "account": "your-account-name",
            "queryText": "SELECT * FROM WorkItems WHERE [System.AssignedTo] = @me AND [System.ChangedDate] > @Today - 14"
        }
    ]
  ```
  
**Using Query Path**
  ```javascript
    "team.pinnedQueries": [
        {
            "account": "your-account-name",
            "queryPath": "Shared Queries/My Folder/My Query"
        }
    ]
  ```
  
  
You can also create a *global* pinned query which will be the default if you have not configured one for your account by replacing *your-account-name* with *global* in the previous examples.

## Support
Support for this extension is provided on our [GitHub Issue Tracker](https://github.com/Microsoft/vsts-vscode/issues).  You can submit a [bug report](https://github.com/Microsoft/vsts-vscode/issues/new), a [feature request](https://github.com/Microsoft/vsts-vscode/issues/new) or participate in [discussions](https://github.com/Microsoft/vsts-vscode/issues). 

## Contributing to the Extension
See the [developer documentation](CONTRIBUTING.md) for details on how to contribute to this extension.

## Privacy Statement
The [Microsoft Visual Studio Product Family Privacy Statement](http://go.microsoft.com/fwlink/?LinkId=528096&clcid=0x409) describes the privacy statement of this software.

## License
This extension is [licensed under the MIT License](LICENSE.txt).  Please see the [third-party notices](Third Party Notices.txt) file for additional copyright notices and license terms applicable to portions of the software.
