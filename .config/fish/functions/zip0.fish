function zip0
    if test -z $argv[1]
        set name (path normalize $PWD)
    else
        set name (path normalize $argv[1])
    end

    if test ! -d $name
        echo -s (set_color red)"Directory does not exist" >&2
        return 1
    end

    cd $name
    zip -r0 $name.zip *

    mv $name.zip ../
    cd ..
end
