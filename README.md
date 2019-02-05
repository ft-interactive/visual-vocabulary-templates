# Visual Vocabulary

A library of data driven graphics -- to be used as starting points for static graphics to be further refined through Illustrator.
[Viewable here](http://ft-interactive.github.io/visual-vocabulary/)

## Offline mode

If you want to use a template offline, `cd` into the relevant directory and run the following:

```
npx @financial-times/d3-bootloader
```

This will download all dependencies into your local ./offline folder and rewrite index.html to use local dependencies.

N.b., you need to be online the first time you run this. Afterwards `npx` should have a cached copy it can use.

## Code style

Files in this repo use the AirBnb base ESLint standard. It is recommended you install [linter-eslint][atom]
if you're using Atom, or [SublimeLinter-eslint][sublime] for Sublime Text.

**Tip:**

Install everything globally if you plan to move folders out of this repo to do work:

```bash
$ npm install --global eslint@^3 eslint-config-airbnb-base@^11 eslint-plugin-html eslint-plugin-import
```

Both of the aforementioned editor plugins have an option to use global installations.

## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).

Please note the MIT licence includes only the software, and does not cover any FT content made available using the software, which is copyright &copy; The Financial Times Limited, all rights reserved. For more information about re-publishing FT content, please contact our [syndication department](http://syndication.ft.com/).

[atom]: https://atom.io/packages/linter-eslint
[sublime]: https://github.com/roadhump/SublimeLinter-eslint
