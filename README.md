# Dredge Mod Manager

![GitHub all releases](https://img.shields.io/github/downloads/DREDGE-Mods/DredgeModManager/total?style=for-the-badge)
![GitHub release (latest by date)](https://img.shields.io/github/downloads/DREDGE-Mods/DredgeModManager/latest/total?style=for-the-badge)

A mod manager for Dredge mods using the Winch mod loader. Can download and install mods from the [DREDGE Mod Database](https://github.com/DREDGE-Mods/DredgeModDatabase) and handles enabling/disabling the mods using [Winch](https://github.com/Hacktix/Winch).

![Mod manager screenshot](https://github.com/DREDGE-Mods/DredgeModManager/assets/22628069/8bf559b9-d952-4a9b-92c7-ad0d7fd282d8)

## Troubleshooting (for users)

_**The manager prompted me to install a new update, but nothing changed!**_

We're not sure why that happens some times, just uninstall the manager and reinstall it from here.

_**The manager instantly closes when I try to launch it**_

Did you at some point uninstall Microsft Edge from Windows? As a Tauri app, the Dredge Mod Manager uses Microsoft Edge Runtime2.

## Development (for devs)

To run you go `npm install` -> `npm run tauri dev`

Be sure to install [prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites/)

Recommended IDE Setup:

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

To regenerate the icon replace `app-icon.png` and run `npm run tauri icon`.

### Releasing updates

First make sure to search for the previous version number in the manager files and update it to the new value. Follow semver.

Make a PR from dev into main. When the PR is actually merged, the commit message will be used as the changelog, so update it accordingly. We should really have the release action copy the description of the PR into there too.

The action will then create a draft release from that dev->main PR. Make sure to write in the changelog into the description of the release, and change the tag to the format vX.X.X (put actual version number). Then publish.

## Thanks

To [bdlm-dev](https://github.com/bdlm-dev) for redoing the front-end (twice). 

To [Bwc9876](https://github.com/Bwc9876) for answering my questions about Tauri/rust/actions/everything.

To [dasea/SeaKestrel](https://github.com/SeaKestrel) for Linux support.

To [MegaPiggy](https://github.com/MegaPiggy) for maintenance.

Originally made and maintained by [xen-42](https://github.com/xen-42).


