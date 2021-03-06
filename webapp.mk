APP_NAME = $(shell basename $(CURDIR))

DOCKER_ENV := /.dockerenv

MODULES_DIR := $(CURDIR)/node_modules
BIN_DIR := $(MODULES_DIR)/.bin
WEBPACK := $(BIN_DIR)/webpack

DIST_DIR := $(CURDIR)/dist

DEV_CONFIG ?= $(CURDIR)/webpack.config.js
PROD_CONFIG ?= $(CURDIR)/webpack.config.js

WEBPACK_WATCH_OPTS := --watch --config $(DEV_CONFIG)
WEBPACK_BUILD_OPTS := --bail --config $(PROD_CONFIG)

ifeq ($(wildcard $(DOCKER_ENV)),)
WEBPACK_WATCH_OPTS += --progress
WEBPACK_BUILD_OPTS += --progress
endif

RM := rm -rf
INFO = "\\033[34m[+] $@\\033[0m"

.PHONY: all
all: build

.PHONY: clean
clean::
	@echo $(INFO)
	@$(RM) $(DIST_DIR)

.PHONY: distclean
distclean:: clean
	@echo $(INFO)
	@$(RM) $(MODULES_DIR)

.PHONY: watch
watch:: $(DEV_CONFIG) clean
	@echo $(INFO)
	@$(WEBPACK) $(WEBPACK_WATCH_OPTS)

.PHONY: build
build:: export NODE_ENV=production
build:: $(PROD_CONFIG) clean
	@echo $(INFO)
	@echo "Compiling '$(APP_NAME)'..."
	@$(WEBPACK) $(WEBPACK_BUILD_OPTS)
	@echo "Compiled '$(APP_NAME)' successfully."
