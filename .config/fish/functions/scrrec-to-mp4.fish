function scrrec-to-mp4
    set directory ~/Видео/Записи\ экрана/
    set filename (ls -t $directory)[1]
    if not string match -q -- "*.webm" $filename
        echo -s (set_color red)"Latest edited file doesn't end with \".webm\""
        return
    end
    set new_filename (string replace ".webm" ".mp4" $filename)

    ffmpeg -v quiet -i "$directory$filename" -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" "$directory$new_filename"

    echo -s (set_color green) $directory$new_filename
    nautilus $directory
end

