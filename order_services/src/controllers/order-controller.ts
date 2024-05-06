import express from 'express'
import { OrderService } from "../services/order-service";
import { CreateOrderRequest } from '../models/order-model';

export class OrderController {
    private orderService: OrderService

    constructor(orderService: OrderService) {
        this.orderService = orderService
    }

    getAllByUserId = async (req: express.Request, res: express.Response) => {
        try {
            const getAllOrdersResponse = await this.orderService.getAllByUserId(req.app.locals.userId as number)
            res.status(200).json({
                data: getAllOrdersResponse
            })
        } catch (e) {
            let errorMessage = "server error"

            if (e instanceof Error) {
                errorMessage = e.message
            }

            res.status(500).json({
                error: errorMessage
            })
        }
    }

    create = async (req: express.Request, res: express.Response) => {
        try {
            const createOrderRequest = req.body as CreateOrderRequest
            const createOrderResponse = await this.orderService.create(createOrderRequest, req.app.locals.userId as number)
            res.status(200).json({
                data: createOrderResponse
            })
        } catch (e) {
            let errorMessage = "server error"

            if (e instanceof Error) {
                errorMessage = e.message
            }

            res.status(500).json({
                error: errorMessage
            })
        }
    }
}