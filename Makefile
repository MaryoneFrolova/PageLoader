install: install-deps install-flow-typed

run:
	npm run babel-node -- 'src/bin/page-loader.js' http://cafefrida.ca

run-debug:
	DEBUG=page-loader:* npm run babel-node -- 'src/bin/page-loader.js'  http://helloworldquiz.com

err-en:
	DEBUG=page-loader:* npm run babel-node -- 'src/bin/page-loader.js'  http://helloworldquiz.com --output /ggg/ddd

install-deps:
	npm install

install-flow-typed:
	npm run flow-typed install

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm test -- --coverage

test-watch:
	npm test -- --watch

check-types:
	npm run flow

lint:
	npm run eslint .

publish:
	npm publish

debug:
	DEBUG=page-loader:* npm test

.PHONY: test