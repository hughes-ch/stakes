# 
#  Starts the local development server and backend
# 
#  :copyright: Copyright (c) 2022 Chris Hughes
#  :license: MIT License
# 
echo Starting deployment...

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BUILD_DIR=$SCRIPT_DIR/../packages/contracts/build
LINK_TO_BUILD=$SCRIPT_DIR/../packages/client/src/deployed-contracts
if [ -e $LINK_TO_BUILD ]
then
    rm -f $LINK_TO_BUILD
fi
ln -s $BUILD_DIR $LINK_TO_BUILD

yarn workspace @stakes/contracts truffle dev &
sleep 10

yarn workspace @stakes/contracts gsn-start
yarn workspace @stakes/contracts truffle migrate --network test

echo Starting server...
yarn workspace @stakes/client start > /dev/null
