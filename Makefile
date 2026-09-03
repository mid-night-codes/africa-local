.PHONY: setup validate lint test test-conformance check-contracts run docker clean

setup:
	npm run setup

validate:
	npm run validate

lint:
	npm run lint

test:
	npm test

test-conformance:
	npm run test:conformance

check-contracts:
	npm run check-contracts

run:
	npm start

docker:
	docker compose up --build

clean:
	rm -rf node_modules
