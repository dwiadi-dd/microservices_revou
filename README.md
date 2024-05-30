# Microservice System Overview

This system consists of four main services: User, Order Service, Product Service, and Message Service. These services interact with each other and with Kafka, a distributed streaming platform.

## Services

### User

The User initiates the process by sending an Order Request to the Order Service.

### Order Service

The Order Service receives the Order Request from the User and checks the availability of the products in the order by making a REST call to the Product Service.

- If any product in the order is unavailable, the Order Service informs the User that the Order was not made.
- If all products are available, the Order Service publishes an order request (create-order) and an update stock (update-stock) message to Kafka.

### Product Service

The Product Service checks the availability of the products in the order. If an update stock (update-stock) message is received from Kafka, the Product Service updates the stock of the products.

### Message Service

The Message Service receives an Order Status (unpaid) message from Kafka.

## Kafka

Kafka is used as a message broker to facilitate communication between services. It handles messages of types: create-order, cancel-order, paid-order, update-stock, and restore-canceled-item.

## API Endpoints

The system exposes several API endpoints as defined in the `openapi.yaml` file. Here are some of the key endpoints:

- POST `/orders/order`: Endpoint to create an order via Kafka. The request body should contain an array of items, where each item has a `product_id` and a `quantity`.
- POST `/orders/paid`: Endpoint to mark an order as paid via Kafka. The request body should contain an `order_id`.
- GET `/products`: Endpoint to retrieve a list of products. Each product has a `product_id`, `stocks`, `name`, and `price`.

Please refer to the `openapi.yaml` file for the full API specification.

## Sequence Diagram

The sequence of interactions between the services is illustrated in the following sequence diagram:

![Sequence Diagram](path/to/sequence_diagram.png)
