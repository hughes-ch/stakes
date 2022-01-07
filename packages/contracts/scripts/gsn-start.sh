# 
#  Deploys the OpenGSN network on the local blockchain
# 
#  :copyright: Copyright (c) 2022 Chris Hughes
#  :license: MIT License
# 
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
GSN_DIR=${SCRIPT_DIR}/../build/gsn/
HOST=`node scripts/get-gsn-host.js`
PORT=`node scripts/get-gsn-port.js`
gsn start --workdir ${GSN_DIR} -l error -n "http://${HOST}:${PORT}" &
sleep 20
