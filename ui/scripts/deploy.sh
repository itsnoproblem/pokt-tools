#!/bin/bash
BRANCH=$( git rev-parse --abbrev-ref HEAD )
ENV=$1

if [ "$ENV" == "" ]; then
  ENV="prod"
fi

if [ "$ENV" == "prod" ] && [ "$BRANCH" != "master" ]; then
  echo "ERROR: Can only deploy master branch"
  exit 1
fi

case $ENV in
"prod")
    S3_BUCKET="pokt.tools"
    CLOUDFRONT_DISTRO="E2W8XTDPTKZAVN"
  ;;
"test")
    S3_BUCKET="test.pokt.tools"
    CLOUDFRONT_DISTRO="EGW9OXS88D5WW"
esac

echo "Deploying to s3 bucket [$S3_BUCKET]..."

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
  amazon/aws-cli cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRO --paths "/*"