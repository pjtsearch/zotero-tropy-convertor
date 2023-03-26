# Flattens the files directory, putting the old folder name in front of the file name
/bin/find . -mindepth 2 -type f -name '*' |                                                                                                                                   tropy-projects/Black Amid/files
        perl -l000ne 'print $_;  s/\//-/g; s/^\.-/.\// and print' |
          xargs -0n2 mv