import { Request, Response, NextFunction } from 'express'

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', error)

  // Handle different types of errors
  if (error.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      error: error.message,
      status: 404
    })
  }

  if (error.message.includes('already exists')) {
    return res.status(409).json({
      success: false,
      error: error.message,
      status: 409
    })
  }

  if (error.message.includes('validation')) {
    return res.status(400).json({
      success: false,
      error: error.message,
      status: 400
    })
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    status: 500
  })
}
