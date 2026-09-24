.PHONY: setup format check
setup:
	bash scripts/setup-precommit.sh
format:
	cd api && ./mvnw -q spotless:apply
	cd frontend && bun run format
check:
	cd api && ./mvnw spotless:check checkstyle:check verify
	cd frontend && bun run lint && bun run typecheck && bun run test && bun run build
