# Science in a Hurry

This repository contains the simple public hub for:

- SciSims
- StudyBuddy 3000
- Science in a Hurry YouTube videos
- Teachers Pay Teachers resources

The homepage also displays recent activity from the SciSims and SB3K GitHub repositories.

## Upload the first version

The repository is currently empty.

1. Open the `SIAH-site-v1` folder.
2. Select:
   - `index.html`
   - `style.css`
   - `script.js`
   - the `data` folder
3. Drag those items into the empty SIAH repository page.
4. Enter the commit message:
   `Add first Science in a Hurry site`
5. Select **Commit changes**.

Do not upload the enclosing `SIAH-site-v1` folder itself. Upload the files inside it.

## Turn on GitHub Pages

1. Open **Settings** in the SIAH repository.
2. Select **Pages**.
3. Under **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
4. Select **Save**.

The expected address is:

`https://scisims3000.github.io/SIAH/`

## How the updates work

### Automatic updates

`script.js` requests the three latest public commits from:

- `SciSims3000/SciSims`
- `SciSims3000/SB3K`

The newest nine updates are shown.

### Manual updates

YouTube, Teachers Pay Teachers and major announcements can be added to:

`data/updates.json`

Copy an existing entry and change:

- `source`
- `title`
- `description`
- `date`
- `url`

Use a date in this form:

`2026-07-13T16:00:00+10:00`

Remember to place a comma between entries, but not after the final entry.

## Add the Teachers Pay Teachers link

In `index.html`, find:

`Store coming soon`

Replace the surrounding `<span>` with:

```html
<a
  class="card-link"
  href="PASTE-TPT-LINK-HERE"
  target="_blank"
  rel="noopener noreferrer"
>
  Visit the store <span aria-hidden="true">↗</span>
</a>
```
