if status is-interactive
    # Modifying $PATH
    fish_add_path $HOME/.local/bin
    fish_add_path $HOME/.local/share/JetBrains/Toolbox/scripts
    fish_add_path $HOME/.cargo/bin
    fish_add_path /home/linuxbrew/.linuxbrew/bin

    # English!
    alias git='LC_ALL=en_US.utf8 command git'

    # Custom variables
    set -gx vm "root@45.89.244.232"
    set -gx mclocal_version "20"
    set -gx ALSOFT_DRIVERS "pulse"
    set -gx YDOTOOL_SOCKET '$HOME/.ydotool_socket'
    set -gx OLLAMA_HOST "127.0.0.1:12345"
    set -gx OLLAMA_KEEP_ALIVE "10m"
    set -gx HIP_VISIBLE_DEVICES "0,1"
    set -gx HSA_OVERRIDE_GFX_VERSION "11.0.2"

    # Abbreviations
    abbr -a fc 'nano ~/.config/fish/config.fish && source ~/.config/fish/config.fish'

    abbr -a su 'sudo -E fish'
    abbr -a sudo 'sudo -E'

    abbr -a rm 'rm -I --preserve-root'
    abbr -a mv 'mv -i'
    abbr -a cp 'cp -i'
    abbr -a ln 'ln -si'
    abbr -a ls 'eza'
    abbr -a ll 'eza -lh'
    abbr -a la 'eza -lhA'
    abbr -a mkdir 'mkdir -p'
    abbr -a --position anywhere grep 'grep -E'
    abbr -a duc 'dust -r'
    abbr -a cat 'bat'
    abbr -a catt 'bat -p'
    abbr -a batt 'bat -p'

    abbr -a up 'sudo dnf5 --refresh upgrade'
    abbr -a upy 'sudo dnf5 --refresh upgrade -y'
    abbr -a dnfi --set-cursor 'sudo dnf5 install % && nano ~/sysinfo/dnf-manual.txt'
    abbr -a dnfr --set-cursor 'sudo dnf5 remove % && nano ~/sysinfo/dnf-manual.txt'
    abbr -a dnfs 'dnf5 search'
    abbr -a dnfsi 'dnf list installed | grep'
    abbr -a flup 'flatpak update'
    abbr -a brup 'brew update && brew upgrade'
    abbr -a carup 'cargo install-update -a'
    abbr -a up-pip "pip --disable-pip-version-check list --outdated --format=json | python3 -c \"import json, sys; print('\n'.join([x['name'] for x in json.load(sys.stdin)]))\" | xargs -n1 pip install -U"

    abbr -a fix-perms 'chmod 771 ./**/* ; chmod 660 ./**/*.*'
    abbr -a fix-power 'sudo systemctl restart power-profiles-daemon.service'
    abbr -a fix-outline 'sudo -E pkill --full -i outline'

    abbr -a clean 'sudo dnf5 autoremove -y && sudo dnf5 clean all && flatpak uninstall --unused -y && sudo journalctl --vacuum-time=1weeks && flatdir && rm ~/.python_history-*.tmp'

    abbr -a kernel-list 'sudo grubby --info=ALL | grep -E "^kernel|^index"'
    abbr -a kernel-set --set-cursor 'sudo grubby --set-default-index=%'

    abbr -a meminfo 'free -mlt'
    abbr -a bc 'bc -l'

    abbr -a --position anywhere wget 'wget -c'
    abbr -a proton-run 'env ~/PortProton/data/scripts/start.sh'
    abbr -a rsmi rocm-smi
    abbr -a ri rocminfo

    abbr -a drive-health-test 'sudo smartctl -t short'
    abbr -a drive-health-check 'sudo smartctl -a'

    abbr -a ffmpegc 'ffmpeg -i'

    abbr -a git-cache-on 'git config credential.helper store'
    abbr -a git-cache-off 'git config --unset credential.helper'

    abbr -a venvc 'python3 -m venv .venv'
    abbr -a venv 'source ./.venv/bin/activate.fish'
    abbr -a ppr 'pipenv run python3'
    abbr -a ppi 'pipenv install'
    abbr -a ppu 'pipenv uninstall'
    abbr -a pprm 'pipenv --rm'
    abbr -a uvi 'uv init --no-readme --no-pin-python && rm hello.py'
    abbr -a rf 'uvx ruff format .'
    abbr -a rfl 'uvx ruff format . --line-length 79'
    abbr -a rc 'uvx ruff check --fix .'

    abbr -a dpgu 'docker run --name pocket-postgres -e POSTGRES_DB=kruase -e POSTGRES_USER=kruase -e POSTGRES_PASSWORD=kruase-password -p 5432:5432 -v kruase-postgres:/var/lib/postgresql/data -d postgres:16-alpine'
    abbr -a dpgd 'docker container rm pocket-postgres -f'
    abbr -a dpgdv 'docker container rm pocket-postgres -f && docker volume rm kruase-postgres'
    abbr -a dcu 'docker compose up -d'
    abbr -a dcd 'docker compose down --rmi local'
    abbr -a dcdv 'docker compose down --rmi local -v'

    abbr -a appimage-build --set-cursor 'VERSION=% ~/appimages/appimagetool-730-x86_64.AppImage'

    abbr -a psql 'sudo -u postgres psql'

    abbr -a mongo-backup --set-cursor 'mongodump --gzip --archive=/mnt/ext4/mongo_backup/%'
    abbr -a mongo-restore --set-cursor 'mongorestore --gzip --drop --archive=/mnt/ext4/mongo_backup/%'

    abbr -a wb '~/Документы/mipt/workbook_mipt/ && git status'
    abbr -a wb1535 '~/Документы/1535/workbook_1535/ && git status'
    abbr -a wbmipt '~/Документы/mipt/workbook_mipt/ && git status'
    abbr -a obsidian-personal '~/Документы/personal_vault/ && git status'

    abbr -a vencord 'sh -c "$(curl -sSL "https://github.com/Vencord/Installer/blob/main/install.sh?raw=true")"'
    abbr -a musescore-dl 'npx dl-librescore@latest'

    abbr -a mclocal '~/games/mcservers/Divine_1-$mclocal_version/'
    abbr -a mcrun 'java -Xms2048M -Xmx8192M -jar server.jar nogui'
    abbr -a mcdebug --set-cursor 'java -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -Xms2048M -Xmx2048M -jar server.jar nogui'

    abbr -a webui-sd '~/stable-diffusion-webui/ && bash webui.sh --medvram --disable-nan-check --no-half-vae --xformers --gradio-img2img-tool color-sketch --gradio-inpaint-tool color-sketch'
    abbr -a webui-sd-cpu 'bash ~/stable-diffusion-webui/webui.sh --medvram --disable-nan-check --no-half-vae --use-cpu all --precision full --no-half --xformers'
    abbr -a webui-gpt '~/freegpt-webui/ && source ./venv/bin/activate.fish && python3 run.py'

    abbr -a vm 'ssh $vm'
    abbr -a serveo-ssh 'ssh -o ServerAliveInterval=60 -R krudora:22:localhost:22 serveo.net'
    abbr -a serveo-http 'ssh -o ServerAliveInterval=60 -R kruase:80:localhost:1535 serveo.net'
    abbr -a serveo-fastapi 'ssh -o ServerAliveInterval=60 -R kruase:80:localhost:8000 serveo.net'
    abbr -a serveo-mc 'ssh -R kruase-mc:1535:localhost:25565 serveo.net'

    abbr -a vpn 'sudo -E vpn'

    abbr -a ngrok-fastapi 'ngrok http --url=crack-locally-skink.ngrok-free.app 8000'

    abbr -a playit 'playit -c ~/.config/playit.toml'

    # abbr -a ssh-home 'ssh -o ServerAliveInterval=60 forum-lib.at.ply.gg -p 49403'
    # abbr -a scp-home --set-cursor 'scp -P 49403 % forum-lib.at.ply.gg:'
    abbr -a ssh-home 'ssh -o ServerAliveInterval=60 kruase@$SSH_HOME_DOMAIN -p $SSH_HOME_PORT'
    abbr -a scp-home --set-cursor 'scp -P $SSH_HOME_PORT % kruase@$SSH_HOME_DOMAIN:'

    abbr -a nf 'fastfetch'
    abbr -a gitfetch 'onefetch'
    abbr -a figlet 'toilet -f mono12'
    abbr -a toilet 'toilet -f mono12'
    abbr -a cmatrix 'cmatrix -b'
    abbr -a hollywood 'docker run -it --rm bcbcarl/hollywood'
    abbr -a ytub 'sudo youtubeUnblock 537'
    abbr -a byedpi 'ciadpi -i 127.0.0.1 --disorder 1 --auto=torst --tlsrec 1+s'
    abbr -a ydo 'sudo -b ydotoold --socket-path=$YDOTOOL_SOCKET --socket-own="$(id -u):$(id -g)"'
    abbr -a ydod 'sudo pkill ydotoold'

    abbr -a git-conf-mipt 'git config user.email "kruglikov.as@phystech.edu" && git config user.name "Андрей Кругликов"'


    # Aliases
    alias fan-silent='sudo sh -c "echo 2 > /sys/devices/platform/asus-nb-wmi/throttle_thermal_policy"'
    alias fan-balance='sudo sh -c "echo 0 > /sys/devices/platform/asus-nb-wmi/throttle_thermal_policy"'
    alias fan-turbo='sudo sh -c "echo 1 > /sys/devices/platform/asus-nb-wmi/throttle_thermal_policy"'

    alias drop-table='echo no way'


    # Custom keybinds
    bind \ck backward-kill-line
    bind \cu yank
    bind \eu yank-pop
    bind -e \cd


    # Fixing git alias completion
    complete -c git -n '__fish_seen_subcommand_from po' -a '(complete -C "git push origin ")'
    complete -c git -n '__fish_seen_subcommand_from pfo' -a '(complete -C "git push --force origin ")'
    complete -c git -n '__fish_seen_subcommand_from pom' -a '(complete -C "git push origin main ")'
    complete -c git -n '__fish_seen_subcommand_from sha' -a '(complete -C "git stash apply ")'
    complete -c git -n '__fish_seen_subcommand_from shp' -a '(complete -C "git stash pop ")'
    complete -c git -n '__fish_seen_subcommand_from shd' -a '(complete -C "git stash drop ")'
    complete -c git -n '__fish_seen_subcommand_from wta' -a '(complete -C "git worktree add ")'
    complete -c git -n '__fish_seen_subcommand_from wtr' -a '(complete -C "git worktree remove ")'


    # Custom completion
    complete -c vpn --no-files -a 'add remove list connect disconnect toggle status'


    # GOPATH
    set -gx GOPATH /tmp/go

    # flyctl setup
    set -gx FLYCTL_INSTALL $HOME/.fly
    fish_add_path $FLYCTL_INSTALL/bin

    # firefox wayland fix
    set -gx MOZ_ENABLE_WAYLAND 1

    # wandb api key
    set -gx WANDB_API_KEY (cat $HOME/.wandb)


    # uv completion
    uv generate-shell-completion fish | source
    uvx --generate-shell-completion fish | source
end

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
if test -f /home/kruase/anaconda3/bin/conda
    eval /home/kruase/anaconda3/bin/conda "shell.fish" "hook" $argv | source
else
    if test -f "/home/kruase/anaconda3/etc/fish/conf.d/conda.fish"
        . "/home/kruase/anaconda3/etc/fish/conf.d/conda.fish"
    else
        set -x PATH "/home/kruase/anaconda3/bin" $PATH
    end
end
# <<< conda initialize <<<
