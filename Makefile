#!/usr/bin/make

.PHONY : b help
.DEFAULT_GOAL := help

help: ## Показать все доступные скрипты
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

---------------: ## Общие скрипты для разработки ---------------
b: ## Создать бинарный файл из fc
	npx func-js contracts/imports/stdlib.fc contracts/counter.fc --boc cells/counter.cell
d: ## deploy
	npx ts-node scripts/counter.deploy.ts

