

## [v1.117.0](https://github.com/Microsoft/vsts-vscode/tree/v1.117.0) (2017-04-24)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.116.1...v1.117.0)

**Implemented enhancements:**

- TFSVC is listing all changes from the tfs workspace not the current visual studio code workspa [\#179](https://github.com/Microsoft/vsts-vscode/issues/179)

**Fixed bugs:**

- guid specified for parameter projectid must not be guid.empty [\#178](https://github.com/Microsoft/vsts-vscode/issues/178)
- Not able to use TFVC; Getting Forbidden \(403\) [\#172](https://github.com/Microsoft/vsts-vscode/issues/172)

**Closed issues:**

- TFVC fails with a non-English version of TF.exe [\#180](https://github.com/Microsoft/vsts-vscode/issues/180)

**Merged pull requests:**

- Restrict workspace to VS Code workspace \(and others\) [\#186](https://github.com/Microsoft/vsts-vscode/pull/186) ([jeffyoung](https://github.com/jeffyoung))
- Disable functionalithy when no team project is found [\#184](https://github.com/Microsoft/vsts-vscode/pull/184) ([jeffyoung](https://github.com/jeffyoung))

## [v1.116.1](https://github.com/Microsoft/vsts-vscode/tree/v1.116.1) (2017-04-20)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.116.0...v1.116.1)

**Closed issues:**

- TFVC: Error when trying to configure location [\#177](https://github.com/Microsoft/vsts-vscode/issues/177)
- Could not find a workspace with mappings [\#174](https://github.com/Microsoft/vsts-vscode/issues/174)

**Merged pull requests:**

- Add SOAP client to get project collections from TFS [\#182](https://github.com/Microsoft/vsts-vscode/pull/182) ([jeffyoung](https://github.com/jeffyoung))

## [v1.116.0](https://github.com/Microsoft/vsts-vscode/tree/v1.116.0) (2017-04-12)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.115.0...v1.116.0)

**Implemented enhancements:**

- Getting Started [\#147](https://github.com/Microsoft/vsts-vscode/issues/147)

**Closed issues:**

- Team: Signin Issue [\#162](https://github.com/Microsoft/vsts-vscode/issues/162)
- Signin doesn't work [\#160](https://github.com/Microsoft/vsts-vscode/issues/160)

**Merged pull requests:**

- README updates for v1.116.0 [\#171](https://github.com/Microsoft/vsts-vscode/pull/171) ([jeffyoung](https://github.com/jeffyoung))
- Fix up opening diffs and changes [\#170](https://github.com/Microsoft/vsts-vscode/pull/170) ([jeffyoung](https://github.com/jeffyoung))
- Add 'Show Me' button on how to set up a PAT [\#169](https://github.com/Microsoft/vsts-vscode/pull/169) ([jeffyoung](https://github.com/jeffyoung))
- Fixes for first few bug bash bugs [\#168](https://github.com/Microsoft/vsts-vscode/pull/168) ([jeffyoung](https://github.com/jeffyoung))
- Additional changes for linter [\#167](https://github.com/Microsoft/vsts-vscode/pull/167) ([jeffyoung](https://github.com/jeffyoung))
- Filter a couple more events [\#166](https://github.com/Microsoft/vsts-vscode/pull/166) ([jeffyoung](https://github.com/jeffyoung))
- Multi-Select and Undo All [\#165](https://github.com/Microsoft/vsts-vscode/pull/165) ([jeffyoung](https://github.com/jeffyoung))
- Several fixes for Mac+Linux [\#164](https://github.com/Microsoft/vsts-vscode/pull/164) ([jeffyoung](https://github.com/jeffyoung))
- Take latest version of VS Code SCM changes [\#163](https://github.com/Microsoft/vsts-vscode/pull/163) ([jeffyoung](https://github.com/jeffyoung))
- Add checks for non-ENU tf\(.exe\) [\#158](https://github.com/Microsoft/vsts-vscode/pull/158) ([jeffyoung](https://github.com/jeffyoung))
- Move linting after build [\#157](https://github.com/Microsoft/vsts-vscode/pull/157) ([jeffyoung](https://github.com/jeffyoung))
- Always show 'included' group [\#156](https://github.com/Microsoft/vsts-vscode/pull/156) ([jeffyoung](https://github.com/jeffyoung))
- Take 1.11.0 of vscode.proposed.d.ts [\#155](https://github.com/Microsoft/vsts-vscode/pull/155) ([jeffyoung](https://github.com/jeffyoung))
- Various linting updates [\#154](https://github.com/Microsoft/vsts-vscode/pull/154) ([jeffyoung](https://github.com/jeffyoung))
- Get vscode version for user-agent string [\#153](https://github.com/Microsoft/vsts-vscode/pull/153) ([jeffyoung](https://github.com/jeffyoung))
- Some refactoring [\#152](https://github.com/Microsoft/vsts-vscode/pull/152) ([jeffyoung](https://github.com/jeffyoung))
- A couple of message updates [\#151](https://github.com/Microsoft/vsts-vscode/pull/151) ([jeffyoung](https://github.com/jeffyoung))
- Send a custom User-Agent string in headers [\#150](https://github.com/Microsoft/vsts-vscode/pull/150) ([jeffyoung](https://github.com/jeffyoung))
- Just a few more changes... [\#149](https://github.com/Microsoft/vsts-vscode/pull/149) ([jeffyoung](https://github.com/jeffyoung))
- Update visibility of commands in palette [\#148](https://github.com/Microsoft/vsts-vscode/pull/148) ([jeffyoung](https://github.com/jeffyoung))
- Some fixes related to the Undo menu option and command [\#145](https://github.com/Microsoft/vsts-vscode/pull/145) ([jeffyoung](https://github.com/jeffyoung))
- Several fixes after doing some Tfvc conflicts testing [\#144](https://github.com/Microsoft/vsts-vscode/pull/144) ([jeffyoung](https://github.com/jeffyoung))

## [v1.115.0](https://github.com/Microsoft/vsts-vscode/tree/v1.115.0) (2017-03-08)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.113.0...v1.115.0)

**Implemented enhancements:**

- Support projects where the git repository is not on VSTS [\#46](https://github.com/Microsoft/vsts-vscode/issues/46)

**Fixed bugs:**

- Icons are duplicated [\#63](https://github.com/Microsoft/vsts-vscode/issues/63)

**Closed issues:**

- duplicated icons in status bar [\#141](https://github.com/Microsoft/vsts-vscode/issues/141)
- Pinned queries: Unknown configuration setting [\#98](https://github.com/Microsoft/vsts-vscode/issues/98)

**Merged pull requests:**

- Bump version to 115 [\#143](https://github.com/Microsoft/vsts-vscode/pull/143) ([jeffyoung](https://github.com/jeffyoung))
- Fix up FindConflicts and showing of the nag message [\#142](https://github.com/Microsoft/vsts-vscode/pull/142) ([jeffyoung](https://github.com/jeffyoung))
- Updating vsts icon [\#140](https://github.com/Microsoft/vsts-vscode/pull/140) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Use pinned query text, show PAT nag message, stop signout message [\#139](https://github.com/Microsoft/vsts-vscode/pull/139) ([jeffyoung](https://github.com/jeffyoung))
- Fix polling in relation to re-initialization [\#138](https://github.com/Microsoft/vsts-vscode/pull/138) ([jeffyoung](https://github.com/jeffyoung))
- renaming classes to make code more understandable [\#137](https://github.com/Microsoft/vsts-vscode/pull/137) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Fixing some dependency issues [\#136](https://github.com/Microsoft/vsts-vscode/pull/136) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Ensure we fail the build on errors [\#135](https://github.com/Microsoft/vsts-vscode/pull/135) ([jeffyoung](https://github.com/jeffyoung))
- Passing arguments more securly via stdin [\#134](https://github.com/Microsoft/vsts-vscode/pull/134) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Fixing the problem with Include/Exclude [\#133](https://github.com/Microsoft/vsts-vscode/pull/133) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding tests for resourcegroup [\#132](https://github.com/Microsoft/vsts-vscode/pull/132) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding tests for commandhelper and find workspace [\#131](https://github.com/Microsoft/vsts-vscode/pull/131) ([jpricketMSFT](https://github.com/jpricketMSFT))
- adding tests for sync, resolve, info, and rename [\#130](https://github.com/Microsoft/vsts-vscode/pull/130) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Remove collection option from checkin \(tf.exe\) [\#129](https://github.com/Microsoft/vsts-vscode/pull/129) ([jeffyoung](https://github.com/jeffyoung))
- Boost FindConflicts code coverage [\#128](https://github.com/Microsoft/vsts-vscode/pull/128) ([jeffyoung](https://github.com/jeffyoung))
- Adding tests for several commands [\#127](https://github.com/Microsoft/vsts-vscode/pull/127) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Track whether CLC or EXE is being used for TFVC [\#126](https://github.com/Microsoft/vsts-vscode/pull/126) ([jeffyoung](https://github.com/jeffyoung))
- Additional unit tests [\#125](https://github.com/Microsoft/vsts-vscode/pull/125) ([jeffyoung](https://github.com/jeffyoung))
- Making collection optional in argumentbuilder [\#124](https://github.com/Microsoft/vsts-vscode/pull/124) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Fix up status command for tf.exe support [\#123](https://github.com/Microsoft/vsts-vscode/pull/123) ([jeffyoung](https://github.com/jeffyoung))
- Fixing the TODO EXEs in the code [\#122](https://github.com/Microsoft/vsts-vscode/pull/122) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding simple fixes to get the EXE working [\#121](https://github.com/Microsoft/vsts-vscode/pull/121) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Initial tf.exe framework [\#120](https://github.com/Microsoft/vsts-vscode/pull/120) ([jeffyoung](https://github.com/jeffyoung))
- Ensure we have a context before resolve and delete [\#119](https://github.com/Microsoft/vsts-vscode/pull/119) ([jeffyoung](https://github.com/jeffyoung))
- Fixing an issue where we called tf resolve without credentials [\#118](https://github.com/Microsoft/vsts-vscode/pull/118) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding tests for Logger [\#117](https://github.com/Microsoft/vsts-vscode/pull/117) ([jeffyoung](https://github.com/jeffyoung))
- Getting the TFVC folder to 100% [\#116](https://github.com/Microsoft/vsts-vscode/pull/116) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Mo Tests, Mo Tests, Mo Tests [\#115](https://github.com/Microsoft/vsts-vscode/pull/115) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Improve our code coverage [\#114](https://github.com/Microsoft/vsts-vscode/pull/114) ([jeffyoung](https://github.com/jeffyoung))
- Added TFS Proxy settings [\#113](https://github.com/Microsoft/vsts-vscode/pull/113) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Add rename context menu \(and experience\) [\#112](https://github.com/Microsoft/vsts-vscode/pull/112) ([jeffyoung](https://github.com/jeffyoung))
- Add delete \(when files deleted in Explorer\) [\#110](https://github.com/Microsoft/vsts-vscode/pull/110) ([jeffyoung](https://github.com/jeffyoung))
- Moving AssociateWorkItems to the team extension [\#109](https://github.com/Microsoft/vsts-vscode/pull/109) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Added associate work items command [\#108](https://github.com/Microsoft/vsts-vscode/pull/108) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Some refactoring and parsing of WIT ids from commit message [\#107](https://github.com/Microsoft/vsts-vscode/pull/107) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Expose Telemetry service globally [\#106](https://github.com/Microsoft/vsts-vscode/pull/106) ([jeffyoung](https://github.com/jeffyoung))
- Adding commands and icons for Resolve actions [\#105](https://github.com/Microsoft/vsts-vscode/pull/105) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Creating the Conflicts section in the viewlet [\#104](https://github.com/Microsoft/vsts-vscode/pull/104) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding OpenDiff, OpenFile commands and menu items [\#103](https://github.com/Microsoft/vsts-vscode/pull/103) ([jeffyoung](https://github.com/jeffyoung))
- Added Sync command and tests [\#102](https://github.com/Microsoft/vsts-vscode/pull/102) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Add ability to include/exclude changes [\#101](https://github.com/Microsoft/vsts-vscode/pull/101) ([jeffyoung](https://github.com/jeffyoung))
- Adding Checkin and hooking it up to the viewlet [\#100](https://github.com/Microsoft/vsts-vscode/pull/100) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Support undo from viewlet \(inline\) [\#99](https://github.com/Microsoft/vsts-vscode/pull/99) ([jeffyoung](https://github.com/jeffyoung))
- Skeleton menu items [\#97](https://github.com/Microsoft/vsts-vscode/pull/97) ([jeffyoung](https://github.com/jeffyoung))
- Move team commands into Team category [\#96](https://github.com/Microsoft/vsts-vscode/pull/96) ([jeffyoung](https://github.com/jeffyoung))
- Adding TFVC Undo command [\#95](https://github.com/Microsoft/vsts-vscode/pull/95) ([jeffyoung](https://github.com/jeffyoung))
- Cleaning up the code and fixing some bugs [\#94](https://github.com/Microsoft/vsts-vscode/pull/94) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Fixing a few bugs/issues [\#93](https://github.com/Microsoft/vsts-vscode/pull/93) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Adding SCMContentProvider implementation for TFVC [\#92](https://github.com/Microsoft/vsts-vscode/pull/92) ([jpricketMSFT](https://github.com/jpricketMSFT))

## [v1.113.0](https://github.com/Microsoft/vsts-vscode/tree/v1.113.0) (2017-02-07)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.108.0...v1.113.0)

**Closed issues:**

- Ability to select a 'Team' under a 'Project' [\#60](https://github.com/Microsoft/vsts-vscode/issues/60)
- Work items from visualstudio.com should not be visiblewhen they are in a resolved or fixed state. [\#57](https://github.com/Microsoft/vsts-vscode/issues/57)

**Merged pull requests:**

- Add signin/signout, version to 1.113.0 [\#91](https://github.com/Microsoft/vsts-vscode/pull/91) ([jeffyoung](https://github.com/jeffyoung))
- Adding xml2js to ThirdPartyNotices file \(TPN\) [\#90](https://github.com/Microsoft/vsts-vscode/pull/90) ([jeffyoung](https://github.com/jeffyoung))
- Viewlet shows list of files [\#89](https://github.com/Microsoft/vsts-vscode/pull/89) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Support external contexts [\#88](https://github.com/Microsoft/vsts-vscode/pull/88) ([jeffyoung](https://github.com/jeffyoung))
- Show history for TFVC repositories [\#87](https://github.com/Microsoft/vsts-vscode/pull/87) ([jeffyoung](https://github.com/jeffyoung))
- Updating mocha \(to 3\) and vscode components to 1.7 [\#86](https://github.com/Microsoft/vsts-vscode/pull/86) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Added GetInfo command to TFVC commands [\#85](https://github.com/Microsoft/vsts-vscode/pull/85) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Additional error cases, ensure intialization by repo type [\#84](https://github.com/Microsoft/vsts-vscode/pull/84) ([jeffyoung](https://github.com/jeffyoung))
- Adding some debug logging [\#83](https://github.com/Microsoft/vsts-vscode/pull/83) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Fixing the version output and adding tests [\#82](https://github.com/Microsoft/vsts-vscode/pull/82) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Add telemetry for TFVC support [\#81](https://github.com/Microsoft/vsts-vscode/pull/81) ([jeffyoung](https://github.com/jeffyoung))
- Added simple logging of commands to output window [\#80](https://github.com/Microsoft/vsts-vscode/pull/80) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Refactored extension classes [\#79](https://github.com/Microsoft/vsts-vscode/pull/79) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Several changes [\#78](https://github.com/Microsoft/vsts-vscode/pull/78) ([jeffyoung](https://github.com/jeffyoung))
- Restrict Tfvc messages we display in VSC ui [\#77](https://github.com/Microsoft/vsts-vscode/pull/77) ([jeffyoung](https://github.com/jeffyoung))
- Properly handle Team Services collections [\#76](https://github.com/Microsoft/vsts-vscode/pull/76) ([jeffyoung](https://github.com/jeffyoung))
- Add add'l error handling and logging [\#75](https://github.com/Microsoft/vsts-vscode/pull/75) ([jeffyoung](https://github.com/jeffyoung))
- Adding env vars to speed up CLC and force English [\#74](https://github.com/Microsoft/vsts-vscode/pull/74) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Add support for TFS on-prem \(TFVC\) [\#73](https://github.com/Microsoft/vsts-vscode/pull/73) ([jeffyoung](https://github.com/jeffyoung))
- Adding CLC version checks as well as localizing [\#72](https://github.com/Microsoft/vsts-vscode/pull/72) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Updated FindWorkspace to get mappings [\#71](https://github.com/Microsoft/vsts-vscode/pull/71) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Updating chai references to imports [\#70](https://github.com/Microsoft/vsts-vscode/pull/70) ([jeffyoung](https://github.com/jeffyoung))
- Initial extension integration with Tfvc support [\#69](https://github.com/Microsoft/vsts-vscode/pull/69) ([jeffyoung](https://github.com/jeffyoung))
- Status cmd is working - still have a few TODOs [\#68](https://github.com/Microsoft/vsts-vscode/pull/68) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Update build and wit integration tests [\#67](https://github.com/Microsoft/vsts-vscode/pull/67) ([jeffyoung](https://github.com/jeffyoung))
- TFVC command framework in place [\#66](https://github.com/Microsoft/vsts-vscode/pull/66) ([jpricketMSFT](https://github.com/jpricketMSFT))
- Disable collection of all unhandled exceptions [\#61](https://github.com/Microsoft/vsts-vscode/pull/61) ([jeffyoung](https://github.com/jeffyoung))

## [v1.108.0](https://github.com/Microsoft/vsts-vscode/tree/v1.108.0) (2016-10-24)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.104.1...v1.108.0)

**Fixed bugs:**

- Can't connect to TFS 2015 OnPremise [\#41](https://github.com/Microsoft/vsts-vscode/issues/41)

**Closed issues:**

- Do not see in documentation how to connect to existing TFS [\#44](https://github.com/Microsoft/vsts-vscode/issues/44)
- Associate work items with Git commit/push [\#43](https://github.com/Microsoft/vsts-vscode/issues/43)

**Merged pull requests:**

- Updating vscode extension to vso-node-api v5.1.1 [\#56](https://github.com/Microsoft/vsts-vscode/pull/56) ([jeffyoung](https://github.com/jeffyoung))
- Allow markdown in Marketplace to render as GitHub [\#53](https://github.com/Microsoft/vsts-vscode/pull/53) ([jeffyoung](https://github.com/jeffyoung))
- Fix the third-party notices link [\#52](https://github.com/Microsoft/vsts-vscode/pull/52) ([mortonfox](https://github.com/mortonfox))
- Add task to upload code coverage report files [\#50](https://github.com/Microsoft/vsts-vscode/pull/50) ([jeffyoung](https://github.com/jeffyoung))
- Adding more tests for several objects [\#49](https://github.com/Microsoft/vsts-vscode/pull/49) ([jeffyoung](https://github.com/jeffyoung))
- Use gulp-istanbul for code coverage on cmd line [\#48](https://github.com/Microsoft/vsts-vscode/pull/48) ([jeffyoung](https://github.com/jeffyoung))
- Adding additional unit tests and new integration tests [\#47](https://github.com/Microsoft/vsts-vscode/pull/47) ([jeffyoung](https://github.com/jeffyoung))
- Update README.md, add link for more information [\#45](https://github.com/Microsoft/vsts-vscode/pull/45) ([jeffyoung](https://github.com/jeffyoung))

## [v1.104.1](https://github.com/Microsoft/vsts-vscode/tree/v1.104.1) (2016-08-03)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.104.0...v1.104.1)

**Fixed bugs:**

- error trying to perform any command [\#24](https://github.com/Microsoft/vsts-vscode/issues/24)

**Closed issues:**

- Recognize when local folder is pushed to team project [\#27](https://github.com/Microsoft/vsts-vscode/issues/27)

**Merged pull requests:**

- Improve checking of Team Foundation Server server name formats [\#42](https://github.com/Microsoft/vsts-vscode/pull/42) ([jeffyoung](https://github.com/jeffyoung))

## [v1.104.0](https://github.com/Microsoft/vsts-vscode/tree/v1.104.0) (2016-08-02)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.103.0...v1.104.0)

**Fixed bugs:**

- 'create new bug' results in title that is encoded \(OS X Safari only\) [\#37](https://github.com/Microsoft/vsts-vscode/issues/37)
- Cannot read property 'SendException' of undefined [\#35](https://github.com/Microsoft/vsts-vscode/issues/35)
- v15.17 of ApplicationInsights bloats extension VSIX [\#31](https://github.com/Microsoft/vsts-vscode/issues/31)

**Merged pull requests:**

- README updates for 104 release [\#39](https://github.com/Microsoft/vsts-vscode/pull/39) ([jeffyoung](https://github.com/jeffyoung))
- Remove call to encodeURIComponent  [\#38](https://github.com/Microsoft/vsts-vscode/pull/38) ([jeffyoung](https://github.com/jeffyoung))
- Report no requestHandler via feedbackClient [\#36](https://github.com/Microsoft/vsts-vscode/pull/36) ([jeffyoung](https://github.com/jeffyoung))
- Add 'Team Foundation Server' keyword [\#34](https://github.com/Microsoft/vsts-vscode/pull/34) ([jeffyoung](https://github.com/jeffyoung))
- Add filewatcher to config \(remote origin change\) [\#33](https://github.com/Microsoft/vsts-vscode/pull/33) ([jeffyoung](https://github.com/jeffyoung))
- Pin version of ApplicationInsights to 15.16 [\#32](https://github.com/Microsoft/vsts-vscode/pull/32) ([jeffyoung](https://github.com/jeffyoung))
- Improve Team Services login experience [\#30](https://github.com/Microsoft/vsts-vscode/pull/30) ([jeffyoung](https://github.com/jeffyoung))
- Show 'No Git repo' message when appropriate [\#29](https://github.com/Microsoft/vsts-vscode/pull/29) ([jeffyoung](https://github.com/jeffyoung))
- Fix 'collection in the domain' issue \(\#24\) [\#28](https://github.com/Microsoft/vsts-vscode/pull/28) ([jeffyoung](https://github.com/jeffyoung))
- Add VSTS to search keyword list [\#26](https://github.com/Microsoft/vsts-vscode/pull/26) ([chrisdias](https://github.com/chrisdias))

## [v1.103.0](https://github.com/Microsoft/vsts-vscode/tree/v1.103.0) (2016-07-08)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.100.0...v1.103.0)

**Fixed bugs:**

- "create pull request" doesn't populate source branch [\#18](https://github.com/Microsoft/vsts-vscode/issues/18)

**Merged pull requests:**

- Add Team Foundation Server 2015 support [\#22](https://github.com/Microsoft/vsts-vscode/pull/22) ([jeffyoung](https://github.com/jeffyoung))

## [v1.100.0](https://github.com/Microsoft/vsts-vscode/tree/v1.100.0) (2016-05-02)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.99.0...v1.100.0)

**Closed issues:**

- Question: Will this work with VSTS and git-tfs? [\#13](https://github.com/Microsoft/vsts-vscode/issues/13)

**Merged pull requests:**

- Pinned Query Status Bar Item [\#17](https://github.com/Microsoft/vsts-vscode/pull/17) ([mmanela](https://github.com/mmanela))
- Refactoring original Settings into Account Settings and Settings [\#16](https://github.com/Microsoft/vsts-vscode/pull/16) ([jeffyoung](https://github.com/jeffyoung))
- Refactoring into Info objects  [\#15](https://github.com/Microsoft/vsts-vscode/pull/15) ([jeffyoung](https://github.com/jeffyoung))
- Limiting keywords to five \(latest vsce requirement\) [\#14](https://github.com/Microsoft/vsts-vscode/pull/14) ([jeffyoung](https://github.com/jeffyoung))

## [v1.99.0](https://github.com/Microsoft/vsts-vscode/tree/v1.99.0) (2016-04-14)
[Full Changelog](https://github.com/Microsoft/vsts-vscode/compare/v1.98.0...v1.99.0)

**Implemented enhancements:**

- Could this work with my own Team Foundation Server ? [\#11](https://github.com/Microsoft/vsts-vscode/issues/11)

**Merged pull requests:**

- Adding additional telemetry for WIT [\#12](https://github.com/Microsoft/vsts-vscode/pull/12) ([jeffyoung](https://github.com/jeffyoung))
- Update README with information on the maximum number of returned work… [\#9](https://github.com/Microsoft/vsts-vscode/pull/9) ([jeffyoung](https://github.com/jeffyoung))
- Return a maximum of 200 work items with an option to open browser for… [\#8](https://github.com/Microsoft/vsts-vscode/pull/8) ([jeffyoung](https://github.com/jeffyoung))
- Check for accounts ending with ".visualstudio.com" in accessTokens [\#7](https://github.com/Microsoft/vsts-vscode/pull/7) ([jeffyoung](https://github.com/jeffyoung))
- Remove confusing statement about basic authentication [\#6](https://github.com/Microsoft/vsts-vscode/pull/6) ([jeffyoung](https://github.com/jeffyoung))
- Add telemetry to track 'startup' event [\#5](https://github.com/Microsoft/vsts-vscode/pull/5) ([jeffyoung](https://github.com/jeffyoung))
- Update README.md with links to videos and a section on Support [\#4](https://github.com/Microsoft/vsts-vscode/pull/4) ([jeffyoung](https://github.com/jeffyoung))
-  team.appInsights.enabled default value should be bool [\#3](https://github.com/Microsoft/vsts-vscode/pull/3) ([gaessaki](https://github.com/gaessaki))
- Fixing the fomatting of the first numbered list in the readme [\#2](https://github.com/Microsoft/vsts-vscode/pull/2) ([buckh](https://github.com/buckh))
- CONTRIBUTING: Fix link to Node packages. [\#1](https://github.com/Microsoft/vsts-vscode/pull/1) ([joshgav](https://github.com/joshgav))

## [v1.98.0](https://github.com/Microsoft/vsts-vscode/tree/v1.98.0) (2016-03-25)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*