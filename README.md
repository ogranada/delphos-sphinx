
# Delphi Oracle

Tool to develop tech interviews.

This Project use Typescript and Vue.js.

# How to run it

- Run `npm i` in `delphi-oracle-backend` folder
- Run `npm i` in `delphi-oracle-frontend` folder
- Go to `delphi-oracle-backend` folder and run:
    - `npm run build && npm run execute`
- Go to `delphi-oracle-frontend` folder and run:
    - `npm run serve`
- Run in browser console `localStorage.setItem('DELPHI_WS_SERVER', 'localhost:5000')`
- To create rooms locally, the password is `admin`
- Enjoy!

# Deploy

Use a Unix based system to execute:
```bash
./deploy.sh
```
# References

- [Vue Material](https://vuematerial.io)

## NOTE:
You can use environment variable `KEYS` to define valid admin passwords.

