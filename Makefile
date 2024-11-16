commit_msg ?= "update"


# if user does make tell him to use make push
all:
	@echo "Usage: make push commit_msg=\"YOUR-COMMIT-MESSAGE\""
	@echo "This will add, commit with text of default msg and push"

run: 
	cd src/ && npx ts-node swapFromPool.ts $(ARGS)
    
push:
	git add .
	git commit -m "$(commit_msg)"
	git push

.PHONY: all push