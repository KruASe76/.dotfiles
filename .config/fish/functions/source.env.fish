function source.env
    if test (count $argv) -eq 0
        set -f env_file ".env"
    else
        set -f env_file $argv[1]
    end

    if test -d "$env_file"
        set -f env_file "$env_file/.env"
    end

    if not test -f "$env_file"
        echo "File $env_file does not exist" >&2
        return 1
    end

    while read -l line
        set -f line (string trim "$line")

        # Skip empty lines and comments
        if test -z "$line"
            continue
        end

        if string match -q '#*' "$line"
            continue
        end

        set -f name_and_value (string split -m 1 '=' -- "$line")

        if test (count $name_and_value) -lt 2
            continue
        end

        set -f name (string trim "$name_and_value[1]")
        set -f value "$name_and_value[2]"

        set -f first_char (string sub -l 1 -- "$value")
        set -f last_char (string sub -s -1 -- "$value")

        if test "$first_char" = '"' -a "$last_char" = '"'
            # Double quotes: remove quotes and process escapes
            set -f value (string sub -s 2 -e -1 -- "$value")

            # IMPORTANT: quoted command substitution keeps this
            # as ONE value even when it contains newlines.
            set -f value "$(string replace --all '\n' \n -- "$value")"

        else if test "$first_char" = "'" -a "$last_char" = "'"
            # Single quotes: remove quotes, but keep \n literal
            set -f value (string sub -s 2 -e -1 -- "$value")
        end

        set -gx "$name" "$value"
    end < "$env_file"
end
