#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash -O extglob

.SILENT:
default: install test build

node_modules:; npm install
install: node_modules
i: node_modules

lint: node_modules
	eslint 'src/{,**/}*.js'

jest: node_modules
	jest --testPathPattern '.+\.spec\.js'

test: lint jest