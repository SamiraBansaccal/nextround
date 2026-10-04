# UI preview without credentials

Renders real pages and components with stub data (no Clerk, no database), with the real Tailwind CSS,
and takes screenshots in Chromium. Useful in cloud sessions, where the app itself cannot run.

```bash
node .preview/css.mjs          # compile app/globals.css + the classes used in app/ and components/
node .preview/build.mjs        # bundle .preview/entry.tsx with the stubs in .preview/stubs/
node .preview/shot.mjs '[["kinds","page=new"],["list","page=list"],["setup","page=new&kind=hr","continue"]]'
```

Each shot is `[name, query, action?]`; `page=new` renders app/(app)/interview/new with the other query
parameters, `page=list` the interviews list; the action `continue` clicks "Continue to the call check".
Screenshots land in `.preview/<name>.png` (not committed). Add pages in entry.tsx, stubs in build.mjs.
