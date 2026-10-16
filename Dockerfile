FROM nginx:alpine

# Copy website files into Nginx's document root
COPY index.html /usr/share/nginx/html/index.html
COPY pages/ /usr/share/nginx/html/pages/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY styles/ /usr/share/nginx/html/styles/