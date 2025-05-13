function source.env
    if test (count $argv) -eq 0
        set -f env_file ".env"
    else
        set -f env_file $argv[1]
    end

    if test -d $env_file
        set env_file "$env_file/.env"
    end

    if ! test -f $env_file
        echo "File $env_file does not exist" >2
    end

    for line in (cat $env_file)
        if ! test -z $line -o (string sub -l 1 (string trim $line)) = "#"
            set -gx (string split -m 1 "=" $line)
        end
    end
end
