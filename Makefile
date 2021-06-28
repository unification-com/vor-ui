# Dev environment
vor-env:
	docker build -t vor_env -f docker/vor.Dockerfile ./docker
	docker run -it -p 8545:8545 vor_env

.PHONY: vor-env
