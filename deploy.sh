#!/bin/bash

CHECK_HEROKU=$(heroku --version 2> /dev/null)

if [ $? -eq 0 ]; then
    PROJECT="$1"
    if [ -z "$PROJECT" ]; then
        echo "You need to pass your project name as a parameter:"
        echo "   $0 <your-project-name>"
        echo "Available apps are:"
        echo `heroku apps | grep -v "==="`
        exit -1;
    fi
    if [ -d "$PROJECT" ]; then
        echo "Project is already cloned."
        cd $PROJECT
        git pull heroku master
        cd ..
    else
        heroku git:clone -a $PROJECT
    fi
    echo "Building front-end project..."
    cd delphi-oracle-frontend
    npm run build
    echo "Building back-end project..."
    cd ..
    cd delphi-oracle-backend
    npm run prepare-deploy
    cd ..
    rm -Rf $PROJECT/public $PROJECT/*.js $PROJECT/*.map $PROJECT/*.json $PROJECT/.gitignore $PROJECT/Procfile
    cp -rf delphi-oracle-backend/dist/* $PROJECT
    cp -rf delphi-oracle-backend/package*.json $PROJECT
    cp -rf delphi-oracle-frontend/dist $PROJECT/public
    echo "cd $PROJECT"
    cd $PROJECT
    git add .
    msg="$(node -e "var x=require('./package.json');console.log('Deployed version '+x.version)")"
    git commit -m "$msg"
    git push heroku master
    exit 0;
else
    echo "You need to install heroku first."
    exit -1;
fi

