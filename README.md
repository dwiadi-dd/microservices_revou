# Microservice System Overview
![micro](https://github.com/dwiadi-dd/microservices_revou/assets/156978380/8f0b3554-a95c-4a85-8b38-a4e63b2b6f24)

This system consists of four main services: User, Order Service, Product Service, and Message Service. These services interact with each other and with Rabbitmq, a distributed streaming platform.

## Services

### User

The User initiates the process by sending an Order Request to the Order Service.

### Order Service

The Order Service receives the Order Request from the User and checks the availability of the products in the order by making a REST call to the Product Service.

- If any product in the order is unavailable, the Order Service informs the User that the Order was not made.
- If all products are available, the Order Service publishes an order request (create-order) and an update stock (update-stock) message to Rabbitmq.

### Product Service

The Product Service checks the availability of the products in the order. If an update stock (update-stock) message is received from Rabbitmq, the Product Service updates the stock of the products.

### Message Service

The Message Service receives an Order Status (unpaid) message from Rabbitmq.

## Rabbitmq

Rabbitmq is used as a message broker to facilitate communication between services. It handles messages of types: create-order, cancel-order, paid-order, update-stock, and restore-canceled-item.

## API Endpoints

The system exposes several API endpoints as defined in the `openapi.yaml` file. Here are some of the key endpoints:

- POST `/orders/order`: Endpoint to create an order via Rabbitmq. The request body should contain an array of items, where each item has a `product_id` and a `quantity`.
- POST `/orders/paid`: Endpoint to mark an order as paid via Rabbitmq. The request body should contain an `order_id`.
- GET `/products`: Endpoint to retrieve a list of products. Each product has a `product_id`, `stocks`, `name`, and `price`.

Please refer to the `openapi.yaml` file for the full API specification.

## Sequence Diagram

The sequence of interactions between the services is illustrated in the following sequence diagram:

![mermaid-diagram-2024-05-31-011018](https://github.com/dwiadi-dd/microservices_revou/assets/156978380/d6c4037e-e99a-47f5-93f5-8f95ed5a9558)

