# 
#  Starts the local development server and backend
# 
#  :copyright: Copyright (c) 2022 Chris Hughes
#  :license: MIT License
# 
echo Starting deployment...
yarn workspace @stakes/contracts truffle dev &
sleep 10

yarn workspace @stakes/contracts gsn-start
yarn workspace @stakes/contracts truffle migrate --network test

echo Staring server...
yarn workspace @stakes/client start > /dev/null
