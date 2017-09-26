FROM node:8-onbuild

ENV PORT=443
EXPOSE 443

RUN npm run build