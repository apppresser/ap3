How to get started

# INSTALL
# (You need to be in the same directory as this readme file)
npm install

# REINSTALL (might need to reinstall node modules in the parent directory)
cd ../
rm -rf node_modules
npm install

# EDIT
Do code modifications the mkpages/src folder in TypeScript
Set server configurations in `src/AppConfig.ts`
Compile the TypeScript using `tsc -p .`

# RUN (as NodeJS)
Verify server configurations in `src/AppConfig.ts`
Run the script using `node app [site_name] [app_id]`.  (You need to be in the same directory as this readme file)

# RUN (as npm)
cd ../ (so your in the ap3 directory)
Run the script using `npm run pages [site_name] [app_id]`.

# TROUBLESHOOTING
Note: running the node command vs the npm command gives you better error messages.