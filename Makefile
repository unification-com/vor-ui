dev-up:
	echo "Run: 'sudo service postgresql stop' if postgres container does not start"
	@rm -rf ./logs
	@mkdir -p logs
	docker-compose -f docker-compose.yml down --remove-orphans
	docker-compose -f docker-compose.yml up --build 2>&1 | tee logs/log.txt

dev-down:
	docker-compose -f docker-compose.yml down --remove-orphans

logs:
	@sh scripts/split_logs.sh

.PHONY: dev-up dev-down logs
