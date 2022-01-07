#
#  Runs unit tests on top of truffle develop and openGSN's local
#  development tools.
#
#  :copyright: Copyright (c) 2022 Chris Hughes
#  :license: MIT License
#
echo Discovering tests...
TESTS=`find . -name '*.test.js'`
echo Found tests:
for TEST in $TESTS
do
    echo "    ${TEST}"
done
echo ''

# Find tests with "it.only" mocha feature and only run that unit module
EXCLUSIVE_TESTS=`grep -l 'it.only' ${TESTS}`
if [ -n "$EXCLUSIVE_TESTS" ]
then
    echo "    ... but only executing '${EXCLUSIVE_TESTS}'"
    TESTS=$EXCLUSIVE_TESTS
fi

# Compile and check results
yarn truffle compile
if [ $? -ne 0 ]
then
    exit 1
fi

# Execute each test
for TEST in $TESTS
do
    echo Starting $TEST...
    yarn truffle dev > /dev/null &
    PID_TRUFFLE_DEV=$!
    sleep 10

    yarn gsn-start
    yarn truffle test $TEST --compile-none
    ERROR=$?

    pkill -f gsn
    kill $PID_TRUFFLE_DEV

    if [ $ERROR -gt 0 ]
    then
        RED='\033[0;31m'
        NC='\033[0m'
        echo -e "${RED}[ FAIL ]${NC} $TEST had errors"
        exit 1
    fi
done
