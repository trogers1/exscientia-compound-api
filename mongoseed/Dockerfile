FROM mongo:latest
COPY seed.json /seed.json
CMD bash -c "sleep 2 && mongoimport --host mongodb --db exscientia --collection compounds --type json --file /seed.json --jsonArray"
