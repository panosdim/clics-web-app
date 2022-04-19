# Clics

An application for work time reporting

## Screenshots

![Login](https://user-images.githubusercontent.com/10371312/56020922-f010bf00-5d10-11e9-8297-3e47d4d7cdc8.PNG)
![Main](https://user-images.githubusercontent.com/10371312/56020923-f010bf00-5d10-11e9-971c-da0879d3e25f.PNG)
![Edit](https://user-images.githubusercontent.com/10371312/56020924-f0a95580-5d10-11e9-9d1e-74fcc7dde6de.PNG)

## Build

In order to build the project you need [VS Code](https://code.visualstudio.com/).
Clone the repository and open the folder with VS Code.

Then in `clics` folder create a `.env` file with the following content

```
REACT_APP_MONGODB_APP_ID=
REACT_APP_MONGODB_APP_ID=
REACT_APP_CLUSTER_NAME=
REACT_APP_DATABASE_NAME=
REACT_APP_COLLECTION_NAME=
```

and replace with correct values from MongoDB.

Then you can run the project with `npm start` or build with `npm build`.

## Libraries Used

-   [MongoDB](https://cloud.mongodb.com) used as database.
-   [ReactJS](https://reactjs.org/) used for the front end.
-   [Material-UI](https://mui.com/) used for the front end UI.
