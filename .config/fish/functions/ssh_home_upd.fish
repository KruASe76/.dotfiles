function ssh_home_upd
    set gist_url "https://gist.githubusercontent.com/KruASe76/5d565398306e10068c2b794c38bbbc42/raw/ssh_domain.url?_=$(uuidgen)"

    set domain_and_port (string split : (curl -s $gist_url))

    set -x SSH_HOME_DOMAIN $domain_and_port[1]
    set -x SSH_HOME_PORT $domain_and_port[2]
end
