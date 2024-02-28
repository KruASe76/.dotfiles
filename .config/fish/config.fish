if status is-interactive
    # Modifying $PATH
    fish_add_path $HOME/.local/bin
    fish_add_path /home/kruase/.local/share/JetBrains/Toolbox/scripts

    # Custom variables
    set -U vm ubuntu@130.61.124.83
    set -U mclocal_version 20
    set -U ALSOFT_DRIVERS pulse

    # Abbreviations
    abbr -a -- fc 'nano ~/.config/fish/config.fish && source ~/.config/fish/config.fish'

    abbr -a -- su 'sudo fish'

    abbr -a -- rm 'rm -I --preserve-root'
    abbr -a -- mv 'mv -i'
    abbr -a -- cp 'cp -i'
    abbr -a -- ln 'ln -si'
    abbr -a -- ls 'eza'
    abbr -a -- ll 'eza -lh'
    abbr -a -- la 'eza -lha'
    abbr -a -- mkdir 'mkdir -p'
    abbr -a -- duc 'dust -r'
    abbr -a -- cat 'bat'

    abbr -a -- up 'sudo dnf5 --refresh upgrade'
    abbr -a -- upy 'sudo dnf5 --refresh upgrade -y'
    abbr -a dnfi --set-cursor 'sudo dnf5 install % && nano ~/sysinfo/dnf-manual.txt'
    abbr -a dnfr --set-cursor 'sudo dnf5 remove % && nano ~/sysinfo/dnf-manual.txt'
    abbr -a -- dnfs 'dnf5 search'
    abbr -a -- dnfsi 'dnf list installed | grep'
    abbr -a -- flup 'flatpak update'
    abbr -a -- up-pip "pip --disable-pip-version-check list --outdated --format=json | python3 -c \"import json, sys; print('\n'.join([x['name'] for x in json.load(sys.stdin)]))\" | xargs -n1 pip install -U"

    abbr -a -- fix-perms 'chmod 771 ./**/* ; chmod 660 ./**/*.*'
    abbr -a -- fix-power 'sudo systemctl restart power-profiles-daemon.service'

    abbr -a -- clean 'sudo dnf5 autoremove -y && sudo dnf5 clean all && flatpak uninstall --unused -y && sudo journalctl --vacuum-time=1weeks && flatdir && rm ~/.python_history-*.tmp'

    abbr -a -- kernel-list 'sudo grubby --info=ALL | grep -E "^kernel|^index"'
    abbr -a kernel-set --set-cursor 'sudo grubby --set-default-index=%'

    abbr -a -- meminfo 'free -mlt'
    abbr -a -- bc 'bc -l'

    abbr -a --position anywhere -- wget 'wget -c'
    abbr -a -- proton-run 'env ~/PortWINE/PortProton/data/scripts/start.sh'
    abbr -a -- nv nvidia-smi

    abbr -a -- drive-health-test 'sudo smartctl -t short'
    abbr -a -- drive-health-check 'sudo smartctl -a'

    abbr -a wav2mp3 --set-cursor 'ffmpeg -i % -vn -b:a 192k out.mp3'

    abbr -a -- venv 'source ./venv/bin/activate.fish'
    abbr -a -- ppr 'pipenv run python3'
    abbr -a -- ppi 'pipenv install'
    abbr -a -- ppu 'pipenv uninstall'

    abbr -a appimage-build --set-cursor 'VERSION=% ~/appimages/appimagetool-730-x86_64.AppImage'

    abbr -a mongo-backup --set-cursor 'mongodump --gzip --archive=%'
    abbr -a mongo-restore --set-cursor 'mongorestore --gzip --drop --archive=%'

    abbr -a -- wb '~/Документы/1535/workbook/ && git status'
    abbr -a -- obsidian-personal '~/Документы/personal_vault/ && git status'

    abbr -a vpn-ru 'sudo openvpn --config ~/openvpn/russia_2_freeopenvpn_tcp.ovpn'
    abbr -a vpn-ru-pass --set-cursor 'echo -e "freeopenvpn\n%" > ~/openvpn/russia_2_login.txt'
    abbr -a vpn-ru-3 'sudo openvpn --config ~/openvpn/russia_3_freeopenvpn_tcp.ovpn'
    abbr -a vpn-ru-3-pass --set-cursor 'echo -e "freeopenvpn\n%" > ~/openvpn/russia_3_login.txt'
    abbr -a vpn-nl 'sudo openvpn --config ~/openvpn/netherlands_freeopenvpn_tcp.ovpn'
    abbr -a vpn-nl-pass --set-cursor 'echo -e "freeopenvpn\n%" > ~/openvpn/netherlands_login.txt'
    abbr -a vpn-sirius 'sudo openvpn --config ~/openvpn/sirius.ovpn'

    abbr -a vencord 'sh -c "$(curl -sS https://raw.githubusercontent.com/Vendicated/VencordInstaller/main/install.sh)"'
    abbr -a musescore-dl 'npx dl-librescore@latest'

    abbr -a -- mclocal '~/games/mcservers/Divine_1-$mclocal_version/'
    abbr -a mcrun "java -Xms2048M -Xmx8192M -jar server.jar nogui"
    abbr -a mcdebug --set-cursor "java -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -Xms2048M -Xmx2048M -jar % nogui"

    abbr -a -- webui-sd '~/stable-diffusion-webui/ && bash webui.sh --medvram --disable-nan-check --no-half-vae --xformers --gradio-img2img-tool color-sketch --gradio-inpaint-tool color-sketch'
    abbr -a -- webui-sd-cpu 'bash ~/stable-diffusion-webui/webui.sh --medvram --disable-nan-check --no-half-vae --use-cpu all --precision full --no-half --xformers'
    abbr -a -- webui-gpt '~/freegpt-webui/ && source ./venv/bin/activate.fish && python3 run.py'

    abbr -a -- serveo-ssh 'ssh -o ServerAliveInterval=60 -R krudora:22:localhost:22 serveo.net'
    abbr -a -- serveo-http 'ssh -o ServerAliveInterval=60 -R kruase:80:localhost:1535 serveo.net'
    abbr -a -- serveo-fastapi 'ssh -o ServerAliveInterval=60 -R kruase:80:localhost:8000 serveo.net'
    abbr -a -- serveo-mc 'ssh -R kruase-mc:1535:localhost:25565 serveo.net'

    abbr -a -- playit 'playit -c ~/.config/playit.toml'

    abbr -a -- nf 'fastfetch'
    abbr -a -- hollywood 'docker run -it --rm bcbcarl/hollywood'


    alias drop-table="echo no way"


    bind \ck backward-kill-line
    bind \cu yank
    bind \eu yank-pop


    set -U GOPATH /tmp/go

    # flyctl setup
    set -U FLYCTL_INSTALL $HOME/.fly
    fish_add_path $FLYCTL_INSTALL/bin

    # pyenv setup
    set -Ux PYENV_ROOT $HOME/.pyenv
    fish_add_path $PYENV_ROOT/bin
    pyenv init - | source

    # wandb token
    set -U WANDB_API_KEY 5a73c29b2380fe211377d34a097aa8386f17ae40

    # firefox wayland fix
    set -U MOZ_ENABLE_WAYLAND 1
end
