#!/bin/bash

DIGEST=$(cat $1 | openssl dgst -sha384 -binary | openssl base64 -A)

echo "sha384-$DIGEST"