#!/bin/bash
BRANCH=$( git rev-parse --abbrev-ref HEAD )

if [ "$1" == "" ]; then
  echo "** Usage: ${0} <s3-bucket>"
  exit 1
fi
S3_BUCKET=$1

if [ "$BRANCH" != "master" ] && [ "$S3_BUCKET" == "pokt.tools" ]; then
  echo "ERROR: Can only deploy master branch"
  exit 1
fi
 
# copy files to s3
docker run --rm -it \
  -v ~/.aws:/root/.aws \
  -v ~/dev/projects/itsnoproblem/pokt-calculator/ui/build:/root/build \
  amazon/aws-cli s3 sync --delete /root/build/ s3://$S3_BUCKET/

# invalidate all objects
# TODO: optimize this
docker run --rm -it \
  -v ~/.aws:/root/.aws \
  -v ~/dev/projects/itsnoproblem/pokt-calculator/ui/build:/root/build \
  amazon/aws-cli cloudfront create-invalidation --distribution-id E2W8XTDPTKZAVN --paths "/*"
