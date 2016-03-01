all: npm svgo zeroclipboard sweetalert

npm:
	[ -d node_modules ] || npm install

svgo: npm libdir
	cd node_modules/svgo ;\
	sed -i -e 's|yaml.safeLoad(FS.readFileSync(__dirname + '"'"'/../../.svgo.yml'"'"', '"'"'utf8'"'"'))|{"plugins":["removeDoctype","removeXMLProcInst","removeComments","removeMetadata","removeEditorsNSData","cleanupAttrs","minifyStyles","convertStyleToAttrs","cleanupIDs","removeRasterImages","removeUselessDefs","cleanupNumericValues","cleanupListOfValues","convertColors","removeUnknownsAndDefaults","removeNonInheritableGroupAttrs","removeUselessStrokeAndFill","removeViewBox","cleanupEnableBackground","removeHiddenElems","removeEmptyText","convertShapeToPath","moveElemsAttrsToGroup","moveGroupAttrsToElems","collapseGroups","convertPathData","convertTransform","removeEmptyAttrs","removeEmptyContainers","mergePaths","removeUnusedNS","transformsWithOnePath","sortAttrs","removeTitle","removeDesc","removeDimensions","removeAttrs","addClassesToSVGElement","removeStyleElement"]}|g' ./lib/svgo/config.js ;\
	sed -i -e 's|require('"'"'../../plugins/'"'"' + |loadPlugin(|g' ./lib/svgo/config.js ;\
	echo -n "var BROWSER_PLUGINS={" >> ./lib/svgo/config.js ;\
	for p in $$(find ./plugins/ -name '*.js' -not -name '_*.js'); do \
		p=`echo $$p | sed 's/^\.\/plugins\///' | sed 's/\.js$$//'` ;\
		echo -n "$$p:require('../../plugins/$$p')," >> ./lib/svgo/config.js ;\
	done ;\
	echo "};function loadPlugin(name){return BROWSER_PLUGINS[name]}" >> ./lib/svgo/config.js
	./node_modules/browserify/bin/cmd.js -s SVGO -r ./node_modules/svgo/lib/svgo.js | ./node_modules/uglifyjs/bin/uglifyjs > ./lib/svgo.min.js

zc: zeroclipboard

zeroclipboard: libdir
	wget https://cdn.jsdelivr.net/zeroclipboard/2.2.0/ZeroClipboard.min.js -O lib/ZeroClipboard.min.js -q
	wget https://cdn.jsdelivr.net/zeroclipboard/2.2.0/ZeroClipboard.min.map -O lib/ZeroClipboard.min.map -q
	wget https://cdn.jsdelivr.net/zeroclipboard/2.2.0/ZeroClipboard.swf -O lib/ZeroClipboard.swf -q

sweetalert: libdir
	wget https://raw.githubusercontent.com/limonte/sweetalert2/master/dist/sweetalert2.min.js -O lib/sweetalert.min.js -q
	wget https://raw.githubusercontent.com/limonte/sweetalert2/master/dist/sweetalert2.css -O lib/sweetalert.css -q

clean:
	rm -rf lib/ZeroClipboard.min.js lib/ZeroClipboard.min.map lib/ZeroClipboard.swf lib/svgo.min.js node_modules/ || echo -n

libdir:
	[ -d lib ] || mkdir lib

