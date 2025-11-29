<img src="/looking_glass_icon.png"  width="32px" height="32px"> GNOME Fuzzy App Search
==================

[Fuzzy](https://en.wikipedia.org/wiki/Approximate_string_matching) application search results for [Gnome Search](https://developer.gnome.org/SearchProvider/). Forked from [gnome-fuzzy-search](https://github.com/fffilo/gnome-fuzzy-search).

## Install

### Install from extensions.gnome.org

Go to [the GNOME Extensions page of this extension](https://extensions.gnome.org/extension/3956/gnome-fuzzy-app-search/) and click on the switch to install.

### Install from AUR

You can install GNOME Fuzzy App Search from the AUR package [`gnome-shell-extension-fuzzy-app-search-git`](https://aur.archlinux.org/packages/gnome-shell-extension-fuzzy-app-search-git).

### Install from source

 - Download and unpack [the highest release](https://gitlab.com/Czarlie/gnome-fuzzy-app-search/-/releases) from [the Gitlab repo](https://gitlab.com/Czarlie/gnome-fuzzy-app-search) or `git clone https://gitlab.com/Czarlie/gnome-fuzzy-app-search`
 - Run `make install` inside the `gnome-fuzzy-app-search` root directory
 - On X11, you can press `Alt`+`F2`, enter `r` and press `Enter` to reload extensions (and everything else, too). On Wayland, or if you choose not to reload, the extension will be loaded on your next login.

## How It Works

The search query is split up into [n-grams](https://en.wikipedia.org/wiki/N-gram#n-grams_for_approximate_matching) and matched against an index of the applications you have on your system. A previous version used Levenshtein distances, but this was limited to application titles and didn't scale well (and had bugs).

![fuzzy search enabled](screenshot_after.png "GNOME search showing 'Calculator' for the query 'calxu'")

## Where is this project headed?

I don't have much time between lectures at the moment so I'll probably take
quite a while do work on any of the feature requests that people have given me,
but doing file indexing sounds fun so I might at some point get around to doing
that. At some point GNOME might implement fuzzy search natively, making my extension
obsolete. Until then, I'll try my best to at least be on top of GNOME version
updates to maintain what's currently in here.

Features I am considering adding at some point:
- Fuzzy search in files via/extending the preexisting `tracker3` `localsearch`
- Additional weighting based on app usage (that GNOME can already track)
- Configurable scoring weights for advanced users (though this makes my maintenance harder)
- For users with multiple keyboard layouts, search transposed to the other layout
  (This involves quite a lot of research on my part into input systems so perhaps it's not worth it)
- Search through window titles (Since there isn't already a search provider for this, perhaps
  I would prefer leaving this up to someone else to implement in their own extension with or without
  fuzzy matching; [WSP](https://extensions.gnome.org/extension/6730/wsp-windows-search-provider/)
  implements window search with a different interpretation of "fuzzy")

Some users may be glad to learn that I will never use LLMs to implement any of this,
even if it means this extension's features will stay fairly stagnant. Merge requests
are welcome but I would request those to be hand-written as well.