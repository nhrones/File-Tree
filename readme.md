
# Deno project

## Usage
            
### Start the project:
from the command line            
```
    > deno task start
```
or, from vscode menu
            
```
    terminal -> run task -> Deno Task Start
```
        
  * This will automatically start the browser @ `http://localhost:8000`
  * It will then watch for changes in the `/src/`and `/dist/` folders
  * We build and bundle all changes in `/src/` to a bundle at `/dist/main.js`
  * The browser will `restart` localhost:8000 after any build operation
  * The browser tab will `refresh` after any changed to a `<link>` tab in `/dist/`
