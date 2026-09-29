# Cac lenh hay dung khi phat trien & deploy hocphi-info-fe.
#
# Deploy: Cloudflare Workers qua adapter OpenNext (xem wrangler.jsonc) - `make
# deploy` build lai (opennextjs-cloudflare) roi `wrangler deploy` thang len
# hocphi.info / www.hocphi.info. Chay tu may (can `npx wrangler login` truoc
# lan dau) - khong qua GitHub Actions, khac voi hocphi-info-be (Fly + tag).
#
# `make` hoac `make help` liet ke moi target.

# ── Bien co the ghi de: `make dev NPM="pnpm"` ─────────────────────────────────
NPM ?= npm

.DEFAULT_GOAL := help

# ── Tro giup ───────────────────────────────────────────────────────────────────
.PHONY: help
help: ## Hien thi danh sach target
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

# ── Setup ──────────────────────────────────────────────────────────────────────
.PHONY: install
install: ## Cai dependencies (npm ci - dung ban da lock)
	$(NPM) ci

# ── Dev (chay tren host) ───────────────────────────────────────────────────────
.PHONY: dev build start
dev: ## Next dev server, hot-reload tai :3000
	$(NPM) run dev

build: ## Next build thuong (kiem tra build production, khong dong den Cloudflare)
	$(NPM) run build

start: ## Chay ban build production tai :3000 (can `make build` truoc)
	$(NPM) run start

# ── Kiem tra chat luong ────────────────────────────────────────────────────────
.PHONY: lint typecheck gen-api gen-check fmt check
lint: ## eslint
	$(NPM) run lint

typecheck: ## tsc --noEmit
	$(NPM) run typecheck

gen-api: ## Sinh lai src/types/api.gen.ts tu openapi.json cua BE (OPENAPI_SRC=... de tro file local)
	$(NPM) run gen:api

gen-check: ## Bao loi neu api.gen.ts lech hop dong BE tren main (giong buoc CI)
	$(NPM) run gen:api
	git diff --exit-code -- src/types/api.gen.ts

fmt: ## prettier --write .
	$(NPM) run format

check: gen-check typecheck lint ## Hop dong BE + tsc + eslint (giong CI; husky/lint-staged chay them o pre-commit)

# ── Cloudflare Workers (OpenNext adapter) ──────────────────────────────────────
.PHONY: cf-build preview deploy
cf-build: ## Build sang dinh dang Cloudflare Worker (.open-next/), khong deploy
	$(NPM) run cf:build

preview: ## Build + wrangler dev (gia lap Cloudflare Worker o local)
	$(NPM) run cf:preview

deploy: check ## Chay `check`, build roi deploy len Cloudflare Workers (hocphi.info + www.hocphi.info)
	$(NPM) run cf:deploy

# ── Don dep ────────────────────────────────────────────────────────────────────
.PHONY: clean
clean: ## Xoa build output (.next, .open-next)
	rm -rf .next .open-next
