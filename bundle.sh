#!/bin/sh

path_modules=./src/modules/
output_file=./src/bundled.js
modules=("Utils.js" "LocalDb.js" "StoredPropsList.js" "Ice.js")

# Clear the existing contents of the file
cat /dev/null > $output_file

for module in ${modules[@]}
do
  cat "$path_modules/$module" >> $output_file
done

cat $output_file | pbcopy && 
echo "Copied contents of $output_file to clipboard"