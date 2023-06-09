# Dredge Mod Manager
A mod manager for Dredge mods using the Winch mod loader. Can download and install mods from the [DREDGE Mod Database](https://github.com/xen-42/DredgeModDatabase) and handles enabling/disabling the mods using [Winch](https://github.com/Hacktix/Winch).

![Mod manager screenshot](https://github.com/xen-42/DredgeModManager/assets/22628069/8bf559b9-d952-4a9b-92c7-ad0d7fd282d8)

## Development

To run you go `npm install` -> `npm run tauri dev`

Recommended IDE Setup:

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

To regenerate the icon replace `app-icon.png` and run `npm run tauri icon`.

To create a new update, make a PR from dev into main. The commit message will be used as the changelog.

## Thanks

To [bdlm-dev](https://github.com/bdlm-dev) for redoing the front-end.

To [Bwc9876](https://github.com/Bwc9876) for answering my questions about Tauri/rust/actions/everything.


