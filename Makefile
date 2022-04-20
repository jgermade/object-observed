#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash -O extglob

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

ifndef FORCE_COLOR
  export FORCE_COLOR=true
endif

.SILENT:
default: install test

node_modules:; npm install
install: node_modules
i: node_modules

lint: node_modules
	eslint 'src/{,**/}*.js'

jest: node_modules
	jest --testPathPattern '.+\.spec\.js'

test: lint jest

build: node_modules
	mkdir -p dist
	esbuild src/object-observed.js --platform=node --target=node10 > dist/object-observed.js
	esbuild src/object-observed.js --bundle --platform=node --target=node10 > dist/object-observed.cjs.js

deploy: build
	git add --all
	npm version ${NPM_VERSION}
	git push --tags
	npm publish
