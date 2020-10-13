# Artis T-Mail powered by BitcoinComputer.io 

This application is to demonstrate the value of using Bitcoin as a Backend. 

To Follow the instructions for converting a general email app to a Bitcoin based email app begin with the
```
getting-started 
```
branch

To run the completed application pull the main branch and follow the setup instructions. 

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```


### The Configuration 
This application is a client that consumes an API. The tutorial begins by using a JSON-SERVER API to mock a live email API. 
This server must be running in order for the Tmail website to successfully query the emails. 

In a second terminal instance run the command:
```
json-server --watch db.json
```