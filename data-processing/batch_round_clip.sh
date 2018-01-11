for x in *.png; do
 convert $x \( +clone -threshold -1 -negate -fill white -draw "circle 143,120 73,120" \) -alpha off -compose copy_opacity -composite -crop 140x140+73+50 +repage ./circle/$x 
 echo "moved $x"
done


