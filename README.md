# Dotfiles!

Most useful config files for my Linux setup

## Requirements

- [GNU stow](https://www.gnu.org/software/stow/)

Install requirements on Fedora:
```shell
sudo dnf install -y stow
```

## Installation

In user home directory:
```shell
git clone https://github.com/KruASe76/.dotfiles
cd .dotfiles/
stow . --adopt
git checkout .
```

Explanation:
1. clone the repo into `~/.dotfiles/` directory
2. `cd` into `.dotfiles/`
3. inject symlinks to all the places using `stow`, overwriting the file contents inside `.dotfiles/` directory with targets' contents (otherwise `stow` woud fail)
4. discard all changes inside the repo - rollback to the original files' state (and so the symlinks would point to original files)

## Reference
Special thanks to this [YouTube tutorial](https://youtu.be/y6XCebnB9gs)
