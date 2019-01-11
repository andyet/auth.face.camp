#! /bin/bash
helm package ~/Desktop/charts/node-app -d ~/charts &&\
helm repo index ~/charts --url https://andyet-helm-charts.storage.googleapis.com &&\
~/Desktop/sync-repo.sh ~/charts andyet-helm-charts