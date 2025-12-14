.PHONY: help ios ios-only restart-ios start install clean rebuild pods android web test lint format stop-metro icons icons-install icons-preview

# Default target
.DEFAULT_GOAL := ios

# Variables
NPM := npm
IOS_DIR := ios
PODS_DIR := $(IOS_DIR)/Pods
NODE_MODULES := node_modules
METRO_PORT := 8081
METRO_PID_FILE := .metro.pid

##@ General

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

ios: install-deps start-metro-bg ## Launch app on iOS simulator with Metro server (default)
	@echo "⏳ Waiting for Metro server to be ready..."
	@sleep 3
	@echo "🚀 Launching iOS app on simulator..."
	@$(NPM) run ios || (echo "❌ Failed to launch iOS app. Metro server is still running. Use 'make stop-metro' to stop it." && exit 1)

ios-only: install-deps ## Launch iOS app without starting Metro (use if Metro is already running)
	@echo "🚀 Launching iOS app on simulator..."
	$(NPM) run ios

start: install-deps ## Start Expo development server (foreground)
	@echo "🚀 Starting Expo development server..."
	$(NPM) start

start-metro-bg: install-deps ## Start Metro server in background (internal target)
	@if lsof -i :$(METRO_PORT) -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "✅ Metro server already running on port $(METRO_PORT)"; \
	else \
		echo "🚀 Starting Metro server in background..."; \
		$(NPM) start > metro.log 2>&1 & echo $$! > $(METRO_PID_FILE); \
		echo "📝 Metro logs available in metro.log"; \
	fi

stop-metro: ## Stop background Metro server
	@if [ -f $(METRO_PID_FILE) ]; then \
		echo "🛑 Stopping Metro server..."; \
		kill $$(cat $(METRO_PID_FILE)) 2>/dev/null || true; \
		rm -f $(METRO_PID_FILE); \
	fi
	@pkill -f "expo start" 2>/dev/null || true
	@pkill -f "react-native start" 2>/dev/null || true
	@echo "✅ Metro server stopped"

android: install-deps start-metro-bg ## Launch app on Android emulator with Metro server
	@echo "⏳ Waiting for Metro server to be ready..."
	@sleep 3
	@echo "🚀 Launching Android app on emulator..."
	@$(NPM) run android || (echo "❌ Failed to launch Android app. Metro server is still running. Use 'make stop-metro' to stop it." && exit 1)

web: install-deps ## Launch app in web browser
	@echo "🚀 Launching web app..."
	$(NPM) run web

restart-ios: ## Fix iOS build issues and restart (kills xcodebuild, cleans DerivedData, rebuilds)
	@echo "🔄 Restarting iOS app (fixing build issues)..."
	@echo "🛑 Stopping Metro server..."
	@$(MAKE) stop-metro
	@echo "🛑 Killing xcodebuild processes..."
	@pkill -9 xcodebuild 2>/dev/null || true
	@echo "🧹 Cleaning Xcode DerivedData..."
	@rm -rf ~/Library/Developer/Xcode/DerivedData/3WT-*
	@echo "🔨 Rebuilding native project..."
	@npx expo prebuild --clean
	@echo "⏳ Waiting a moment..."
	@sleep 2
	@echo "🚀 Relaunching iOS app..."
	@$(MAKE) ios

##@ Installation

install: ## Install all dependencies (npm + CocoaPods)
	@echo "📦 Installing npm dependencies..."
	$(NPM) install
	@echo "📦 Installing CocoaPods dependencies..."
	cd $(IOS_DIR) && pod install
	@echo "✅ All dependencies installed!"

install-deps: ## Check and install dependencies if needed (internal target)
	@if [ ! -d "$(NODE_MODULES)" ]; then \
		echo "📦 node_modules not found, installing..."; \
		$(NPM) install; \
	fi
	@if [ ! -d "$(PODS_DIR)" ]; then \
		echo "📦 Pods not found, installing..."; \
		cd $(IOS_DIR) && pod install; \
	fi

pods: ## Install/update CocoaPods dependencies
	@echo "📦 Installing CocoaPods dependencies..."
	cd $(IOS_DIR) && pod install
	@echo "✅ CocoaPods installed!"

pods-update: ## Update CocoaPods dependencies
	@echo "🔄 Updating CocoaPods dependencies..."
	cd $(IOS_DIR) && pod update
	@echo "✅ CocoaPods updated!"

##@ Cleaning

clean: stop-metro ## Clean build artifacts and caches
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf $(IOS_DIR)/build
	@rm -rf $(IOS_DIR)/DerivedData
	@rm -rf android/build
	@rm -rf android/app/build
	@rm -rf metro.log
	@rm -rf $(METRO_PID_FILE)
	@echo "🧹 Cleaning Metro bundler cache..."
	@npx expo start --clear --non-interactive & sleep 2 && pkill -f "expo start" || true
	@echo "✅ Clean complete!"

clean-deps: ## Remove all dependencies
	@echo "🧹 Removing node_modules..."
	@rm -rf $(NODE_MODULES)
	@echo "🧹 Removing Pods..."
	@rm -rf $(PODS_DIR)
	@rm -rf $(IOS_DIR)/Podfile.lock
	@echo "✅ Dependencies removed!"

rebuild: clean-deps install ## Clean and reinstall all dependencies
	@echo "✅ Rebuild complete!"

reset: ## Full reset (clean everything and reinstall)
	@echo "🔄 Full reset..."
	@$(MAKE) clean
	@$(MAKE) clean-deps
	@$(MAKE) install
	@echo "✅ Reset complete!"

##@ Code Quality

lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	$(NPM) run lint

format: ## Format code with Prettier
	@echo "✨ Formatting code with Prettier..."
	@npx prettier --write "**/*.{js,jsx,ts,tsx,json,md}"

##@ Utilities

devices: ## List available iOS simulators
	@echo "📱 Available iOS Simulators:"
	@xcrun simctl list devices available

open-ios: ## Open iOS project in Xcode
	@echo "📂 Opening Xcode..."
	@open $(IOS_DIR)/3wtapp.xcworkspace

logs-ios: ## Show iOS simulator logs
	@echo "📋 iOS Simulator Logs:"
	@xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "3wtapp"'

logs-metro: ## Show Metro server logs
	@if [ -f metro.log ]; then \
		echo "📋 Metro Server Logs:"; \
		tail -f metro.log; \
	else \
		echo "❌ No metro.log file found. Metro server may not be running in background."; \
	fi

status: ## Check status of Metro server
	@if lsof -i :$(METRO_PORT) -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "✅ Metro server is running on port $(METRO_PORT)"; \
		if [ -f $(METRO_PID_FILE) ]; then \
			echo "📝 PID: $$(cat $(METRO_PID_FILE))"; \
		fi; \
	else \
		echo "❌ Metro server is not running"; \
	fi

##@ Icons

icons-install: ## Install sharp for icon generation
	@echo "📦 Installing sharp for icon generation..."
	$(NPM) install --save-dev sharp
	@echo "✅ Sharp installed!"

icons: ## Generate all app icons from SVG sources
	@echo "🎨 Generating app icons..."
	@if ! $(NPM) list sharp --depth=0 >/dev/null 2>&1; then \
		echo "⚠️  sharp not found, installing..."; \
		$(MAKE) icons-install; \
	fi
	@node scripts/generate-icons.js
	@echo "✅ All icons generated! See ICONS.md for details."

icons-preview: ## Preview generated icons
	@echo "📁 Icon Files Generated:"
	@echo "\n📱 iOS Icons:"
	@ls -lh assets/ios/ 2>/dev/null || echo "  No iOS icons found"
	@echo "\n🤖 Android Icons:"
	@find assets/android -name "*.png" -exec ls -lh {} \; 2>/dev/null || echo "  No Android icons found"
	@echo "\n🌐 Main Icons:"
	@ls -lh assets/*.png 2>/dev/null || echo "  No main icons found"
