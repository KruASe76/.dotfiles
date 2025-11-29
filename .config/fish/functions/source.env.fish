function source.env
    if test (count $argv) -eq 0
        set -f env_file ".env"
    else
        set -f env_file $argv[1]
    end

    if test -d $env_file
        set -f env_file "$env_file/.env"
    end

    if ! test -f $env_file
        echo "File $env_file does not exist" >2
    end

    while read -l line
        if ! test -z $line -o (string sub -l 1 (string trim $line)) = "#"
            set -f name_and_value (string split -m 1 "=" $line)

            if test (string sub -l 1 $name_and_value[2]) = \" -a (string sub -s -1 $name_and_value[2]) = \"
                set -f name_and_value[2] (string sub -s 2 -e -1 $name_and_value[2])
            end

            set -gx $name_and_value
        end
    end < $env_file
end
